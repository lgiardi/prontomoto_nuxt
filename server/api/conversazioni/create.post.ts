import { createClient } from '@supabase/supabase-js'
import { sendNewConversationNotification, sendWelcomeEmailToCustomer } from '~/utils/emailService'

const config = useRuntimeConfig()
const supabaseUrl = config.public.supabaseUrl
const supabaseAnonKey = config.public.supabaseAnonKey
const supabaseServiceKey = config.supabaseServiceRoleKey

// Client con Service Key per bypassare RLS (se disponibile)
const supabase = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : createClient(supabaseUrl, supabaseAnonKey)

// Client admin per creazione utenti (solo se abbiamo la service key)
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('📥 Body ricevuto:', JSON.stringify(body, null, 2))
    
    const { 
      motoId, 
      motoUsataId,
      servizioId,
      concessionarioId, 
      motoMarca, 
      motoModello,
      servizioNome,
      clienteNome, 
      clienteEmail, 
      clienteTelefono, 
      messaggioIniziale
    } = body

    console.log('🔍 Dati estratti:', {
      motoId,
      motoUsataId,
      servizioId,
      concessionarioId,
      clienteNome,
      clienteEmail,
      hasMessaggio: !!messaggioIniziale
    })

    // Determina il tipo di richiesta
    let tipoRichiesta = 'moto_nuova'
    let titolo = ''
    let oggettoId = null

    if (motoUsataId) {
      tipoRichiesta = 'moto_usata'
      oggettoId = motoUsataId
      titolo = `Interessato a ${motoMarca} ${motoModello} (Usata)`
    } else if (servizioId) {
      tipoRichiesta = 'servizio'
      oggettoId = servizioId
      titolo = `Richiesta informazioni per ${servizioNome}`
    } else if (motoId) {
      tipoRichiesta = 'moto_nuova'
      oggettoId = motoId
      titolo = `Interessato a ${motoMarca} ${motoModello}`
    } else {
      // Se non c'è nessun ID specifico, crea comunque la conversazione
      tipoRichiesta = 'informazioni'
      titolo = `Richiesta informazioni`
    }

    // Validazione (oggettoId è opzionale, può essere null per richieste generiche)
    if (!concessionarioId || !clienteNome || !clienteEmail || !messaggioIniziale) {
      console.error('❌ Validazione fallita:', {
        concessionarioId: !!concessionarioId,
        clienteNome: !!clienteNome,
        clienteEmail: !!clienteEmail,
        messaggioIniziale: !!messaggioIniziale,
        oggettoId: oggettoId // Può essere null
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Campi obbligatori mancanti',
        data: {
          concessionarioId: !!concessionarioId,
          clienteNome: !!clienteNome,
          clienteEmail: !!clienteEmail,
          messaggioIniziale: !!messaggioIniziale
        }
      })
    }
    
    // Normalizza concessionarioId (assicurati che sia una stringa UUID)
    const normalizedConcessionarioId = String(concessionarioId).trim()
    
    console.log('✅ Validazione passata:', {
      tipoRichiesta,
      oggettoId,
      concessionarioId,
      normalizedConcessionarioId,
      tipoConcessionarioId: typeof concessionarioId,
      tipoNormalizzato: typeof normalizedConcessionarioId,
      clienteEmail
    })

    // Genera password casuale per l'account
    const generateRandomPassword = () => {
      return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
    }

    // Crea account automaticamente per il cliente
    let clienteId = null
    let passwordGenerata = null
    let accountCreato = false
    
    if (supabaseAdmin) {
      try {
        // Prova a creare direttamente l'account - se esiste già, otterremo un errore specifico
        passwordGenerata = generateRandomPassword()
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: clienteEmail,
          password: passwordGenerata,
          email_confirm: true,
          user_metadata: {
            nome: clienteNome,
            telefono: clienteTelefono
          }
        })

        if (authError) {
          // Se l'errore indica che l'utente esiste già, proviamo a recuperarlo
          if (authError.message?.includes('already') || authError.message?.includes('exists')) {
            // L'utente esiste già, cerca di recuperarlo (questo è più veloce di listUsers)
            try {
              // Usa una query più efficiente: prova a creare una sessione per ottenere l'ID
              // Alternativa: usa getUserByEmail se disponibile nella versione di Supabase
              const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
                page: 1,
                perPage: 1000
              })
              const existingUser = users?.find(user => user.email === clienteEmail)
              if (existingUser) {
                clienteId = existingUser.id
                console.log('✅ Account esistente trovato per:', clienteEmail)
                // Non inviare password se l'account esiste già
                passwordGenerata = null
              }
            } catch (lookupError) {
              console.warn('⚠️ Non è stato possibile recuperare l\'utente esistente:', lookupError)
              // Continua senza account
            }
          } else {
            console.error('❌ Errore creazione account:', authError)
          }
        } else if (authData?.user) {
          clienteId = authData.user.id
          accountCreato = true
          console.log('✅ Account creato automaticamente per:', clienteEmail)
          console.log('🔑 Password generata:', passwordGenerata)
        }
      } catch (accountError) {
        console.error('❌ Errore gestione account:', accountError)
        // Continua senza account se c'è un errore
      }
    } else {
      console.warn('⚠️ Service key non configurata, account non creato automaticamente')
    }

    console.log('💬 Creazione nuova conversazione:', {
      motoId,
      motoUsataId,
      servizioId,
      concessionarioId: normalizedConcessionarioId,
      motoMarca,
      motoModello,
      clienteNome,
      clienteEmail
    })
    
    // Verifica che il concessionario esista prima di creare la conversazione
    const { data: concessionarioCheck, error: dealerCheckError } = await supabase
      .from('concessionari')
      .select('id, nome, email')
      .eq('id', normalizedConcessionarioId)
      .maybeSingle()

    if (dealerCheckError) {
      console.error('❌ Errore verifica concessionario:', dealerCheckError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nella verifica del concessionario',
        data: dealerCheckError.message
      })
    }

    if (!concessionarioCheck) {
      console.error('❌ Concessionario non trovato con ID:', concessionarioId)
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato',
        data: { concessionarioId }
      })
    }

    console.log('✅ Concessionario verificato:', {
      id: concessionarioCheck.id,
      nome: concessionarioCheck.nome
    })

    // Prepara i dati per la conversazione
    const conversazioneData = {
      cliente_id: clienteId,
      cliente_email: clienteEmail,
      cliente_nome: clienteNome,
      cliente_telefono: clienteTelefono || null,
      concessionario_id: normalizedConcessionarioId,
      titolo: titolo,
      status: 'attiva',
      tipo_richiesta: tipoRichiesta
    }

    // Aggiungi i campi specifici in base al tipo
    if (tipoRichiesta === 'moto_nuova') {
      if (motoId) {
      conversazioneData.moto_id = motoId
      }
      if (motoMarca) {
      conversazioneData.moto_marca = motoMarca
      }
      if (motoModello) {
      conversazioneData.moto_modello = motoModello
      }
    } else if (tipoRichiesta === 'moto_usata') {
      if (motoUsataId) {
        // Verifica che la moto usata esista
        const { data: motoUsataCheck, error: motoUsataError } = await supabase
          .from('moto_usate')
          .select('id')
          .eq('id', motoUsataId)
          .maybeSingle()
        
        if (motoUsataError) {
          console.error('❌ Errore verifica moto usata:', motoUsataError)
        } else if (!motoUsataCheck) {
          console.warn('⚠️ Moto usata non trovata con ID:', motoUsataId)
        } else {
      conversazioneData.moto_usata_id = motoUsataId
        }
      }
      if (motoMarca) {
      conversazioneData.moto_marca = motoMarca
      }
      if (motoModello) {
      conversazioneData.moto_modello = motoModello
      }
    } else if (tipoRichiesta === 'servizio') {
      if (servizioId) {
      conversazioneData.servizio_concessionario_id = servizioId
      }
    }

    // Crea la conversazione
    console.log('💾 Tentativo creazione conversazione con dati:', JSON.stringify(conversazioneData, null, 2))
    
    const { data: conversazione, error: convError } = await supabase
      .from('conversazioni')
      .insert(conversazioneData)
      .select()
      .single()

    if (convError) {
      console.error('❌ Errore creazione conversazione:', convError)
      console.error('❌ Dettagli errore:', {
        message: convError.message,
        details: convError.details,
        hint: convError.hint,
        code: convError.code
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nella creazione della conversazione',
        data: {
          message: convError.message,
          details: convError.details,
          hint: convError.hint,
          code: convError.code
        }
      })
    }

    // Crea il messaggio iniziale
    console.log('💬 Creazione messaggio iniziale per conversazione:', conversazione.id)
    const messaggioData = {
      conversazione_id: conversazione.id,
      mittente_tipo: 'cliente',
      mittente_id: clienteId,
      mittente_nome: clienteNome,
      messaggio: messaggioIniziale
    }
    console.log('💬 Dati messaggio:', JSON.stringify(messaggioData, null, 2))
    
    const { data: messaggio, error: msgError } = await supabase
      .from('messaggi')
      .insert(messaggioData)
      .select()
      .single()

    if (msgError) {
      console.error('❌ Errore creazione messaggio iniziale:', msgError)
      console.error('❌ Dettagli errore messaggio:', {
        message: msgError.message,
        details: msgError.details,
        hint: msgError.hint,
        code: msgError.code
      })
      // Non bloccare il processo, la conversazione è già creata
    } else {
      console.log('✅ Messaggio iniziale creato:', messaggio.id)
      console.log('✅ Messaggio completo:', JSON.stringify(messaggio, null, 2))
      
      // Aggiorna conversazione con ultimo messaggio
      const preview = messaggioIniziale.length > 100 
        ? messaggioIniziale.substring(0, 100) + '...' 
        : messaggioIniziale
      
      const { error: updateConvError } = await supabase
        .from('conversazioni')
        .update({
          ultimo_messaggio_at: new Date().toISOString(),
          ultimo_messaggio_preview: preview,
          cliente_ha_letto: true,
          concessionario_ha_letto: false
        })
        .eq('id', conversazione.id)
      
      if (updateConvError) {
        console.error('⚠️ Errore aggiornamento conversazione con ultimo messaggio:', updateConvError)
      } else {
        console.log('✅ Conversazione aggiornata con ultimo messaggio')
      }
    }

    console.log('✅ Conversazione creata:', conversazione.id)

    // Se l'account è stato creato dopo la conversazione, aggiorna la conversazione con cliente_id
    if (accountCreato && clienteId && !conversazione.cliente_id) {
      console.log('🔄 Aggiornamento conversazione con cliente_id:', clienteId)
      const { error: updateError } = await supabase
        .from('conversazioni')
        .update({ cliente_id: clienteId })
        .eq('id', conversazione.id)
      
      if (updateError) {
        console.error('⚠️ Errore aggiornamento conversazione con cliente_id:', updateError)
      } else {
        console.log('✅ Conversazione aggiornata con cliente_id')
        conversazione.cliente_id = clienteId
      }
    }

    // Crea automaticamente un lead per questa conversazione
    try {
      const leadData: any = {
        conversazione_id: conversazione.id,
        concessionario_id: normalizedConcessionarioId, // Usa l'ID normalizzato
        nome_cliente: clienteNome,
        email_cliente: clienteEmail,
        telefono_cliente: clienteTelefono || null,
        messaggio: messaggioIniziale,
        tipo_richiesta: tipoRichiesta,
        status: 'new', // Usa 'new' invece di 'nuovo' per compatibilità con schema originale
        priorita: 'media',
        fonte: 'sito_web'
      }

      // Aggiungi i campi specifici in base al tipo di richiesta
      if (tipoRichiesta === 'moto_nuova' && motoId) {
        leadData.moto_id = motoId
        leadData.moto_marca = motoMarca || null
        leadData.moto_modello = motoModello || null
      } else if (tipoRichiesta === 'moto_usata' && motoUsataId) {
        // Per moto usate, moto_id può essere null se la tabella è stata estesa
        // Altrimenti usa un valore placeholder
        leadData.moto_id = motoId || 'moto_usata' // Placeholder se moto_id è obbligatorio
        leadData.moto_usata_id = motoUsataId
        leadData.moto_marca = motoMarca || null
        leadData.moto_modello = motoModello || null
      } else if (tipoRichiesta === 'servizio' && servizioId) {
        // Per servizi, moto_id può essere null se la tabella è stata estesa
        leadData.moto_id = null // Prova null, se fallisce useremo placeholder
        leadData.servizio_concessionario_id = servizioId
      } else {
        // Fallback: se non c'è nessun ID, usa un placeholder per moto_id
        leadData.moto_id = 'generico'
      }

      // Assicurati che l'ID del concessionario corrisponda esattamente all'ID verificato
      const concessionarioIdForLead = String(concessionarioCheck.id).trim()
      leadData.concessionario_id = concessionarioIdForLead
      
      console.log('📝 Dati lead da inserire:', JSON.stringify(leadData, null, 2))
      console.log('📝 ConcessionarioId per lead:', {
        originale: concessionarioId,
        normalizzato: normalizedConcessionarioId,
        idConcessionarioVerificato: concessionarioCheck.id,
        idFinaleUsato: concessionarioIdForLead,
        tipoNormalizzato: typeof normalizedConcessionarioId,
        tipoFinale: typeof concessionarioIdForLead,
        corrispondeConcessionario: String(normalizedConcessionarioId).trim() === String(concessionarioCheck.id).trim(),
        corrispondeFinale: concessionarioIdForLead === String(concessionarioCheck.id).trim()
      })
      
      const { data: lead, error: leadError } = await supabase
        .from('lead')
        .insert(leadData)
        .select()
        .single()

      if (leadError) {
        console.error('⚠️ Errore creazione lead automatico:', leadError)
        console.error('⚠️ Dettagli errore lead:', {
          message: leadError.message,
          details: leadError.details,
          hint: leadError.hint,
          code: leadError.code
        })
        console.error('⚠️ Dati che hanno causato l\'errore:', JSON.stringify(leadData, null, 2))
        
        // Se l'errore è dovuto a moto_id obbligatorio, prova con un valore placeholder
        if (leadError.code === '23502' && leadError.message?.includes('moto_id')) {
          console.log('🔄 Tentativo con moto_id placeholder...')
          leadData.moto_id = leadData.moto_id || 'generico'
          
          const { data: leadRetry, error: leadRetryError } = await supabase
            .from('lead')
            .insert(leadData)
            .select()
            .single()
          
          if (leadRetryError) {
            console.error('❌ Errore anche con retry:', leadRetryError)
          } else {
            console.log('✅ Lead creato con retry:', leadRetry.id)
          }
        }
        // Non bloccare il processo se il lead non viene creato
      } else {
        console.log('✅ Lead creato automaticamente:', lead.id)
        console.log('✅ Lead completo:', JSON.stringify(lead, null, 2))
      }
    } catch (leadError) {
      console.error('⚠️ Errore nella creazione automatica del lead:', leadError)
      // Non bloccare il processo se il lead non viene creato
    }

    // Recupera i dati del concessionario per l'email
    const { data: concessionario, error: dealerError } = await supabase
      .from('concessionari')
      .select('nome, email, citta')
      .eq('id', concessionarioId)
      .single()

    if (!dealerError && concessionario) {
      // Prepara la configurazione SMTP dal runtime config
      const emailConfig = {
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        smtpPass: config.smtpPass,
        smtpSenderName: config.smtpSenderName || 'ProntoMoto'
      }
      
      console.log('📧 Configurazione SMTP:', {
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort,
        user: emailConfig.smtpUser,
        senderName: emailConfig.smtpSenderName
      })
      
      // Invia email di notifica al concessionario
      try {
        console.log('📧 Invio email notifica al concessionario:', concessionario.email)
        const emailResult = await sendNewConversationNotification({
          ...conversazione,
          concessionario_nome: concessionario.nome,
          concessionario_email: concessionario.email,
          concessionario_citta: concessionario.citta,
          cliente_nome: clienteNome,
          cliente_email: clienteEmail,
          cliente_telefono: clienteTelefono,
          moto_marca: motoMarca || '',
          moto_modello: motoModello || ''
        }, messaggio, emailConfig)
        console.log('✅ Email di notifica inviata al concessionario:', emailResult?.messageId)
      } catch (emailError) {
        console.error('❌ Errore invio email al concessionario:', emailError)
        console.error('❌ Stack trace:', emailError.stack)
        // Non bloccare il processo se l'email fallisce
      }

      // Invia email di benvenuto al cliente con credenziali se account creato
      try {
        console.log('📧 Invio email benvenuto al cliente:', clienteEmail, accountCreato ? '(account creato)' : '(account esistente)')
        const welcomeEmailResult = await sendWelcomeEmailToCustomer({
          ...conversazione,
          concessionario_nome: concessionario.nome,
          concessionario_email: concessionario.email,
          concessionario_citta: concessionario.citta,
          cliente_nome: clienteNome,
          cliente_email: clienteEmail,
          cliente_telefono: clienteTelefono,
          moto_marca: motoMarca || '',
          moto_modello: motoModello || '',
          password: passwordGenerata, // Invia password solo se account creato
          account_creato: accountCreato
        }, messaggio, emailConfig)
        console.log('✅ Email di benvenuto inviata al cliente:', welcomeEmailResult?.messageId, accountCreato ? 'con credenziali' : 'senza credenziali (account esistente)')
      } catch (emailError) {
        console.error('❌ Errore invio email di benvenuto al cliente:', emailError)
        console.error('❌ Stack trace:', emailError.stack)
        // Non bloccare il processo se l'email fallisce
      }
    }

    return {
      success: true,
      conversazioneId: conversazione.id,
      message: 'Conversazione creata con successo'
    }

  } catch (error) {
    console.error('❌ Errore API creazione conversazione:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})
