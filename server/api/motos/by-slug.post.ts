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
    
    // Cerca tutte le moto con tutti i campi tecnici
    const { data: motos, error: motosError } = await supabase
      .from('moto')
      .select('*')
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
        prezzo_speciale,
        disponibile,
        quantita,
        colore,
        promozioni,
        foto_principale,
        foto_gallery,
        note,
        moto_id,
        concessionari!inner(
          id,
          nome,
          citta,
          provincia,
          telefono,
          email,
          via
        )
      `)
      .eq('moto_id', motoTrovata.id.toString())
    
    if (concessionariError) {
      console.error(`Errore Supabase per concessionari moto ${motoTrovata.id}:`, concessionariError)
    }
    
    // Log dei dati recuperati per debug
    if (concessionari && concessionari.length > 0) {
      console.log('📊 Dati recuperati dal database per i concessionari:')
      concessionari.forEach((c, idx) => {
        console.log(`  Concessionario ${idx + 1}:`, {
          nome: c.concessionari?.nome,
          prezzo_speciale: c.prezzo_speciale,
          disponibile: c.disponibile,
          quantita: c.quantita,
          colore: c.colore,
          promozioni: c.promozioni,
          foto_principale: c.foto_principale ? 'presente' : 'null',
          foto_gallery: c.foto_gallery ? (Array.isArray(c.foto_gallery) ? `${c.foto_gallery.length} foto` : 'presente') : 'null',
          note: c.note ? 'presente' : 'null'
        })
      })
    }
    
    // Estrai le città uniche dai concessionari
    const cittaDisponibili = [...new Set(concessionari?.map(c => c.concessionari.citta) || [])]
    console.log('🏙️ Città disponibili per moto:', cittaDisponibili)
    console.log('🏢 Concessionari trovati:', concessionari?.length || 0)
    
    // Recupera i rating per ogni concessionario
    const concessionariConRating = await Promise.all(
      (concessionari || []).map(async (c) => {
        const { data: recensioni } = await supabase
          .from('recensioni_concessionari')
          .select('voto')
          .eq('concessionario_id', c.concessionari.id)
          .eq('status', 'approved')
        
        const numeroRecensioni = recensioni?.length || 0
        const ratingMedio = numeroRecensioni > 0
          ? recensioni.reduce((sum: number, r: any) => sum + r.voto, 0) / numeroRecensioni
          : 0
        
        return {
          ...c,
          rating_medio: Math.round(ratingMedio * 10) / 10,
          numero_recensioni: numeroRecensioni
        }
      })
    )
    
    // Trasforma i dati per il frontend con mappatura completa dei campi tecnici
    const motoData = {
      id: motoTrovata.id,
      marca: motoTrovata.marca,
      modello: motoTrovata.modello,
      allestimento: motoTrovata.allestimento,
      categoria: motoTrovata.categoria,
      cilindrata: motoTrovata.cilindrata,
      prezzo: motoTrovata.prezzo,
      potenza: motoTrovata.potenza,
      // Mappatura camelCase per il frontend
      pesoASecco: motoTrovata.peso_a_secco,
      peso_a_secco: motoTrovata.peso_a_secco, // Mantieni anche snake_case per compatibilità
      peso_in_ordine_di_marcia: motoTrovata.peso_in_ordine_di_marcia,
      alimentazione: motoTrovata.alimentazione,
      trasmissione: motoTrovata.trasmissione,
      frizione: motoTrovata.frizione,
      rapporti: motoTrovata.rapporti || null,
      lunghezza: motoTrovata.lunghezza,
      larghezza: motoTrovata.larghezza,
      altezza: motoTrovata.altezza,
      altezza_minima_da_terra: motoTrovata.altezza_minima_da_terra,
      altezza_sella_da_terra_min: motoTrovata.altezza_sella_da_terra_min,
      altezza_sella_da_terra_max: motoTrovata.altezza_sella_da_terra_max,
      interasse: motoTrovata.interasse,
      // Mappatura camelCase per freni
      frenoAnteriore: motoTrovata.freno_anteriore,
      freno_anteriore: motoTrovata.freno_anteriore,
      frenoPosteriore: motoTrovata.freno_posteriore,
      freno_posteriore: motoTrovata.freno_posteriore,
      abs: motoTrovata.abs,
      // Mappatura camelCase per ruote
      ruotaAnteriore: motoTrovata.ruota_anteriore,
      ruota_anteriore: motoTrovata.ruota_anteriore,
      ruotaPosteriore: motoTrovata.ruota_posteriore,
      ruota_posteriore: motoTrovata.ruota_posteriore,
      tipoRuote: motoTrovata.tipo_ruote,
      tipo_ruote: motoTrovata.tipo_ruote,
      // Mappatura camelCase per serbatoio e consumo
      capacitaSerbatoio: motoTrovata.capacita_serbatoio_carburante,
      capacita_serbatoio_carburante: motoTrovata.capacita_serbatoio_carburante,
      capacita_riserva_carburante: motoTrovata.capacita_riserva_carburante,
      consumo: motoTrovata.consumo_medio_vmtc,
      consumo_medio_vmtc: motoTrovata.consumo_medio_vmtc,
      // Colore (se presente nel DB)
      colore: motoTrovata.colore || motoTrovata.colori?.[0] || null,
      colori: motoTrovata.colori || [],
      anno_inizio_produzione: motoTrovata.anno_inizio_produzione,
      anno_fine_produzione: motoTrovata.anno_fine_produzione,
      garanzia: motoTrovata.garanzia,
      optional: motoTrovata.optional,
      immagineCopertina: motoTrovata.immagine_copertina,
      immaginiGallery: motoTrovata.immagini_gallery || [],
      isDisponibile: motoTrovata.is_disponibile,
      isPromozione: motoTrovata.is_promozione,
      link: motoTrovata.link,
      alesaggio: motoTrovata.alesaggio,
      corsa: motoTrovata.corsa,
      cilindri: motoTrovata.cilindri,
      configurazione_cilindri: motoTrovata.configurazione_cilindri,
      disposizione_cilindri: motoTrovata.disposizione_cilindri,
      inclinazione_cilindri: motoTrovata.inclinazione_cilindri,
      inclinazione_cilindri_av: motoTrovata.inclinazione_cilindri_av,
      raffreddamento: motoTrovata.raffreddamento,
      cittaSelezionata: citta || null, // Aggiungi la città selezionata
      cittaDisponibili: cittaDisponibili, // Aggiungi le città disponibili
      concessionari: concessionariConRating.map(c => ({
        id: c.concessionari.id,
        _id: c.concessionari.id, // Per compatibilità con il frontend
        nome: c.concessionari.nome,
        citta: c.concessionari.citta,
        provincia: c.concessionari.provincia,
        via: c.concessionari.via,
        telefono: c.concessionari.telefono,
        email: c.concessionari.email,
        prezzo_speciale: c.prezzo_speciale,
        disponibile: c.disponibile,
        quantita: c.quantita,
        colore: c.colore,
        promozioni: c.promozioni, // JSONB con le promozioni
        foto_principale: c.foto_principale,
        foto_gallery: c.foto_gallery, // JSONB array con le foto
        note: c.note,
        immagineUrl: c.foto_principale || null,
        rating_medio: c.rating_medio,
        numero_recensioni: c.numero_recensioni
      }))
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
