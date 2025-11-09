import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

// Funzione per creare slug da marca, modello e ID (o anno per unicità)
export function createSlug(marca: string, modello: string, id?: string, anno?: number): string {
  if (!marca || !modello) return ''
  
  const marcaSlug = marca.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  const modelloSlug = modello.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  
  // Usa gli ultimi 8 caratteri dell'ID o l'anno per rendere univoco
  const uniquePart = anno ? anno.toString() : (id ? id.substring(id.length - 8) : '')
  
  return uniquePart ? `${marcaSlug}-${modelloSlug}-${uniquePart}` : `${marcaSlug}-${modelloSlug}`
}

// Funzione per estrarre ID da slug
function extractIdFromSlug(slug: string): string | null {
  // Lo slug potrebbe essere: marca-modello-anno o marca-modello-id
  const parts = slug.split('-')
  if (parts.length < 2) return null
  
  // L'ultima parte potrebbe essere l'anno o l'ID
  const lastPart = parts[parts.length - 1]
  
  // Se è un numero a 4 cifre, è probabilmente un anno
  if (/^\d{4}$/.test(lastPart)) {
    return null // Non possiamo estrarre l'ID solo dall'anno
  }
  
  // Altrimenti cerca per marca e modello
  return null
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { slug } = body
    
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug richiesto'
      })
    }
    
    console.log('🔍 Cerca moto usata per slug:', slug)
    
    // Cerca tutte le moto usate approvate
    const { data: motoUsate, error: motoError } = await supabase
      .from('moto_usate')
      .select(`
        *,
        moto_usate_catalogo (
          marca,
          modello
        )
      `)
      .eq('status', 'approved')
    
    if (motoError) {
      console.error('❌ Errore Supabase nel recupero moto usate:', motoError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore del server durante il recupero delle moto usate.',
        data: motoError.message
      })
    }
    
    // Trova la moto che corrisponde allo slug
    const motoTrovata = motoUsate?.find(moto => {
      const marca = moto.moto_usate_catalogo?.marca || moto.marca
      const modello = moto.moto_usate_catalogo?.modello || moto.modello
      const motoSlug = createSlug(marca, modello, moto.id, moto.anno)
      
      return motoSlug === slug || slug === moto.id
    })
    
    if (!motoTrovata) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Moto usata non trovata'
      })
    }
    
    console.log('✅ Moto trovata:', motoTrovata.moto_usate_catalogo?.marca, motoTrovata.moto_usate_catalogo?.modello)
    
    // Recupera informazioni venditore
    let venditore = null
    
    if (motoTrovata.venditore_type === 'concessionario') {
      const { data: concessionario, error: concError } = await supabase
        .from('concessionari')
        .select('id, nome, email, telefono, citta, provincia, via, descrizione')
        .eq('id', motoTrovata.venditore_id)
        .single()
      
      if (!concError && concessionario) {
        venditore = {
          id: concessionario.id,
          nome: concessionario.nome,
          email: concessionario.email,
          telefono: concessionario.telefono,
          citta: concessionario.citta,
          provincia: concessionario.provincia,
          via: concessionario.via,
          descrizione: concessionario.descrizione,
          tipo: 'concessionario'
        }
      }
    } else if (motoTrovata.venditore_type === 'privato') {
      venditore = {
        id: motoTrovata.venditore_id,
        nome: motoTrovata.venditore_nome || 'Venditore privato',
        email: motoTrovata.venditore_email || null,
        telefono: motoTrovata.venditore_telefono || null,
        tipo: 'privato'
      }
    }
    
    const marca = motoTrovata.moto_usate_catalogo?.marca || motoTrovata.marca
    const modello = motoTrovata.moto_usate_catalogo?.modello || motoTrovata.modello
    const categoria = motoTrovata.categoria || null // categoria nella tabella moto_usate
    
    // Costruisci oggetto risposta (stesso formato dell'API [id].get.ts ma senza success wrapper)
    const motoData = {
      id: motoTrovata.id,
      marca: marca,
      modello: modello,
      categoria: categoria,
      anno: motoTrovata.anno,
      km: motoTrovata.km,
      condizione: motoTrovata.condizione,
      prezzo: motoTrovata.prezzo,
      descrizione: motoTrovata.descrizione,
      foto: motoTrovata.foto && Array.isArray(motoTrovata.foto) ? motoTrovata.foto : (motoTrovata.foto ? [motoTrovata.foto] : []),
      venditore: venditore,
      venditore_type: motoTrovata.venditore_type,
      created_at: motoTrovata.created_at,
      updated_at: motoTrovata.updated_at
    }
    
    return motoData
    
  } catch (error) {
    console.error('❌ Errore API moto-usate by-slug:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server durante il recupero della moto usata.',
      data: error.data || error.message
    })
  }
})


