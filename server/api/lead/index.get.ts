import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig()
const supabaseUrl = config.public.supabaseUrl
const supabaseAnonKey = config.public.supabaseAnonKey
const supabaseServiceKey = config.supabaseServiceRoleKey

// Usa service key per bypassare RLS
const supabase = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : createClient(supabaseUrl, supabaseAnonKey)

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { concessionarioId, status, tipoRichiesta, limit = 50, offset = 0 } = query

    if (!concessionarioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'concessionarioId è obbligatorio'
      })
    }

    // Normalizza concessionarioId
    const normalizedConcessionarioId = String(concessionarioId).trim()
    
    console.log('📊 Recupero lead per concessionario:', {
      originale: concessionarioId,
      normalizzato: normalizedConcessionarioId,
      tipo: typeof normalizedConcessionarioId
    })
    
    // Verifica che il concessionario esista
    const { data: dealerCheck, error: dealerCheckError } = await supabase
      .from('concessionari')
      .select('id, nome')
      .eq('id', normalizedConcessionarioId)
      .maybeSingle()
    
    if (dealerCheckError) {
      console.error('❌ Errore verifica concessionario:', dealerCheckError)
    } else if (!dealerCheck) {
      console.warn('⚠️ Concessionario non trovato con ID:', normalizedConcessionarioId)
      // Prova a vedere se ci sono lead con questo ID comunque
      const { data: testLeads, error: testError } = await supabase
        .from('lead')
        .select('concessionario_id')
        .eq('concessionario_id', normalizedConcessionarioId)
        .limit(1)
      
      if (!testError && testLeads && testLeads.length > 0) {
        console.log('⚠️ Trovati lead con questo concessionario_id ma concessionario non esiste!')
      }
    } else {
      console.log('✅ Concessionario verificato:', {
        id: dealerCheck.id,
        nome: dealerCheck.nome,
        tipoId: typeof dealerCheck.id
      })
    }

    // Costruisci la query con filtri opzionali usando l'ID normalizzato
    let queryBuilder = supabase
      .from('lead')
      .select('*')
      .eq('concessionario_id', normalizedConcessionarioId)
      .order('created_at', { ascending: false })
    
    console.log('📊 Query builder creato, esecuzione query...')

    // Applica filtri se specificati
    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }
    
    if (tipoRichiesta) {
      queryBuilder = queryBuilder.eq('tipo_richiesta', tipoRichiesta)
    }

    // Applica limit e offset
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: leads, error: leadsError } = await queryBuilder

    if (leadsError) {
      console.error('❌ Errore recupero lead:', leadsError)
      console.error('❌ Dettagli errore:', {
        message: leadsError.message,
        details: leadsError.details,
        hint: leadsError.hint,
        code: leadsError.code
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero dei lead',
        data: leadsError.message
      })
    }

    console.log('📊 Lead trovati (prima del conteggio):', leads?.length || 0)
    if (leads && leads.length > 0) {
      console.log('📊 Primo lead:', {
        id: leads[0].id,
        concessionario_id: leads[0].concessionario_id,
        tipo_concessionario_id: typeof leads[0].concessionario_id,
        nome_cliente: leads[0].nome_cliente,
        corrisponde: String(leads[0].concessionario_id).trim() === normalizedConcessionarioId
      })
    } else {
      // Se non trova lead, prova a vedere se ci sono lead con ID simili
      const { data: allLeads, error: allLeadsError } = await supabase
        .from('lead')
        .select('id, concessionario_id, nome_cliente')
        .limit(5)
      
      if (!allLeadsError && allLeads) {
        console.log('📊 Esempi di lead nel database:', allLeads.map(l => ({
          id: l.id,
          concessionario_id: l.concessionario_id,
          tipo: typeof l.concessionario_id,
          nome: l.nome_cliente
        })))
        console.log('📊 ID cercato:', normalizedConcessionarioId)
      }
    }

    // Conta il totale dei lead per la paginazione usando l'ID normalizzato
    let countQuery = supabase
      .from('lead')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', normalizedConcessionarioId)

    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    
    if (tipoRichiesta) {
      countQuery = countQuery.eq('tipo_richiesta', tipoRichiesta)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('❌ Errore conteggio lead:', countError)
    }

    console.log('✅ Lead recuperati:', leads?.length || 0, 'di', count || 0)

    return {
      success: true,
      leads: leads || [],
      total: count || 0,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }

  } catch (error) {
    console.error('❌ Errore API recupero lead:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server durante il recupero dei lead',
      data: error.data || error.message
    })
  }
})






