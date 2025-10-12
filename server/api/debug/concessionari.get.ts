import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    
    // Estrai tutti i dati dalla tabella concessionari
    const { data: concessionari, error } = await supabase
      .from('concessionari')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore nel caricamento concessionari:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    console.log('📊 Concessionari trovati:', concessionari?.length || 0)
    
    return {
      success: true,
      count: concessionari?.length || 0,
      data: concessionari
    }

  } catch (error) {
    console.error('Errore nel debug concessionari:', error)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
})
