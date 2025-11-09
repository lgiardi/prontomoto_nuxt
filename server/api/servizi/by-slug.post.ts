import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler, readBody } from 'h3'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'

const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { slug, citta } = body
    
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug servizio richiesto'
      })
    }
    
    console.log('🔍 Cerca servizio per slug:', { slug, citta })
    
    // Cerca il servizio catalogo per slug
    const { data: servizioCatalogo, error: catalogoError } = await supabase
      .from('servizi_catalogo')
      .select('id, nome, slug, categoria, descrizione_breve, icona')
      .eq('slug', slug)
      .single()
    
    if (catalogoError || !servizioCatalogo) {
      console.error('❌ Errore recupero servizio catalogo:', catalogoError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Servizio non trovato'
      })
    }
    
    console.log('✅ Servizio catalogo trovato:', servizioCatalogo.id)
    
    // Recupera TUTTI i servizi_concessionari per questo servizio catalogo
    const { data: serviziConcessionari, error: serviziError } = await supabase
      .from('servizi_concessionari')
      .select(`
        *,
        concessionari!inner(
          id,
          nome,
          citta,
          provincia,
          telefono,
          email,
          via,
          descrizione
        )
      `)
      .eq('servizio_catalogo_id', servizioCatalogo.id)
      .eq('disponibile', true)
    
    if (serviziError) {
      console.error('❌ Errore recupero servizi concessionari:', serviziError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero dei servizi',
        data: serviziError.message
      })
    }
    
    if (!serviziConcessionari || serviziConcessionari.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nessun concessionario offre questo servizio'
      })
    }
    
    // Prendi i dati del primo servizio (tutti hanno lo stesso catalogo)
    const primoServizio = serviziConcessionari[0]
    
    // Estrai le città uniche dai concessionari
    const cittaDisponibili = [...new Set(serviziConcessionari.map(s => s.concessionari.citta) || [])]
    console.log('🏙️ Città disponibili per servizio:', cittaDisponibili)
    console.log('🏢 Concessionari trovati:', serviziConcessionari.length)
    
    // Trasforma i dati per il frontend (come moto nuove)
    const servizioData = {
      servizio_catalogo_id: servizioCatalogo.id,
      servizi_catalogo: servizioCatalogo,
      descrizione: primoServizio.descrizione,
      prezzo_da: primoServizio.prezzo_da,
      prezzo_a: primoServizio.prezzo_a,
      durata_minuti: primoServizio.durata_minuti,
      immagine_url: primoServizio.immagine_url,
      disponibile: primoServizio.disponibile,
      cittaSelezionata: citta || null,
      cittaDisponibili: cittaDisponibili,
      concessionari: serviziConcessionari.map(s => ({
        id: s.concessionari.id,
        nome: s.concessionari.nome,
        citta: s.concessionari.citta,
        provincia: s.concessionari.provincia,
        telefono: s.concessionari.telefono,
        email: s.concessionari.email,
        via: s.concessionari.via,
        descrizione: s.concessionari.descrizione,
        // Aggiungi anche i dati specifici del servizio per questo concessionario
        prezzo_da: s.prezzo_da,
        prezzo_a: s.prezzo_a,
        durata_minuti: s.durata_minuti
      })) || []
    }
    
    return servizioData
    
  } catch (error: any) {
    console.error('❌ Errore API servizi by-slug:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server durante il recupero del servizio.',
      data: error.message
    })
  }
})

