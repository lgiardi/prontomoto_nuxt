import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'

const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { 
      categoria, 
      citta, 
      servizio_slug,
      limit = 50, 
      offset = 0 
    } = query

    console.log('🔧 Recupero servizi concessionari...', { categoria, citta, servizio_slug })

    // Query base con join
    let queryBuilder = supabase
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
          provincia,
          telefono,
          email
        )
      `)
      .eq('disponibile', true)

    // Filtri
    if (categoria) {
      queryBuilder = queryBuilder.eq('servizi_catalogo.categoria', categoria)
    }

    // NOTA: Il filtro città viene applicato DOPO il raggruppamento lato client (come moto nuove)
    // Non filtriamo qui per permettere di vedere tutti i concessionari per servizio

    if (servizio_slug) {
      queryBuilder = queryBuilder.eq('servizi_catalogo.slug', servizio_slug)
    }

    // NON applicare limit/offset qui, dobbiamo raggruppare prima
    queryBuilder = queryBuilder.order('created_at', { ascending: false })

    const { data: serviziRaw, error } = await queryBuilder

    if (error) {
      console.error('❌ Errore recupero servizi:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero dei servizi',
        data: error.message
      })
    }

    // Raggruppa i servizi per servizio_catalogo_id (come le moto nuove)
    // Ogni servizio catalogo può avere più concessionari
    const serviziMap = new Map()
    
    serviziRaw?.forEach(servizio => {
      const catalogoId = servizio.servizio_catalogo_id
      
      if (!serviziMap.has(catalogoId)) {
        // Primo servizio di questo catalogo - crea entry
        serviziMap.set(catalogoId, {
          servizio_catalogo_id: catalogoId,
          servizi_catalogo: servizio.servizi_catalogo,
          descrizione: servizio.descrizione,
          prezzo_da: servizio.prezzo_da,
          prezzo_a: servizio.prezzo_a,
          durata_minuti: servizio.durata_minuti,
          immagine_url: servizio.immagine_url,
          disponibile: servizio.disponibile,
          created_at: servizio.created_at,
          concessionari: [] // Array di concessionari
        })
      }
      
      // Aggiungi il concessionario all'array
      const servizioEntry = serviziMap.get(catalogoId)
      if (servizio.concessionari) {
        servizioEntry.concessionari.push({
          id: servizio.concessionari.id,
          nome: servizio.concessionari.nome,
          citta: servizio.concessionari.citta,
          provincia: servizio.concessionari.provincia,
          telefono: servizio.concessionari.telefono,
          email: servizio.concessionari.email
        })
      }
    })
    
    // Converti Map in Array
    let servizi = Array.from(serviziMap.values())
    
    // Applica filtro città DOPO il raggruppamento (come moto nuove)
    if (citta) {
      servizi = servizi.filter(servizio => 
        servizio.concessionari.some(c => c.citta === citta)
      )
    }
    
    // Applica paginazione DOPO il raggruppamento
    const total = servizi.length
    const start = parseInt(offset as string)
    const end = start + parseInt(limit as string)
    servizi = servizi.slice(start, end)

    // Statistiche per filtri (usa tutti i dati, non solo quelli paginati)
    const { data: statsData } = await supabase
      .from('servizi_concessionari')
      .select(`
        servizi_catalogo!inner(categoria),
        concessionari!inner(citta)
      `)
      .eq('disponibile', true)

    const categorie = [...new Set(statsData?.map(s => s.servizi_catalogo.categoria) || [])].sort()
    const cittaDisponibili = [...new Set(statsData?.map(s => s.concessionari.citta) || [])].sort()

    console.log('✅ Servizi recuperati e raggruppati:', servizi.length, 'servizi unici')

    return {
      success: true,
      data: servizi || [],
      meta: {
        total: total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        stats: {
          categorie,
          citta: cittaDisponibili
        }
      }
    }

  } catch (error) {
    console.error('❌ Errore API servizi:', error)
    return {
      success: false,
      error: error.message || 'Errore nel recupero dei servizi'
    }
  }
})
