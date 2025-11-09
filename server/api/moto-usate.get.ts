import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { venditore_type, status, approved_only } = query

    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

    if (!supabaseUrl || !supabaseAnonKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configurazione Supabase mancante'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

    // Helper per parsare campo foto (può essere JSON string, JSONB array o già array)
    const parseFoto = (foto: any): string[] => {
      if (!foto) return []
      if (Array.isArray(foto)) return foto.filter(url => url && typeof url === 'string')
      if (typeof foto === 'string') {
        try {
          const parsed = JSON.parse(foto)
          return Array.isArray(parsed) ? parsed.filter(url => url && typeof url === 'string') : []
        } catch {
          return []
        }
      }
      return []
    }

    // Query base con JOIN al catalogo
    // SOLO CONCESSIONARI: Le moto usate pubbliche sono solo dei concessionari
    let queryBuilder = supabaseService
      .from('moto_usate')
      .select(`
        *,
        moto_usate_catalogo (
          marca,
          modello
        )
      `)

    // SOLO CONCESSIONARI: Filtra sempre per concessionari (a meno che non sia richiesto esplicitamente altro per admin)
    if (venditore_type && venditore_type !== 'concessionario') {
      // Permettiamo altri filtri solo per scopi amministrativi
      queryBuilder = queryBuilder.eq('venditore_type', venditore_type)
    } else {
      // Default: solo concessionari
      queryBuilder = queryBuilder.eq('venditore_type', 'concessionario')
    }

    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    if (approved_only === 'true') {
      queryBuilder = queryBuilder.eq('status', 'approved')
    }

    // Ordina per data di creazione (più recenti prima)
    queryBuilder = queryBuilder.order('created_at', { ascending: false })

    const { data: motoUsate, error } = await queryBuilder

    if (error) {
      console.error('❌ Errore query moto usate:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel caricamento delle moto usate: ' + error.message
      })
    }

    if (!motoUsate || motoUsate.length === 0) {
      console.log('📊 Nessuna moto usata trovata')
      return { data: [] }
    }

    // Recupera le città dei concessionari per le moto che hanno venditore_type = 'concessionario'
    // venditore_id = auth.users.id = concessionari.user_id (NON concessionari.id)
    const concessionariUserIds = [...new Set(
      motoUsate.filter(m => m.venditore_type === 'concessionario').map(m => m.venditore_id)
    )]
    
    let concessionariMap = {}
    if (concessionariUserIds.length > 0) {
      // CORRETTO: Cerchiamo per user_id, non per id
      const { data: concessionari, error: concError } = await supabaseService
        .from('concessionari')
        .select('id, user_id, citta, provincia')
        .in('user_id', concessionariUserIds)
      
      if (concError) {
        console.warn('⚠️ Errore recupero città concessionari:', concError.message)
        // Continua senza bloccare, le moto saranno senza città
      } else if (concessionari) {
        // CORRETTO: Usa user_id come chiave, non id
        concessionariMap = concessionari.reduce((acc, conc) => {
          if (conc && conc.user_id && conc.citta) {
            acc[conc.user_id] = conc.citta
            console.log(`✅ Mappa città: user_id ${conc.user_id} -> ${conc.citta}`)
          }
          return acc
        }, {})
        console.log(`📊 Mappa concessionari creata con ${Object.keys(concessionariMap).length} città`)
      }
    }

    // Trasforma i dati per includere le informazioni del catalogo e venditore
    const motoUsateWithCatalogo = motoUsate.map(moto => {
      // Se è un concessionario, prendi la città dalla mappa
      const citta = moto.venditore_type === 'concessionario' 
        ? (concessionariMap[moto.venditore_id] || null)
        : null
      
      if (moto.venditore_type === 'concessionario') {
        console.log(`🏢 Moto ${moto.id}: venditore_id=${moto.venditore_id}, città=${citta || 'NON TROVATA'}`)
      }
      
      // Parsa il campo foto
      const fotoArray = parseFoto(moto.foto)
      
      // Estrai immagine_copertina dalla prima foto o dal campo dedicato
      const immagine_copertina = moto.immagine_copertina || (fotoArray.length > 0 ? fotoArray[0] : null)
      
      return {
        ...moto,
        marca: moto.moto_usate_catalogo?.marca || moto.marca,
        modello: moto.moto_usate_catalogo?.modello || moto.modello,
        categoria: moto.categoria, // categoria viene dalla tabella moto_usate, non dal catalogo
        foto: fotoArray,
        immagine_copertina: immagine_copertina,
        venditore_citta: citta,
        citta: citta
      }
    })

    // Restituisci direttamente { data } invece di { success: true, data }
    return {
      data: motoUsateWithCatalogo
    }

  } catch (error: any) {
    console.error('❌ Errore API moto-usate:', error)
    console.error('📋 Dettagli errore:', {
      message: error?.message,
      stack: error?.stack,
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage
    })
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || error?.message || 'Errore interno del server',
      data: error
    })
  }
})
