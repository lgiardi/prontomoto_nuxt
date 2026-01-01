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
    const { clienteEmail, clienteId = null, status = 'attiva', limit = 50, offset = 0 } = query

    // Se clienteId è fornito, usa quello, altrimenti usa l'email
    if (!clienteId && !clienteEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'clienteId o clienteEmail è obbligatorio'
      })
    }

    console.log('💬 Recupero conversazioni per cliente:', { clienteId, clienteEmail })

    let conversazioniQuery = supabase
      .from('conversazioni')
      .select(`
        *,
        concessionari!inner(
          id,
          nome,
          citta,
          telefono,
          email
        )
      `)
      .eq('status', status)
      .order('ultimo_messaggio_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtra per cliente: cerca per ID se disponibile, altrimenti per email
    // Se entrambi sono disponibili, cerca per entrambi (OR)
    if (clienteId && clienteEmail) {
      // Cerca conversazioni dove cliente_id corrisponde O cliente_email corrisponde
      conversazioniQuery = conversazioniQuery.or(`cliente_id.eq.${clienteId},cliente_email.eq.${clienteEmail}`)
    } else if (clienteId) {
      conversazioniQuery = conversazioniQuery.eq('cliente_id', clienteId)
    } else if (clienteEmail) {
      conversazioniQuery = conversazioniQuery.eq('cliente_email', clienteEmail)
    }

    const { data: conversazioni, error: convError } = await conversazioniQuery

    if (convError) {
      console.error('❌ Errore recupero conversazioni cliente:', convError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero delle conversazioni',
        data: convError.message
      })
    }

    // Conta il totale per la paginazione
    let countQuery = supabase
      .from('conversazioni')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    if (clienteId && clienteEmail) {
      countQuery = countQuery.or(`cliente_id.eq.${clienteId},cliente_email.eq.${clienteEmail}`)
    } else if (clienteId) {
      countQuery = countQuery.eq('cliente_id', clienteId)
    } else if (clienteEmail) {
      countQuery = countQuery.eq('cliente_email', clienteEmail)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('❌ Errore conteggio conversazioni cliente:', countError)
    }

    // Conta i messaggi non letti dal cliente
    const unreadCount = conversazioni?.filter(c => !c.cliente_ha_letto).length || 0

    console.log('✅ Conversazioni cliente recuperate:', conversazioni?.length || 0, 'di', count || 0)
    console.log('📬 Messaggi non letti dal cliente:', unreadCount)

    return {
      success: true,
      conversazioni: conversazioni || [],
      total: count || 0,
      unreadCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }

  } catch (error) {
    console.error('❌ Errore API recupero conversazioni cliente:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})






