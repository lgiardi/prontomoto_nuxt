import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    // Recupera tutte le città uniche dai concessionari
    const { data: citta, error } = await supabase
      .from('concessionari')
      .select('citta')
      .not('citta', 'is', null)
    
    if (error) {
      console.error('Errore Supabase nel recupero città:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore del server durante il recupero delle città.',
        data: error.message
      })
    }
    
    // Estrai le città uniche e ordinale
    const cittaUniche = [...new Set(citta.map(c => c.citta))].sort()
    
    return cittaUniche
    
  } catch (error) {
    console.error('Errore API città:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore del server durante il recupero delle città.',
      data: error.message
    })
  }
})