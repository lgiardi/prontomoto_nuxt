import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'

const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const concessionarioId = getRouterParam(event, 'id')

    if (!concessionarioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID concessionario richiesto.'
      })
    }

    // Recupera tutte le moto associate a questo concessionario
    const { data: motoConcessionari, error: motoConcessionariError } = await supabase
      .from('moto_concessionari')
      .select(`
        moto_id,
        prezzo_speciale,
        disponibile,
        quantita,
        colore,
        promozioni,
        foto_principale,
        foto_gallery,
        note
      `)
      .eq('concessionario_id', concessionarioId)
      .eq('disponibile', true)

    if (motoConcessionariError) {
      console.error('Errore recupero moto concessionario:', motoConcessionariError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero delle moto.'
      })
    }

    if (!motoConcessionari || motoConcessionari.length === 0) {
      return []
    }

    // Recupera i dettagli delle moto
    const motoIds = motoConcessionari.map(mc => mc.moto_id)
    const { data: motos, error: motosError } = await supabase
      .from('moto')
      .select('*')
      .in('id', motoIds)
      .eq('is_disponibile', true)

    if (motosError) {
      console.error('Errore recupero moto:', motosError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero delle moto.'
      })
    }

    if (!motos || motos.length === 0) {
      return []
    }

    // Crea una mappa per accesso rapido
    const motosMap = new Map(motos.map(m => [m.id.toString(), m]))

    // Trasforma i dati per il frontend (formato compatibile con la home)
    const motosFormatted = motoConcessionari
      .map(mc => {
        const moto = motosMap.get(mc.moto_id)
        if (!moto) return null

        return {
          _id: moto.id,
          id: moto.id,
          marca: moto.marca,
          modello: moto.modello,
          allestimento: moto.allestimento,
          categoria: moto.categoria,
          cilindrata: moto.cilindrata,
          prezzo: mc.prezzo_speciale || moto.prezzo,
          immagineUrl: mc.foto_principale || moto.immagine_copertina,
          immaginiGallery: Array.isArray(mc.foto_gallery) ? mc.foto_gallery : (moto.immagini_gallery || []),
          isDisponibile: moto.is_disponibile,
          isPromozione: moto.is_promozione,
          pesoASecco: moto.peso_a_secco,
          potenza: moto.potenza,
          alimentazione: moto.alimentazione,
          trasmissione: moto.trasmissione,
          frizione: moto.frizione,
          rapporti: moto.rapporti,
          lunghezza: moto.lunghezza,
          larghezza: moto.larghezza,
          altezza: moto.altezza,
          frenoAnteriore: moto.freno_anteriore,
          frenoPosteriore: moto.freno_posteriore,
          abs: moto.abs,
          ruotaAnteriore: moto.ruota_anteriore,
          ruotaPosteriore: moto.ruota_posteriore,
          tipoRuote: moto.tipo_ruote,
          capacitaSerbatoio: moto.capacita_serbatoio_carburante,
          consumo: moto.consumo_medio_vmtc,
          colore: mc.colore || moto.colore || (Array.isArray(moto.colori) ? moto.colori[0] : null) || null,
          colori: Array.isArray(moto.colori) ? moto.colori : [],
          // Dati specifici del concessionario per questa moto
          prezzo_speciale: mc.prezzo_speciale,
          quantita: mc.quantita,
          promozioni: mc.promozioni,
          note: mc.note,
          // Concessionario (solo questo)
          concessionari: [{
            id: concessionarioId,
            _id: concessionarioId,
            nome: '', // Verrà popolato dalla pagina principale
            citta: '', // Verrà popolato dalla pagina principale
            provincia: '' // Verrà popolato dalla pagina principale
          }]
        }
      })
      .filter(Boolean) // Rimuovi null

    return motosFormatted
  } catch (error: any) {
    console.error('Errore API moto concessionario:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore nel recupero delle moto.'
    })
  }
})

