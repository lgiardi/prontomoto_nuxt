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

    // Determina il tipo di richiesta
    let tipoRichiesta = 'moto_nuova'
    let titolo = ''
    let oggettoId = motoId

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
    }

    // Validazione
    if (!oggettoId || !concessionarioId || !clienteNome || !clienteEmail || !messaggioIniziale) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Campi obbligatori mancanti'
      })
    }

    // Genera password casuale per l'account
    const generateRandomPassword = () => {
      return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
    }

    // Crea account automaticamente per il cliente
    let clienteId = null
    if (supabaseAdmin) {
      try {
        // Prova a creare direttamente l'account - se esiste già, otterremo un errore specifico
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: clienteEmail,
            password: generateRandomPassword(),
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
            console.log('✅ Account creato automaticamente per:', clienteEmail)
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
      concessionarioId,
      motoMarca,
      motoModello,
      clienteNome,
      clienteEmail
    })

    // Prepara i dati per la conversazione
    const conversazioneData = {
      cliente_id: clienteId,
      cliente_email: clienteEmail,
      cliente_nome: clienteNome,
      cliente_telefono: clienteTelefono,
      concessionario_id: concessionarioId,
      titolo: titolo,
      status: 'attiva',
      tipo_richiesta: tipoRichiesta
    }

    // Aggiungi i campi specifici in base al tipo
    if (tipoRichiesta === 'moto_nuova') {
      conversazioneData.moto_id = motoId
      conversazioneData.moto_marca = motoMarca
      conversazioneData.moto_modello = motoModello
    } else if (tipoRichiesta === 'moto_usata') {
      conversazioneData.moto_usata_id = motoUsataId
      conversazioneData.moto_marca = motoMarca
      conversazioneData.moto_modello = motoModello
    } else if (tipoRichiesta === 'servizio') {
      conversazioneData.servizio_concessionario_id = servizioId
    }

    // Crea la conversazione
    const { data: conversazione, error: convError } = await supabase
      .from('conversazioni')
      .insert(conversazioneData)
      .select()
      .single()

    if (convError) {
      console.error('❌ Errore creazione conversazione:', convError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nella creazione della conversazione',
        data: convError.message
      })
    }

    // Crea il messaggio iniziale
    const { data: messaggio, error: msgError } = await supabase
      .from('messaggi')
      .insert({
        conversazione_id: conversazione.id,
        mittente_tipo: 'cliente',
        mittente_id: clienteId,
        mittente_nome: clienteNome,
        messaggio: messaggioIniziale
      })
      .select()
      .single()

    if (msgError) {
      console.error('❌ Errore creazione messaggio iniziale:', msgError)
      // Non bloccare il processo, la conversazione è già creata
    }

    console.log('✅ Conversazione creata:', conversazione.id)

    // Crea automaticamente un lead per questa conversazione
    try {
      const leadData: any = {
        conversazione_id: conversazione.id,
        concessionario_id: concessionarioId,
        nome_cliente: clienteNome,
        email_cliente: clienteEmail,
        telefono_cliente: clienteTelefono || null,
        messaggio: messaggioIniziale,
        tipo_richiesta: tipoRichiesta,
        status: 'nuovo',
        priorita: 'media',
        fonte: 'sito_web'
      }

      // Aggiungi i campi specifici in base al tipo di richiesta
      if (tipoRichiesta === 'moto_nuova' && motoId) {
        leadData.moto_id = motoId
        leadData.moto_marca = motoMarca || null
        leadData.moto_modello = motoModello || null
      } else if (tipoRichiesta === 'moto_usata' && motoUsataId) {
        leadData.moto_usata_id = motoUsataId
        leadData.moto_marca = motoMarca || null
        leadData.moto_modello = motoModello || null
      } else if (tipoRichiesta === 'servizio' && servizioId) {
        leadData.servizio_concessionario_id = servizioId
      }

      const { data: lead, error: leadError } = await supabase
        .from('lead')
        .insert(leadData)
        .select()
        .single()

      if (leadError) {
        console.error('⚠️ Errore creazione lead automatico:', leadError)
        // Non bloccare il processo se il lead non viene creato
      } else {
        console.log('✅ Lead creato automaticamente:', lead.id)
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
      // Invia email di notifica al concessionario
      try {
        await sendNewConversationNotification({
          ...conversazione,
          concessionario_nome: concessionario.nome,
          concessionario_email: concessionario.email,
          concessionario_citta: concessionario.citta
        }, messaggio, config)
        console.log('✅ Email di notifica inviata al concessionario')
      } catch (emailError) {
        console.error('❌ Errore invio email al concessionario:', emailError)
        // Non bloccare il processo se l'email fallisce
      }

      // Invia email di benvenuto al cliente
      try {
        await sendWelcomeEmailToCustomer({
          ...conversazione,
          concessionario_nome: concessionario.nome,
          concessionario_email: concessionario.email,
          concessionario_citta: concessionario.citta
        }, messaggio, config)
        console.log('✅ Email di benvenuto inviata al cliente')
      } catch (emailError) {
        console.error('❌ Errore invio email di benvenuto al cliente:', emailError)
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
