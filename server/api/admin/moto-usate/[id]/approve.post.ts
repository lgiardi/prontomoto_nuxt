import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'

// Schema di validazione
const approveSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status deve essere approved o rejected' })
  }),
  motivo: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const motoId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!motoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID moto mancante'
      })
    }

    // Valida i dati
    const validatedData = approveSchema.parse(body)

    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configurazione Supabase mancante'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verifica che la moto esista
    const { data: existingMoto, error: fetchError } = await supabase
      .from('moto_usate')
      .select(`
        *,
        moto_usate_catalogo (
          marca,
          modello,
          categoria
        )
      `)
      .eq('id', motoId)
      .single()

    if (fetchError || !existingMoto) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Moto non trovata'
      })
    }

    // Aggiorna lo status della moto
    const { data, error } = await supabase
      .from('moto_usate')
      .update({
        status: validatedData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', motoId)
      .select(`
        *,
        moto_usate_catalogo (
          marca,
          modello,
          categoria,
          cilindrata,
          immagine_copertina
        )
      `)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nell\'aggiornamento dello status: ' + error.message
      })
    }

    return {
      success: true,
      message: `Moto ${validatedData.status === 'approved' ? 'approvata' : 'rifiutata'} con successo!`,
      data: {
        ...data,
        marca: data.moto_usate_catalogo?.marca,
        modello: data.moto_usate_catalogo?.modello,
        categoria: data.moto_usate_catalogo?.categoria,
        cilindrata: data.moto_usate_catalogo?.cilindrata,
        immagine_copertina: data.moto_usate_catalogo?.immagine_copertina
      }
    }

  } catch (error) {
    console.error('Errore API admin approve moto-usate:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dati non validi: ' + error.errors.map(e => e.message).join(', ')
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})
