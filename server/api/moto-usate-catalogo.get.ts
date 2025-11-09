import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'

    if (!supabaseUrl || !supabaseAnonKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configurazione Supabase mancante'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Ottieni il catalogo moto usate
    const { data: catalogo, error } = await supabase
      .from('moto_usate_catalogo')
      .select('*')
      .order('marca', { ascending: true })
      .order('modello', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel caricamento del catalogo: ' + error.message
      })
    }

    return {
      success: true,
      data: catalogo || []
    }

  } catch (error) {
    console.error('Errore API moto-usate-catalogo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})
