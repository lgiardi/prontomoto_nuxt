import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler, readBody, getRouterParam, getHeader } from 'h3'
import { z } from 'zod'

// Schema di validazione per l'aggiornamento
const motoUsataUpdateSchema = z.object({
  km: z.number().min(0, 'Chilometraggio deve essere positivo').optional(),
  anno: z.number().min(1900).max(new Date().getFullYear() + 1, 'Anno non valido').optional(),
  prezzo: z.number().min(0, 'Prezzo deve essere positivo').optional(),
  condizione: z.enum(['ottima', 'buona', 'discreta', 'da-ristrutturare']).optional(),
  descrizione: z.string().optional(),
  foto: z.array(z.string()).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
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
    const validatedData = motoUsataUpdateSchema.parse(body)

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

    // Prepara i dati per l'aggiornamento
    const updateData: any = {}
    
    if (validatedData.km !== undefined) updateData.km = validatedData.km
    if (validatedData.anno !== undefined) updateData.anno = validatedData.anno
    if (validatedData.prezzo !== undefined) updateData.prezzo = validatedData.prezzo
    if (validatedData.condizione !== undefined) updateData.condizione = validatedData.condizione
    if (validatedData.descrizione !== undefined) updateData.descrizione = validatedData.descrizione
    if (validatedData.foto !== undefined) {
      updateData.foto = JSON.stringify(validatedData.foto)
      updateData.immagine_copertina = validatedData.foto.length > 0 ? validatedData.foto[0] : null
      updateData.foto_gallery = JSON.stringify(validatedData.foto.slice(1))
    }
    
    // Solo admin può cambiare lo status
    if (validatedData.status !== undefined) {
      // Verifica se l'utente è admin (service role)
      const { data: { user: adminUser } } = await supabase.auth.getUser()
      if (adminUser?.role === 'service_role') {
        updateData.status = validatedData.status
      }
    }

    // Aggiorna la moto usata
    const { data, error } = await supabase
      .from('moto_usate')
      .update(updateData)
      .eq('id', motoId)
      .eq('venditore_id', user.id)
      .select(`
        *,
        moto_usate_catalogo (
          marca,
          modello
        )
      `)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nell\'aggiornamento della moto usata: ' + error.message
      })
    }

    return {
      success: true,
      message: 'Moto usata aggiornata con successo!',
      data: {
        ...data,
        marca: data.moto_usate_catalogo?.marca,
        modello: data.moto_usate_catalogo?.modello
      }
    }

  } catch (error) {
    console.error('Errore API moto-usate PUT:', error)
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dati non validi: ' + (error.errors?.map(e => e.message).join(', ') || 'Errore di validazione')
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})
