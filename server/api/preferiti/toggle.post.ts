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
    const body = await readBody(event)
    const { utenteId, motoId } = body

    if (!utenteId || !motoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'utenteId e motoId sono obbligatori'
      })
    }

    console.log('❤️ Toggle preferito:', { utenteId, motoId })

    // Verifica se il preferito esiste già
    const { data: preferitoEsistente, error: checkError } = await supabase
      .from('preferiti_utenti')
      .select('id')
      .eq('utente_id', utenteId)
      .eq('moto_id', motoId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Errore verifica preferito:', checkError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nella verifica del preferito',
        data: checkError.message
      })
    }

    if (preferitoEsistente) {
      // Rimuovi il preferito
      const { error: deleteError } = await supabase
        .from('preferiti_utenti')
        .delete()
        .eq('id', preferitoEsistente.id)

      if (deleteError) {
        console.error('❌ Errore rimozione preferito:', deleteError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Errore nella rimozione del preferito',
          data: deleteError.message
        })
      }

      console.log('✅ Preferito rimosso')
      return {
        success: true,
        action: 'removed',
        message: 'Preferito rimosso con successo'
      }
    } else {
      // Aggiungi il preferito
      const { data: nuovoPreferito, error: insertError } = await supabase
        .from('preferiti_utenti')
        .insert({
          utente_id: utenteId,
          moto_id: motoId
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Errore aggiunta preferito:', insertError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Errore nell\'aggiunta del preferito',
          data: insertError.message
        })
      }

      console.log('✅ Preferito aggiunto')
      return {
        success: true,
        action: 'added',
        preferito: nuovoPreferito,
        message: 'Preferito aggiunto con successo'
      }
    }

  } catch (error) {
    console.error('❌ Errore API toggle preferito:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})

