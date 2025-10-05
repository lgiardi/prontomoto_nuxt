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
      // Usa l'API di Sanity per ottenere l'URL corretto
      const url = sanityClient.image(parsed.asset._ref).url()
      console.log('Immagine convertita con Sanity API:', parsed.asset._ref, '->', url)
      return url
    } else {
      console.log('Struttura asset non valida:', parsed)
    }
  } catch (e) {
    console.error('Errore parsing immagine Sanity:', e)
    console.error('Riferimento problematico:', imageRef)
  }
  return null
}

export default defineEventHandler(async (event) => {
  
  try {
    // Recupera tutte le moto da Supabase
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
        immagine_copertina_original,
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
    
    // Per ogni moto, recupera i concessionari associati
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
          .eq('moto_id', moto.id)
        
        if (concessionariError) {
          console.error(`Errore Supabase per moto ${moto.id}:`, concessionariError)
          return {
            ...moto,
            concessionari: []
          }
        }
        
        
        return {
          _id: moto.sanity_id,
          marca: moto.marca,
          modello: moto.modello,
          allestimento: moto.allestimento,
          categoria: moto.categoria,
          cilindrata: moto.cilindrata,
          prezzo: moto.prezzo,
          immagineUrl: moto.immagine_copertina, // Ora contiene l'URL reale
          concessionariCount: concessionari?.length || 0,
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