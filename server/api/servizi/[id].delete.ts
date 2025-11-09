import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

const supabase = createClient(supabaseUrl, supabaseKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default defineEventHandler(async (event) => {
  try {
    // Verifica autenticazione
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token di autenticazione richiesto'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verifica il token e ottieni l'utente
    const supabaseAuth = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token non valido o utente non autenticato'
      })
    }

    // Verifica che sia una richiesta DELETE
    if (getMethod(event) !== 'DELETE') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // Ottieni l'ID del servizio dalla route
    const servizioId = getRouterParam(event, 'id')
    
    if (!servizioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID servizio richiesto'
      })
    }

    console.log('🗑️ Eliminazione servizio...', { servizioId, userId: user.id })

    // Verifica che il concessionario esista
    let { data: concessionario, error: dealerError } = await supabaseAuth
      .from('concessionari')
      .select('id, nome, status, user_id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    // Se non trova con user_id, prova con id
    if (dealerError || !concessionario) {
      const { data: concessionarioById, error: dealerErrorById } = await supabaseAuth
        .from('concessionari')
        .select('id, nome, status, user_id')
        .eq('id', user.id)
        .maybeSingle()
      
      if (!dealerErrorById && concessionarioById) {
        concessionario = concessionarioById
        dealerError = null
      }
    }

    if (dealerError || !concessionario) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato'
      })
    }

    // Verifica che il concessionario sia attivo
    if (concessionario.status !== 'active') {
      throw createError({
        statusCode: 403,
        statusMessage: `Concessionario non attivo. Status attuale: ${concessionario.status}.`
      })
    }

    // Verifica che il servizio esista e appartenga al concessionario
    // Usa user.id come concessionario_id per matchare con come viene salvato
    const { data: servizioEsistente, error: checkError } = await supabaseAuth
      .from('servizi_concessionari')
      .select(`
        *,
        servizi_catalogo!inner(
          id,
          nome,
          slug,
          categoria
        )
      `)
      .eq('id', servizioId)
      .or(`concessionario_id.eq.${user.id},concessionario_id.eq.${concessionario.id}`)
      .maybeSingle()

    if (checkError || !servizioEsistente) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Servizio non trovato o non autorizzato'
      })
    }

    // Verifica se ci sono conversazioni attive per questo servizio
    const { data: conversazioniAttive, error: convError } = await supabaseAdmin
      .from('conversazioni')
      .select('id, status')
      .eq('servizio_concessionario_id', servizioId)
      .eq('status', 'attiva')

    if (convError) {
      console.error('❌ Errore verifica conversazioni:', convError)
    }

    if (conversazioniAttive && conversazioniAttive.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `Non puoi eliminare questo servizio perché ha ${conversazioniAttive.length} conversazioni attive. Disattivalo invece di eliminarlo.`
      })
    }

    // Elimina il servizio usando admin client (bypassa RLS)
    const { error: deleteError } = await supabaseAdmin
      .from('servizi_concessionari')
      .delete()
      .eq('id', servizioId)

    if (deleteError) {
      console.error('❌ Errore eliminazione servizio:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nell\'eliminazione del servizio',
        data: deleteError.message
      })
    }

    console.log('✅ Servizio eliminato:', servizioId)

    return {
      success: true,
      message: `Servizio "${servizioEsistente.servizi_catalogo.nome}" eliminato con successo!`
    }

  } catch (error) {
    console.error('❌ Errore API eliminazione servizio:', error)
    
    if (error.statusCode) {
      throw error
    }

    return {
      success: false,
      error: error.message || 'Errore nell\'eliminazione del servizio'
    }
  }
})
