import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

// Funzione per convertire categoria in slug URL
function categoryToSlug(categoria: string): string {
  if (!categoria) return 'moto'
  
  const categoryMap: Record<string, string> = {
    'Naked': 'naked',
    'Scooter Ruote alte': 'scooter',
    'Scooter Ruote basse': 'scooter',
    'Turismo': 'turismo',
    'Sportive': 'sportive',
    'Enduro Stradale': 'enduro',
    'Adventure': 'adventure',
    'Cruiser': 'cruiser',
    'Touring': 'touring'
  }
  
  return categoryMap[categoria] || 'moto'
}

// Funzione per creare slug da marca e modello
function createSlug(marca: string, modello: string): string {
  if (!marca || !modello) return ''
  
  const marcaSlug = marca.toLowerCase().replace(/\s+/g, '-')
  const modelloSlug = modello.toLowerCase().replace(/\s+/g, '-')
  
  return `${marcaSlug}-${modelloSlug}`
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { categoria, slug, citta } = body
    
    if (!categoria || !slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Categoria e slug sono richiesti'
      })
    }
    
    console.log('Cerca moto per:', { categoria, slug, citta })
    
    // Cerca tutte le moto
    const { data: motos, error: motosError } = await supabase
      .from('moto')
      .select(`
        id,
        marca,
        modello,
        allestimento,
        categoria,
        cilindrata,
        prezzo,
        immagine_copertina,
        immagini_gallery,
        is_disponibile,
        is_promozione
      `)
      .eq('is_disponibile', true)
    
    if (motosError) {
      console.error('Errore Supabase nel recupero moto:', motosError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore del server durante il recupero delle moto.',
        data: motosError.message
      })
    }
    
    // Trova la moto che corrisponde alla categoria e slug
    const motoTrovata = motos.find(moto => {
      const motoCategoria = moto.categoria?.toLowerCase().replace(/\s+/g, '-') || 'moto'
      const motoSlug = createSlug(moto.marca, moto.modello)
      
      console.log('Checking moto:', { 
        motoCategoria, 
        motoSlug, 
        categoria, 
        slug,
        match: motoCategoria === categoria && motoSlug === slug
      })
      
      return motoCategoria === categoria && motoSlug === slug
    })
    
    if (!motoTrovata) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Moto non trovata'
      })
    }
    
    // Recupera TUTTI i concessionari associati (non filtrati per città)
    const { data: concessionari, error: concessionariError } = await supabase
      .from('moto_concessionari')
      .select(`
        concessionario_id,
        concessionari!inner(
          id,
          nome,
          citta,
          provincia,
          telefono,
          email
        )
      `)
      .eq('moto_id', motoTrovata.id.toString())
    
    if (concessionariError) {
      console.error(`Errore Supabase per concessionari moto ${motoTrovata.id}:`, concessionariError)
    }
    
    // Estrai le città uniche dai concessionari
    const cittaDisponibili = [...new Set(concessionari?.map(c => c.concessionari.citta) || [])]
    console.log('🏙️ Città disponibili per moto:', cittaDisponibili)
    console.log('🏢 Concessionari trovati:', concessionari?.length || 0)
    
    // Trasforma i dati per il frontend
    const motoData = {
      id: motoTrovata.id,
      marca: motoTrovata.marca,
      modello: motoTrovata.modello,
      allestimento: motoTrovata.allestimento,
      categoria: motoTrovata.categoria,
      cilindrata: motoTrovata.cilindrata,
      prezzo: motoTrovata.prezzo,
      immagineCopertina: motoTrovata.immagine_copertina,
      immaginiGallery: motoTrovata.immagini_gallery || [],
      isDisponibile: motoTrovata.is_disponibile,
      isPromozione: motoTrovata.is_promozione,
      cittaSelezionata: citta || null, // Aggiungi la città selezionata
      cittaDisponibili: cittaDisponibili, // Aggiungi le città disponibili
      concessionari: concessionari?.map(c => ({
        id: c.concessionari.id,
        nome: c.concessionari.nome,
        citta: c.concessionari.citta,
        provincia: c.concessionari.provincia,
        telefono: c.concessionari.telefono,
        email: c.concessionari.email,
        immagineUrl: null // Colonna immagine non disponibile
      })) || []
    }
    
    return motoData
    
  } catch (error) {
    console.error('Errore API moto by slug:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore del server durante il recupero della moto.',
      data: error.message
    })
  }
})
