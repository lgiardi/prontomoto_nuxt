import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler, getRouterParam, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const motoId = getRouterParam(event, 'id')
    
    if (!motoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID moto mancante'
      })
    }

    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configurazione Supabase mancante'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Ottieni l'utente corrente dalla sessione
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token di autenticazione mancante'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Utente non autenticato'
      })
    }

    // Verifica che la moto esista e appartenga all'utente
    const { data: existingMoto, error: fetchError } = await supabase
      .from('moto_usate')
      .select('*')
      .eq('id', motoId)
      .eq('venditore_id', user.id)
      .single()

    if (fetchError || !existingMoto) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Moto non trovata o non autorizzato'
      })
    }

    // Elimina la moto usata
    const { error } = await supabase
      .from('moto_usate')
      .delete()
      .eq('id', motoId)
      .eq('venditore_id', user.id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nell\'eliminazione della moto usata: ' + error.message
      })
    }

    return {
      success: true,
      message: 'Moto usata eliminata con successo!'
    }

  } catch (error) {
    console.error('Errore API moto-usate DELETE:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})
