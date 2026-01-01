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
    const { utenteId } = query

    if (!utenteId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'utenteId è obbligatorio'
      })
    }

    console.log('❤️ Recupero preferiti per utente:', utenteId)

    // Recupera i preferiti
    const { data: preferiti, error: preferitiError } = await supabase
      .from('preferiti_utenti')
      .select('*')
      .eq('utente_id', utenteId)
      .order('created_at', { ascending: false })

    if (preferitiError) {
      console.error('❌ Errore recupero preferiti:', preferitiError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero dei preferiti',
        data: preferitiError.message
      })
    }

    console.log('✅ Preferiti trovati:', preferiti?.length || 0)

    // Per ogni preferito, recupera i dettagli della moto
    const motoPreferite = []
    
    if (preferiti && preferiti.length > 0) {
      for (const preferito of preferiti) {
        try {
          // Prova a recuperare la moto da Sanity (moto nuove)
          // Le moto nuove hanno ID come slug (es: "yamaha-mt-07")
          // Le moto usate hanno UUID
          
          // Verifica se è una moto usata (UUID)
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(preferito.moto_id)
          
          if (isUUID) {
            // È una moto usata
            const { data: motoUsata, error: motoUsataError } = await supabase
              .from('moto_usate')
              .select(`
                *,
                catalogo:moto_usate_catalogo(*)
              `)
              .eq('id', preferito.moto_id)
              .maybeSingle()
            
            if (!motoUsataError && motoUsata) {
              motoPreferite.push({
                id: motoUsata.id,
                tipo: 'usata',
                marca: motoUsata.catalogo?.marca || '',
                modello: motoUsata.catalogo?.modello || '',
                prezzo: motoUsata.prezzo,
                anno: motoUsata.anno,
                km: motoUsata.km,
                condizione: motoUsata.condizione,
                foto: motoUsata.foto || [],
                preferito_id: preferito.id
              })
            }
          } else {
            // È una moto nuova (slug da Sanity)
            // Recupera i dettagli dalla tabella moto_concessionari o da Sanity
            // Per ora, restituiamo solo l'ID e il tipo
            motoPreferite.push({
              id: preferito.moto_id,
              tipo: 'nuova',
              slug: preferito.moto_id,
              preferito_id: preferito.id
            })
          }
        } catch (error) {
          console.error('❌ Errore recupero dettagli moto:', error)
          // Continua con il prossimo preferito
        }
      }
    }

    return {
      success: true,
      preferiti: motoPreferite,
      total: motoPreferite.length
    }

  } catch (error) {
    console.error('❌ Errore API recupero preferiti:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server',
      data: error.data || error.message
    })
  }
})

