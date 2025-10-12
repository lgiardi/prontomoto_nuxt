import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Test update con alcuni campi
    const { data, error } = await supabase
      .from('concessionari')
      .update({
        descrizione: 'Test descrizione aggiornata',
        facebook: 'https://facebook.com/test',
        anno_fondazione: 2020
      })
      .eq('nome', 'GEMOTORS')
      .select()

    if (error) {
      console.error('Errore nel test update:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      message: 'Test update completato',
      data: data
    }

  } catch (error) {
    console.error('Errore nel test update:', error)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
})
