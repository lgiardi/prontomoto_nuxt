import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'

const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const concessionarioId = getRouterParam(event, 'concessionarioId')

    if (!concessionarioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID concessionario richiesto.'
      })
    }

    // Recupera le recensioni approvate per questo concessionario
    const { data: recensioni, error } = await supabase
      .from('recensioni_concessionari')
      .select('*')
      .eq('concessionario_id', concessionarioId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore recupero recensioni:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero delle recensioni.'
      })
    }

    // Calcola rating medio e numero recensioni
    const numeroRecensioni = recensioni?.length || 0
    const ratingMedio = numeroRecensioni > 0
      ? recensioni.reduce((sum, r) => sum + r.voto, 0) / numeroRecensioni
      : 0

    return {
      recensioni: recensioni || [],
      rating_medio: Math.round(ratingMedio * 10) / 10, // Arrotonda a 1 decimale
      numero_recensioni: numeroRecensioni
    }
  } catch (error: any) {
    console.error('Errore API recensioni:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore nel recupero delle recensioni.'
    })
  }
})

