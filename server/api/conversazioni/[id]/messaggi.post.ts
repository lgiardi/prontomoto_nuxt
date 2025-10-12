import { createClient } from '@supabase/supabase-js'
import { sendNewMessageToDealer, sendReplyToCustomer } from '~/utils/emailService'

const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)

export default defineEventHandler(async (event) => {
  try {
    const conversazioneId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { 
      messaggio, 
      mittenteTipo, // 'cliente' o 'concessionario'
      mittenteId = null, // ID del mittente (opzionale)
      mittenteNome 
    } = body

    if (!conversazioneId || !messaggio || !mittenteTipo || !mittenteNome) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Campi obbligatori mancanti'
      })
    }

    console.log('💬 Invio messaggio:', {
      conversazioneId,
      mittenteTipo,
      mittenteNome,
      messaggio: messaggio.substring(0, 50) + '...'
    })

    // Inserisci il messaggio
    const { data: nuovoMessaggio, error: msgError } = await supabase
      .from('messaggi')
      .insert({
        conversazione_id: conversazioneId,
        mittente_tipo: mittenteTipo,
        mittente_id: mittenteId,
        mittente_nome: mittenteNome,
        messaggio: messaggio
      })
      .select()
      .single()

    if (msgError) {
      console.error('❌ Errore invio messaggio:', msgError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nell\'invio del messaggio',
        data: msgError.message
      })
    }

    console.log('✅ Messaggio inviato:', nuovoMessaggio.id)

    // Recupera i dati della conversazione per l'email
    const { data: conversazione, error: convError } = await supabase
      .from('conversazioni')
      .select(`
        *,
        concessionari!inner(
          nome,
          email,
          citta
        )
      `)
      .eq('id', conversazioneId)
      .single()

    if (!convError && conversazione) {
      // Invia email di notifica al destinatario
      try {
        if (mittenteTipo === 'concessionario') {
          // Il concessionario ha risposto, notifica il cliente
          await sendReplyToCustomer({
            ...conversazione,
            concessionario_nome: conversazione.concessionari.nome,
            concessionario_email: conversazione.concessionari.email,
            concessionario_citta: conversazione.concessionari.citta
          }, nuovoMessaggio)
          console.log('✅ Email di risposta inviata al cliente')
        } else {
          // Il cliente ha risposto, notifica il concessionario
          await sendNewMessageToDealer({
            ...conversazione,
            concessionario_nome: conversazione.concessionari.nome,
            concessionario_email: conversazione.concessionari.email,
            concessionario_citta: conversazione.concessionari.citta
          }, nuovoMessaggio)
          console.log('✅ Email di nuovo messaggio inviata al concessionario')
        }
      } catch (emailError) {
        console.error('❌ Errore invio email:', emailError)
        // Non bloccare il processo se l'email fallisce
      }
    }

    return {
      success: true,
      messaggio: nuovoMessaggio,
      message: 'Messaggio inviato con successo'
    }

  } catch (error) {
    console.error('❌ Errore API invio messaggio:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})
