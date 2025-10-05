import { supabase } from '~/utils/supabase'
import { createClient } from '@sanity/client'

// Configurazione Sanity per le immagini
const sanityClient = createClient({
  projectId: '1i1fbngf',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-05-03'
})

// Funzione per convertire riferimento Sanity in URL
function getSanityImageUrl(imageRef) {
  if (!imageRef) {
    return null
  }
  
  try {
    const parsed = JSON.parse(imageRef)
    if (parsed.asset && parsed.asset._ref) {
      // Estrai l'ID dell'immagine dal riferimento
      const imageId = parsed.asset._ref.replace('image-', '').replace('-jpg', '')
      // Costruisci l'URL diretto di Sanity
      return `https://cdn.sanity.io/images/1i1fbngf/production/${imageId}.jpg`
    }
  } catch (e) {
    console.error('Errore parsing immagine Sanity:', e)
  }
  return null
}

export default defineEventHandler(async (event) => {
    const motoId = getRouterParam(event, 'id')
    
    if (!motoId) {
      throw createError({
        statusCode: 400,
      statusMessage: 'ID moto richiesto.'
    })
  }
  
  try {
    // Recupera i dettagli della moto da Supabase
    const { data: moto, error: motoError } = await supabase
      .from('moto')
      .select('*')
      .eq('sanity_id', motoId)
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
      .eq('moto_id', moto.id)
    
    if (concessionariError) {
      console.error(`Errore Supabase per concessionari moto ${moto.id}:`, concessionariError)
    }
    
    // Trasforma i dati per mantenere la compatibilità con il frontend
    const motoData = {
      _id: moto.sanity_id,
      marca: moto.marca,
      modello: moto.modello,
      allestimento: moto.allestimento,
      categoria: moto.categoria,
      cilindrata: moto.cilindrata,
      prezzo: moto.prezzo,
      potenza: moto.potenza,
      peso_a_secco: moto.peso_a_secco,
      peso_in_ordine_di_marcia: moto.peso_in_ordine_di_marcia,
      alimentazione: moto.alimentazione,
      trasmissione: moto.trasmissione,
      frizione: moto.frizione,
      lunghezza: moto.lunghezza,
      larghezza: moto.larghezza,
      altezza: moto.altezza,
      altezza_minima_da_terra: moto.altezza_minima_da_terra,
      altezza_sella_da_terra_min: moto.altezza_sella_da_terra_min,
      altezza_sella_da_terra_max: moto.altezza_sella_da_terra_max,
      interasse: moto.interasse,
      freno_anteriore: moto.freno_anteriore,
      freno_posteriore: moto.freno_posteriore,
      abs: moto.abs,
      ruota_anteriore: moto.ruota_anteriore,
      ruota_posteriore: moto.ruota_posteriore,
      tipo_ruote: moto.tipo_ruote,
      capacita_serbatoio_carburante: moto.capacita_serbatoio_carburante,
      capacita_riserva_carburante: moto.capacita_riserva_carburante,
      consumo_medio_vmtc: moto.consumo_medio_vmtc,
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
      concessionari: concessionari?.map(c => ({
        _id: c.concessionari.id,
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
    console.error('Errore API moto dettagli:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore sconosciuto.',
      data: error.data || error.message
    })
  }
})