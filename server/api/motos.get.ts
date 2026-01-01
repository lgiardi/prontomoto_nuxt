import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

export default defineEventHandler(async (event) => {
  
  try {
    console.log('🚀 API /api/motos chiamata')
    console.log('🔗 Supabase URL:', supabaseUrl)
    console.log('🔑 Supabase Key presente:', !!supabaseKey)
    
    // Recupera tutte le moto da Supabase
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
        immagine_copertina_original,
        is_disponibile,
        is_promozione
      `)
      .eq('is_disponibile', true)
    
    if (motosError) {
      console.error('❌ Errore Supabase nel recupero moto:', motosError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore del server durante il recupero delle moto.',
        data: motosError.message
      })
    }
    
    if (!motos || motos.length === 0) {
      console.warn('⚠️ Nessuna moto trovata nel database')
      return []
    }
    
    console.log('✅ Moto trovate:', motos.length)
    
    // Per ogni moto, recupera i concessionari associati
    const motosWithConcessionari = await Promise.all(
      motos.map(async (moto) => {
        try {
          // Prova con moto.id come stringa
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
            .eq('moto_id', moto.id.toString())
          
          if (concessionariError) {
            console.error(`❌ Errore Supabase per moto ${moto.id} (${moto.marca} ${moto.modello}):`, concessionariError)
            // Continua comunque senza concessionari
          }
          
          return {
            _id: moto.id, // Aggiungi _id per compatibilità
            id: moto.id,
            marca: moto.marca,
            modello: moto.modello,
            allestimento: moto.allestimento,
            categoria: moto.categoria,
            cilindrata: moto.cilindrata,
            prezzo: moto.prezzo,
            immagineUrl: moto.immagine_copertina,
            immaginiGallery: [], // Aggiungi per compatibilità
            concessionariCount: concessionari?.length || 0,
            concessionari: concessionari?.map(c => ({
              _id: c.concessionari.id, // Aggiungi _id per compatibilità
              id: c.concessionari.id,
              nome: c.concessionari.nome,
              citta: c.concessionari.citta,
              provincia: c.concessionari.provincia,
              telefono: c.concessionari.telefono,
              email: c.concessionari.email
            })) || []
          }
        } catch (error) {
          console.error(`❌ Errore nel processare moto ${moto.id}:`, error)
          // Restituisci la moto senza concessionari in caso di errore
          return {
            _id: moto.id,
            id: moto.id,
            marca: moto.marca,
            modello: moto.modello,
            allestimento: moto.allestimento,
            categoria: moto.categoria,
            cilindrata: moto.cilindrata,
            prezzo: moto.prezzo,
            immagineUrl: moto.immagine_copertina,
            immaginiGallery: [],
            concessionariCount: 0,
            concessionari: []
          }
        }
      })
    )
    
    console.log('✅ Moto con concessionari processate:', motosWithConcessionari.length)
    console.log('📊 Prima moto processata:', motosWithConcessionari[0])
    
    return motosWithConcessionari
    
  } catch (error) {
    console.error('Errore API motos:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore sconosciuto.',
      data: error.data || error.message
    })
  }
})