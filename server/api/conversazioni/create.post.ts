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
      concessionarioId, 
      motoMarca, 
      motoModello,
      clienteNome, 
      clienteEmail, 
      clienteTelefono, 
      messaggioIniziale
    } = body

    // Validazione
    if (!motoId || !concessionarioId || !clienteNome || !clienteEmail || !messaggioIniziale) {
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
        // Prima controlla se l'utente esiste già
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(user => user.email === clienteEmail)
        
        if (existingUser) {
          clienteId = existingUser.id
          console.log('✅ Account esistente trovato per:', clienteEmail)
        } else {
          // Crea nuovo account
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
            console.error('❌ Errore creazione account:', authError)
          } else if (authData?.user) {
            clienteId = authData.user.id
            console.log('✅ Account creato automaticamente per:', clienteEmail)
          }
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

    // Crea la conversazione
    const { data: conversazione, error: convError } = await supabase
      .from('conversazioni')
      .insert({
        cliente_id: clienteId,
        cliente_email: clienteEmail,
        cliente_nome: clienteNome,
        cliente_telefono: clienteTelefono,
        concessionario_id: concessionarioId,
        moto_id: motoId,
        moto_marca: motoMarca,
        moto_modello: motoModello,
        titolo: `Interessato a ${motoMarca} ${motoModello}`,
        status: 'attiva'
      })
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
