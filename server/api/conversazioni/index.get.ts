import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { concessionarioId, status = 'attiva', limit = 50, offset = 0 } = query

    if (!concessionarioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'concessionarioId è obbligatorio'
      })
    }

    console.log('💬 Recupero conversazioni per concessionario:', concessionarioId)

    // Recupera le conversazioni
    const { data: conversazioni, error: convError } = await supabase
      .from('conversazioni')
      .select('*')
      .eq('concessionario_id', concessionarioId)
      .eq('status', status)
      .order('ultimo_messaggio_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (convError) {
      console.error('❌ Errore recupero conversazioni:', convError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero delle conversazioni',
        data: convError.message
      })
    }

    // Conta il totale per la paginazione
    const { count, error: countError } = await supabase
      .from('conversazioni')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', concessionarioId)
      .eq('status', status)

    if (countError) {
      console.error('❌ Errore conteggio conversazioni:', countError)
    }

    // Conta i messaggi non letti
    const unreadCount = conversazioni?.filter(c => !c.concessionario_ha_letto).length || 0

    console.log('✅ Conversazioni recuperate:', conversazioni?.length || 0, 'di', count || 0)
    console.log('📬 Messaggi non letti:', unreadCount)

    return {
      success: true,
      conversazioni: conversazioni || [],
      total: count || 0,
      unreadCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }

  } catch (error) {
    console.error('❌ Errore API recupero conversazioni:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})






