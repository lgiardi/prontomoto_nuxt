import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { clienteEmail, clienteId = null, status = 'attiva', limit = 50, offset = 0 } = query

    // Se clienteId è fornito, usa quello, altrimenti usa l'email
    if (!clienteId && !clienteEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'clienteId o clienteEmail è obbligatorio'
      })
    }

    console.log('💬 Recupero conversazioni per cliente:', { clienteId, clienteEmail })

    let conversazioniQuery = supabase
      .from('conversazioni')
      .select(`
        *,
        concessionari!inner(
          id,
          nome,
          citta,
          telefono,
          email
        )
      `)
      .eq('status', status)
      .order('ultimo_messaggio_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtra per cliente
    if (clienteId) {
      conversazioniQuery = conversazioniQuery.eq('cliente_id', clienteId)
    } else {
      conversazioniQuery = conversazioniQuery.eq('cliente_email', clienteEmail)
    }

    const { data: conversazioni, error: convError } = await conversazioniQuery

    if (convError) {
      console.error('❌ Errore recupero conversazioni cliente:', convError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero delle conversazioni',
        data: convError.message
      })
    }

    // Conta il totale per la paginazione
    let countQuery = supabase
      .from('conversazioni')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    if (clienteId) {
      countQuery = countQuery.eq('cliente_id', clienteId)
    } else {
      countQuery = countQuery.eq('cliente_email', clienteEmail)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('❌ Errore conteggio conversazioni cliente:', countError)
    }

    // Conta i messaggi non letti dal cliente
    const unreadCount = conversazioni?.filter(c => !c.cliente_ha_letto).length || 0

    console.log('✅ Conversazioni cliente recuperate:', conversazioni?.length || 0, 'di', count || 0)
    console.log('📬 Messaggi non letti dal cliente:', unreadCount)

    return {
      success: true,
      conversazioni: conversazioni || [],
      total: count || 0,
      unreadCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }

  } catch (error) {
    console.error('❌ Errore API recupero conversazioni cliente:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})






