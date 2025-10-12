import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 Fetching all motos from Supabase with concessionari')

    // Carica tutte le moto disponibili
    const { data: motos, error: motosError } = await supabase
      .from('moto')
      .select(`
        id,
        sanity_id,
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
      console.error('❌ Error fetching motos:', motosError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error fetching motos from Supabase'
      })
    }

    console.log('✅ Motos fetched:', motos.length)

    // Per ogni moto, carica i concessionari associati
    const motosWithConcessionari = await Promise.all(
      motos.map(async (moto) => {
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
          console.error(`❌ Error fetching concessionari for moto ${moto.id}:`, concessionariError)
        }

        return {
          _id: moto.sanity_id,
          marca: moto.marca,
          modello: moto.modello,
          allestimento: moto.allestimento,
          categoria: moto.categoria,
          cilindrata: moto.cilindrata,
          prezzo: moto.prezzo,
          immagineUrl: moto.immagine_copertina,
          immaginiGallery: moto.immagini_gallery || [],
          isDisponibile: moto.is_disponibile,
          isPromozione: moto.is_promozione,
          concessionari: concessionari?.map(c => ({
            _id: c.concessionari.id,
            nome: c.concessionari.nome,
            citta: c.concessionari.citta,
            provincia: c.concessionari.provincia,
            telefono: c.concessionari.telefono,
            email: c.concessionari.email
          })) || []
        }
      })
    )

    console.log('✅ Motos with concessionari processed:', motosWithConcessionari.length)

    return motosWithConcessionari
  } catch (error) {
    console.error('❌ Error in motos API:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching motos from Supabase'
    })
  }
})
