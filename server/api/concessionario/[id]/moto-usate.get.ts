import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

// Helper per parsare campo foto
const parseFoto = (foto: any): string[] => {
  if (!foto) return []
  if (Array.isArray(foto)) return foto.filter(url => url && typeof url === 'string')
  if (typeof foto === 'string') {
    try {
      const parsed = JSON.parse(foto)
      return Array.isArray(parsed) ? parsed.filter(url => url && typeof url === 'string') : []
    } catch {
      return []
    }
  }
  return []
}

export default defineEventHandler(async (event) => {
  try {
    const concessionarioId = getRouterParam(event, 'id')

    if (!concessionarioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID concessionario richiesto.'
      })
    }

    // Prima recupera il user_id del concessionario (venditore_id corrisponde a user_id, non id)
    const { data: concessionario, error: concError } = await supabase
      .from('concessionari')
      .select('id, user_id')
      .eq('id', concessionarioId)
      .single()

    if (concError || !concessionario) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato.'
      })
    }

    const userId = concessionario.user_id

    // Recupera le moto usate di questo concessionario
    // venditore_id corrisponde a user_id del concessionario
    const { data: motoUsate, error } = await supabaseService
      .from('moto_usate')
      .select(`
        *,
        moto_usate_catalogo (
          marca,
          modello
        )
      `)
      .eq('venditore_id', userId)
      .eq('venditore_type', 'concessionario')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore recupero moto usate:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero delle moto usate.'
      })
    }

    if (!motoUsate || motoUsate.length === 0) {
      return []
    }

    // Trasforma i dati per il frontend
    const motoUsateFormatted = motoUsate.map(moto => {
      const fotoArray = parseFoto(moto.foto)
      
      return {
        id: moto.id,
        catalogo_id: moto.catalogo_id,
        marca: moto.moto_usate_catalogo?.marca || moto.marca || 'N/A',
        modello: moto.moto_usate_catalogo?.modello || moto.modello || 'N/A',
        categoria: moto.categoria,
        km: moto.km,
        anno: moto.anno,
        prezzo: moto.prezzo,
        foto: fotoArray,
        immagineUrl: fotoArray[0] || null,
        immaginiGallery: fotoArray,
        descrizione: moto.descrizione,
        venditore_id: moto.venditore_id,
        venditore_type: moto.venditore_type,
        venditore_citta: moto.citta || null, // La città viene dal concessionario
        status: moto.status,
        created_at: moto.created_at,
        updated_at: moto.updated_at
      }
    })

    return motoUsateFormatted
  } catch (error: any) {
    console.error('Errore API moto usate concessionario:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore nel recupero delle moto usate.'
    })
  }
})

