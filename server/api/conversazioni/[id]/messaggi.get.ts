import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const conversazioneId = getRouterParam(event, 'id')
    const query = getQuery(event)
    const { limit = 50, offset = 0 } = query

    if (!conversazioneId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID conversazione è obbligatorio'
      })
    }

    console.log('💬 Recupero messaggi per conversazione:', conversazioneId)

    // Recupera i messaggi
    const { data: messaggi, error: msgError } = await supabase
      .from('messaggi')
      .select('*')
      .eq('conversazione_id', conversazioneId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (msgError) {
      console.error('❌ Errore recupero messaggi:', msgError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero dei messaggi',
        data: msgError.message
      })
    }

    // Recupera anche i dettagli della conversazione
    const { data: conversazione, error: convError } = await supabase
      .from('conversazioni')
      .select('*')
      .eq('id', conversazioneId)
      .single()

    if (convError) {
      console.error('❌ Errore recupero conversazione:', convError)
    }

    console.log('✅ Messaggi recuperati:', messaggi?.length || 0)

    return {
      success: true,
      messaggi: messaggi || [],
      conversazione: conversazione || null
    }

  } catch (error) {
    console.error('❌ Errore API recupero messaggi:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})






