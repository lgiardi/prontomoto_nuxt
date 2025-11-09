import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'

const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { categoria, limit = 100, offset = 0 } = query

    console.log('📋 Recupero catalogo servizi...', { categoria, limit, offset })

    let queryBuilder = supabase
      .from('servizi_catalogo')
      .select('*')
      .order('nome', { ascending: true })
      .range(offset, offset + limit - 1)

    // Filtro per categoria se specificata
    if (categoria) {
      queryBuilder = queryBuilder.eq('categoria', categoria)
    }

    const { data: servizi, error } = await queryBuilder

    if (error) {
      console.error('❌ Errore recupero catalogo servizi:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero del catalogo servizi',
        data: error.message
      })
    }

    console.log('✅ Servizi trovati nel catalogo:', servizi?.length || 0)
    if (servizi && servizi.length > 0) {
      console.log('📋 Esempi servizi:', servizi.slice(0, 3).map(s => ({ id: s.id, nome: s.nome, categoria: s.categoria })))
    } else {
      console.warn('⚠️ Nessun servizio trovato nel catalogo! Verifica che la tabella servizi_catalogo contenga dati.')
    }

    // Conta il totale per la paginazione
    let countQuery = supabase
      .from('servizi_catalogo')
      .select('*', { count: 'exact', head: true })

    if (categoria) {
      countQuery = countQuery.eq('categoria', categoria)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('❌ Errore conteggio servizi:', countError)
    }

    // Raggruppa per categoria per statistiche
    const categorie = [...new Set(servizi?.map(s => s.categoria) || [])].sort()

    console.log('✅ Catalogo servizi recuperato:', servizi?.length || 0, 'servizi')

    return {
      success: true,
      data: servizi || [],
      meta: {
        total: count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        categorie
      }
    }

  } catch (error) {
    console.error('❌ Errore API catalogo servizi:', error)
    return {
      success: false,
      error: error.message || 'Errore nel recupero del catalogo servizi'
    }
  }
})
