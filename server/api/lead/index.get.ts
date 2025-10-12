import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { concessionarioId, status, tipoRichiesta, limit = 50, offset = 0 } = query

    if (!concessionarioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'concessionarioId è obbligatorio'
      })
    }

    console.log('📊 Recupero lead per concessionario:', concessionarioId)

    // Costruisci la query con filtri opzionali
    let queryBuilder = supabase
      .from('lead')
      .select('*')
      .eq('concessionario_id', concessionarioId)
      .order('created_at', { ascending: false })

    // Applica filtri se specificati
    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }
    
    if (tipoRichiesta) {
      queryBuilder = queryBuilder.eq('tipo_richiesta', tipoRichiesta)
    }

    // Applica limit e offset
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: leads, error: leadsError } = await queryBuilder

    if (leadsError) {
      console.error('❌ Errore recupero lead:', leadsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero dei lead',
        data: leadsError.message
      })
    }

    // Conta il totale dei lead per la paginazione
    let countQuery = supabase
      .from('lead')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', concessionarioId)

    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    
    if (tipoRichiesta) {
      countQuery = countQuery.eq('tipo_richiesta', tipoRichiesta)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('❌ Errore conteggio lead:', countError)
    }

    console.log('✅ Lead recuperati:', leads?.length || 0, 'di', count || 0)

    return {
      success: true,
      leads: leads || [],
      total: count || 0,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }

  } catch (error) {
    console.error('❌ Errore API recupero lead:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server durante il recupero dei lead',
      data: error.data || error.message
    })
  }
})






