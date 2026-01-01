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
    const { concessionarioId, status = 'attiva', limit = 50, offset = 0 } = query

    if (!concessionarioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'concessionarioId è obbligatorio'
      })
    }

    console.log('💬 Recupero conversazioni per concessionario:', concessionarioId)
    console.log('💬 Tipo concessionarioId:', typeof concessionarioId)
    console.log('💬 Status richiesto:', status)

    // Recupera le conversazioni
    const { data: conversazioni, error: convError } = await supabase
      .from('conversazioni')
      .select('*')
      .eq('concessionario_id', concessionarioId)
      .eq('status', status)
      .order('ultimo_messaggio_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (convError) {
      console.error('❌ Errore recupero conversazioni:', convError)
      console.error('❌ Dettagli errore:', {
        message: convError.message,
        details: convError.details,
        hint: convError.hint,
        code: convError.code
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero delle conversazioni',
        data: convError.message
      })
    }

    console.log('📊 Conversazioni trovate (prima del conteggio):', conversazioni?.length || 0)
    if (conversazioni && conversazioni.length > 0) {
      console.log('📊 Prima conversazione:', JSON.stringify(conversazioni[0], null, 2))
    }

    // Conta il totale per la paginazione
    const { count, error: countError } = await supabase
      .from('conversazioni')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', concessionarioId)
      .eq('status', status)

    if (countError) {
      console.error('❌ Errore conteggio conversazioni:', countError)
    }

    // Conta i messaggi non letti
    const unreadCount = conversazioni?.filter(c => !c.concessionario_ha_letto).length || 0

    console.log('✅ Conversazioni recuperate:', conversazioni?.length || 0, 'di', count || 0)
    console.log('📬 Messaggi non letti:', unreadCount)

    return {
      success: true,
      conversazioni: conversazioni || [],
      total: count || 0,
      unreadCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }

  } catch (error) {
    console.error('❌ Errore API recupero conversazioni:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})






