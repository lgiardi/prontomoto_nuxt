import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

// Funzione per validare UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default defineEventHandler(async (event) => {
    const motoId = getRouterParam(event, 'id')
    
    if (!motoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID moto richiesto.'
      })
    }
    
    // Valida che motoId sia un UUID valido
    if (!isValidUUID(motoId)) {
      console.error('❌ ID moto non valido (non è un UUID):', motoId)
      throw createError({
        statusCode: 400,
        statusMessage: 'ID moto non valido. Formato UUID richiesto.',
        data: `L'ID "${motoId}" non è un UUID valido.`
      })
    }
  
  try {
    // Recupera i dettagli della moto da Supabase
    const { data: moto, error: motoError } = await supabase
      .from('moto')
      .select('*')
      .eq('id', motoId)
      .single()
    
    if (motoError) {
      console.error('Errore Supabase nel recupero moto:', motoError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Moto non trovata.',
        data: motoError.message
      })
    }
    
    // Recupera i concessionari associati a questa moto
    // moto_id in moto_concessionari è VARCHAR, quindi prova entrambi i formati
    console.log(`🔍 Cercando concessionari per moto: ${moto.marca} ${moto.modello} (ID: ${moto.id}, tipo: ${typeof moto.id})`)
    
    let concessionari = null
    let concessionariError = null
    
    // Prova prima con moto.id come stringa
    const result1 = await supabase
      .from('moto_concessionari')
      .select(`
        concessionario_id,
        disponibile,
        prezzo_speciale,
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
          status
        )
      `)
      .eq('moto_id', moto.id.toString())
      .eq('disponibile', true)
    
    if (result1.error) {
      console.error(`❌ Errore con moto.id.toString():`, result1.error)
      concessionariError = result1.error
    } else {
      concessionari = result1.data
    }
    
    // Se non trova nulla, prova anche senza filtro disponibile per vedere cosa c'è
    if ((!concessionari || concessionari.length === 0) && moto.id) {
      const result2 = await supabase
        .from('moto_concessionari')
        .select(`
          concessionario_id,
          disponibile,
          prezzo_speciale,
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
            status
          )
        `)
        .eq('moto_id', moto.id.toString())
      
      if (!result2.error && result2.data && result2.data.length > 0) {
        console.log(`⚠️ Trovati ${result2.data.length} concessionari ma non tutti disponibili`)
        concessionari = result2.data.filter(c => c.disponibile === true)
      }
      
      // Se ancora non trova nulla, prova con l'UUID direttamente
      if ((!concessionari || concessionari.length === 0)) {
        const result3 = await supabase
          .from('moto_concessionari')
          .select(`
            concessionario_id,
            disponibile,
            prezzo_speciale,
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
              status
            )
          `)
          .eq('moto_id', moto.id)
          .eq('disponibile', true)
        
        if (!result3.error && result3.data && result3.data.length > 0) {
          concessionari = result3.data
          console.log(`✅ Trovati ${concessionari.length} concessionari usando moto.id (UUID)`)
        }
      }
    }
    
    if (concessionariError && (!concessionari || concessionari.length === 0)) {
      console.error(`❌ Errore Supabase per concessionari moto ${moto.id}:`, concessionariError)
    }
    
    console.log(`📊 Concessionari trovati (raw): ${concessionari?.length || 0}`)
    if (concessionari && concessionari.length > 0) {
      console.log(`📋 Esempi moto_id nel DB:`, [...new Set(concessionari.map(c => c.moto_id))])
      console.log(`📋 Concessionari:`, concessionari.map(c => ({
        nome: c.concessionari?.nome,
        citta: c.concessionari?.citta,
        status: c.concessionari?.status
      })))
    }
    
    // Filtra manualmente i concessionari attivi
    const concessionariAttivi = concessionari?.filter(c => c.concessionari?.status === 'active') || []
    
    console.log(`✅ Concessionari attivi filtrati: ${concessionariAttivi.length}`)
    if (concessionariAttivi.length > 0) {
      console.log(`🏙️ Città disponibili:`, [...new Set(concessionariAttivi.map(c => c.concessionari.citta))])
    } else if (concessionari && concessionari.length > 0) {
      console.log(`⚠️ Ci sono ${concessionari.length} concessionari ma nessuno attivo!`)
    }
    
    // Recupera i rating per ogni concessionario
    const concessionariConRating = await Promise.all(
      concessionariAttivi.map(async (c) => {
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
    
    // Trasforma i dati per mantenere la compatibilità con il frontend
    const motoData = {
      id: moto.id,
      marca: moto.marca,
      modello: moto.modello,
      allestimento: moto.allestimento,
      categoria: moto.categoria,
      cilindrata: moto.cilindrata,
      prezzo: moto.prezzo,
      potenza: moto.potenza,
      // Mappatura camelCase per il frontend
      pesoASecco: moto.peso_a_secco,
      peso_a_secco: moto.peso_a_secco, // Mantieni anche snake_case per compatibilità
      peso_in_ordine_di_marcia: moto.peso_in_ordine_di_marcia,
      alimentazione: moto.alimentazione,
      trasmissione: moto.trasmissione,
      frizione: moto.frizione,
      rapporti: moto.rapporti || null, // Aggiungi se presente nel DB
      lunghezza: moto.lunghezza,
      larghezza: moto.larghezza,
      altezza: moto.altezza,
      altezza_minima_da_terra: moto.altezza_minima_da_terra,
      altezza_sella_da_terra_min: moto.altezza_sella_da_terra_min,
      altezza_sella_da_terra_max: moto.altezza_sella_da_terra_max,
      interasse: moto.interasse,
      // Mappatura camelCase per freni
      frenoAnteriore: moto.freno_anteriore,
      freno_anteriore: moto.freno_anteriore,
      frenoPosteriore: moto.freno_posteriore,
      freno_posteriore: moto.freno_posteriore,
      abs: moto.abs,
      // Mappatura camelCase per ruote
      ruotaAnteriore: moto.ruota_anteriore,
      ruota_anteriore: moto.ruota_anteriore,
      ruotaPosteriore: moto.ruota_posteriore,
      ruota_posteriore: moto.ruota_posteriore,
      tipoRuote: moto.tipo_ruote,
      tipo_ruote: moto.tipo_ruote,
      // Mappatura camelCase per serbatoio e consumo
      capacitaSerbatoio: moto.capacita_serbatoio_carburante,
      capacita_serbatoio_carburante: moto.capacita_serbatoio_carburante,
      capacita_riserva_carburante: moto.capacita_riserva_carburante,
      consumo: moto.consumo_medio_vmtc,
      consumo_medio_vmtc: moto.consumo_medio_vmtc,
      // Colore (se presente nel DB)
      colore: moto.colore || moto.colori?.[0] || null,
      colori: moto.colori || [],
      anno_inizio_produzione: moto.anno_inizio_produzione,
      anno_fine_produzione: moto.anno_fine_produzione,
      garanzia: moto.garanzia,
      optional: moto.optional,
      immagineUrl: moto.immagine_copertina, // Ora contiene l'URL reale
      immaginiGallery: moto.immagini_gallery || [], // Ora contiene gli URL reali
      link: moto.link,
      alesaggio: moto.alesaggio,
      corsa: moto.corsa,
      cilindri: moto.cilindri,
      configurazione_cilindri: moto.configurazione_cilindri,
      disposizione_cilindri: moto.disposizione_cilindri,
      inclinazione_cilindri: moto.inclinazione_cilindri,
      inclinazione_cilindri_av: moto.inclinazione_cilindri_av,
      raffreddamento: moto.raffreddamento,
      is_disponibile: moto.is_disponibile,
      is_promozione: moto.is_promozione,
      concessionari: concessionariConRating.map(c => ({
        _id: c.concessionari.id, // Usa _id per compatibilità con il frontend
        id: c.concessionari.id,
        nome: c.concessionari.nome,
        citta: c.concessionari.citta,
        provincia: c.concessionari.provincia,
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
    console.error('Errore API moto dettagli:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore sconosciuto.',
      data: error.data || error.message
    })
  }
})