import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { motoId, userId } = body

    if (!motoId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'MotoId e UserId sono richiesti'
      })
    }

    // Usa la service role key per bypassare RLS
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceRoleKey

    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configurazione Supabase mancante'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Prima verifica che il concessionario esista e sia attivo
    const { data: concessionario, error: dealerError } = await supabase
      .from('concessionari')
      .select('id, nome, status')
      .eq('user_id', userId)
      .single()

    if (dealerError || !concessionario) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato'
      })
    }

    // Verifica che il concessionario sia attivo
    if (concessionario.status !== 'active') {
      throw createError({
        statusCode: 403,
        statusMessage: `Concessionario non attivo. Status attuale: ${concessionario.status}. Contatta il supporto per attivare il tuo account.`
      })
    }

    // Verifica che il record moto_concessionari esista e appartenga al concessionario
    const { data: existingRecord, error: checkError } = await supabase
      .from('moto_concessionari')
      .select('*')
      .eq('id', motoId)
      .eq('concessionario_id', concessionario.id)
      .single()

    if (checkError || !existingRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Record moto_concessionari non trovato o non autorizzato'
      })
    }

    // Elimina il record
    const { data, error } = await supabase
      .from('moto_concessionari')
      .delete()
      .eq('id', motoId)
      .eq('concessionario_id', concessionario.id)
      .select()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nell\'eliminazione: ' + error.message
      })
    }

    if (!data || data.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nessun record eliminato'
      })
    }

    return {
      success: true,
      message: 'Moto eliminata con successo',
      deletedRecord: data[0]
    }

  } catch (error) {
    console.error('Errore nell\'eliminazione moto:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server: ' + error.message
    })
  }
})
