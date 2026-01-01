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
    const conversazioneId = getRouterParam(event, 'id')
    const query = getQuery(event)
    const { limit = 50, offset = 0 } = query

    if (!conversazioneId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID conversazione è obbligatorio'
      })
    }

    console.log('💬 Recupero messaggi per conversazione:', conversazioneId)

    // Recupera i messaggi
    const { data: messaggi, error: msgError } = await supabase
      .from('messaggi')
      .select('*')
      .eq('conversazione_id', conversazioneId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (msgError) {
      console.error('❌ Errore recupero messaggi:', msgError)
      console.error('❌ Dettagli errore messaggi:', {
        message: msgError.message,
        details: msgError.details,
        hint: msgError.hint,
        code: msgError.code
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero dei messaggi',
        data: {
          message: msgError.message,
          details: msgError.details,
          code: msgError.code
        }
      })
    }

    // Recupera anche i dettagli della conversazione con concessionario
    const { data: conversazione, error: convError } = await supabase
      .from('conversazioni')
      .select(`
        *,
        concessionari(
          id,
          nome,
          citta,
          telefono,
          email
        )
      `)
      .eq('id', conversazioneId)
      .single()

    if (convError) {
      console.error('❌ Errore recupero conversazione:', convError)
      console.error('❌ Dettagli errore conversazione:', {
        message: convError.message,
        details: convError.details,
        hint: convError.hint,
        code: convError.code
      })
      
      // Se l'errore è "non trovato", restituisci 404
      if (convError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Conversazione non trovata',
          data: { conversazioneId }
        })
      }
      
      // Altrimenti, errore generico
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero della conversazione',
        data: {
          message: convError.message,
          details: convError.details,
          code: convError.code
        }
      })
    }

    console.log('✅ Messaggi recuperati:', messaggi?.length || 0)

    return {
      success: true,
      messaggi: messaggi || [],
      conversazione: conversazione || null
    }

  } catch (error) {
    console.error('❌ Errore API recupero messaggi:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})






