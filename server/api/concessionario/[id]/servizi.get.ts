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

    // Recupera i servizi di questo concessionario
    const { data: servizi, error } = await supabase
      .from('servizi_concessionari')
      .select(`
        *,
        servizi_catalogo!inner(
          id,
          nome,
          slug,
          categoria,
          descrizione_breve,
          icona
        ),
        concessionari!inner(
          id,
          nome,
          citta,
          provincia
        )
      `)
      .eq('concessionario_id', concessionarioId)
      .eq('disponibile', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore recupero servizi:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero dei servizi.'
      })
    }

    if (!servizi || servizi.length === 0) {
      return []
    }

    // Raggruppa per servizio catalogo (come nella home)
    const serviziGrouped = servizi.reduce((acc: any, servizio: any) => {
      const servizioCatalogoId = servizio.servizi_catalogo.id
      const servizioCatalogoSlug = servizio.servizi_catalogo.slug

      if (!acc[servizioCatalogoId]) {
        acc[servizioCatalogoId] = {
          id: servizioCatalogoId,
          nome: servizio.servizi_catalogo.nome,
          slug: servizioCatalogoSlug,
          categoria: servizio.servizi_catalogo.categoria,
          descrizione_breve: servizio.servizi_catalogo.descrizione_breve,
          icona: servizio.servizi_catalogo.icona,
          immagineUrl: servizio.immagine_url || null,
          prezzo_da: servizio.prezzo_da,
          prezzo_a: servizio.prezzo_a,
          durata_minuti: servizio.durata_minuti,
          descrizione: servizio.descrizione,
          concessionari: []
        }
      }

      // Aggiungi questo concessionario alla lista
      acc[servizioCatalogoId].concessionari.push({
        id: servizio.concessionari.id,
        nome: servizio.concessionari.nome,
        citta: servizio.concessionari.citta,
        provincia: servizio.concessionari.provincia,
        prezzo_da: servizio.prezzo_da,
        prezzo_a: servizio.prezzo_a,
        durata_minuti: servizio.durata_minuti,
        descrizione: servizio.descrizione,
        immagine_url: servizio.immagine_url
      })

      return acc
    }, {})

    // Converti in array
    const serviziArray = Object.values(serviziGrouped)

    return serviziArray
  } catch (error: any) {
    console.error('Errore API servizi concessionario:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore nel recupero dei servizi.'
    })
  }
})

