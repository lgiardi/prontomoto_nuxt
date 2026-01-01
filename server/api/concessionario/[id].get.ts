import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'

const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const concessionarioId = getRouterParam(event, 'id')

    if (!concessionarioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID concessionario richiesto.'
      })
    }

    // Recupera info base del concessionario
    const { data: concessionario, error } = await supabase
      .from('concessionari')
      .select('id, nome, citta, provincia, via, telefono, email, status')
      .eq('id', concessionarioId)
      .single()

    if (error || !concessionario) {
      console.error('Errore recupero concessionario:', error)
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato.'
      })
    }

    // Verifica che il concessionario sia attivo
    if (concessionario.status !== 'active') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Concessionario non disponibile.'
      })
    }

    // Recupera rating medio e numero recensioni
    const { data: recensioni } = await supabase
      .from('recensioni_concessionari')
      .select('voto')
      .eq('concessionario_id', concessionarioId)
      .eq('status', 'approved')

    const numeroRecensioni = recensioni?.length || 0
    const ratingMedio = numeroRecensioni > 0
      ? recensioni.reduce((sum: number, r: any) => sum + r.voto, 0) / numeroRecensioni
      : 0

    return {
      id: concessionario.id,
      nome: concessionario.nome,
      citta: concessionario.citta,
      provincia: concessionario.provincia,
      via: concessionario.via,
      telefono: concessionario.telefono,
      email: concessionario.email,
      rating_medio: Math.round(ratingMedio * 10) / 10,
      numero_recensioni: numeroRecensioni
    }
  } catch (error: any) {
    console.error('Errore API concessionario:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore nel recupero del concessionario.'
    })
  }
})

