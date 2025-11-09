import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler, readBody, getHeader } from 'h3'
import { z } from 'zod'

// Schema di validazione
const motoUsataSchema = z.object({
  catalogo_id: z.string().uuid('ID catalogo non valido'),
  km: z.number().min(0, 'Chilometraggio deve essere positivo'),
  anno: z.number().min(1900).max(new Date().getFullYear() + 1, 'Anno non valido'),
  prezzo: z.number().min(0, 'Prezzo deve essere positivo'),
  condizione: z.enum(['ottima', 'buona', 'discreta', 'da-ristrutturare'], {
    errorMap: () => ({ message: 'Condizione non valida' })
  }),
  descrizione: z.string().optional(),
  foto: z.array(z.string()).default([]),
  venditore_type: z.enum(['concessionario', 'privato'], {
    errorMap: () => ({ message: 'Tipo venditore non valido' })
  })
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Valida i dati
    const validatedData = motoUsataSchema.parse(body)

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

    // Determina lo status in base al tipo di venditore
    const status = validatedData.venditore_type === 'concessionario' ? 'approved' : 'pending'

    // Prepara i dati per l'inserimento
    const motoUsataData = {
      catalogo_id: validatedData.catalogo_id,
      km: validatedData.km,
      anno: validatedData.anno,
      prezzo: validatedData.prezzo,
      condizione: validatedData.condizione,
      descrizione: validatedData.descrizione || null,
      foto: JSON.stringify(validatedData.foto),
      immagine_copertina: validatedData.foto.length > 0 ? validatedData.foto[0] : null,
      foto_gallery: JSON.stringify(validatedData.foto.slice(1)),
      venditore_id: user.id,
      venditore_type: validatedData.venditore_type,
      status: status
    }

    // Inserisci la moto usata
    const { data, error } = await supabase
      .from('moto_usate')
      .insert(motoUsataData)
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
        statusMessage: 'Errore nell\'inserimento della moto usata: ' + error.message
      })
    }

    return {
      success: true,
      message: validatedData.venditore_type === 'concessionario' 
        ? 'Moto usata inserita e approvata automaticamente!' 
        : 'Moto usata inserita e in attesa di approvazione.',
      data: {
        ...data,
        marca: data.moto_usate_catalogo?.marca,
        modello: data.moto_usate_catalogo?.modello
      }
    }

  } catch (error) {
    console.error('Errore API moto-usate POST:', error)
    
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
