import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const motoId = getRouterParam(event, 'id')
    
    if (!motoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID moto richiesto.'
      })
    }

    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

    if (!supabaseUrl || !supabaseAnonKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configurazione Supabase mancante'
      })
    }

    // Usa service role per bypassare RLS quando serve leggere concessionari
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔍 Recupero dettaglio moto usata:', motoId)

    // Recupera la moto usata con JOIN al catalogo (solo concessionari)
    const { data: moto, error: motoError } = await supabase
      .from('moto_usate')
      .select(`
        *,
        moto_usate_catalogo (
          marca,
          modello
        )
      `)
      .eq('id', motoId)
      .eq('status', 'approved')
      .eq('venditore_type', 'concessionario')
      .single()

    if (motoError || !moto) {
      console.error('❌ Errore recupero moto usata:', motoError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Moto usata non trovata o non approvata.',
        data: motoError?.message
      })
    }

    console.log('✅ Moto trovata:', moto.moto_usate_catalogo?.marca, moto.moto_usate_catalogo?.modello)
    console.log('📋 Tipo venditore:', moto.venditore_type)
    console.log('🆔 Venditore ID:', moto.venditore_id)

    // Recupera informazioni venditore in base al tipo
    let venditore = null

    // Recupera venditore (solo concessionario)
    if (moto.venditore_type === 'concessionario') {
      // Usa service role per bypassare RLS
      // CORRETTO: Cerchiamo con user_id, non con id
      // venditore_id = auth.users.id = concessionari.user_id
      console.log(`🔍 Recupero concessionario per moto ${moto.id} con venditore_id (user_id): ${moto.venditore_id}`)
      const { data: concessionario, error: concError } = await supabaseService
        .from('concessionari')
        .select('id, nome, email, telefono, citta, provincia, via, descrizione, user_id')
        .eq('user_id', moto.venditore_id)
        .maybeSingle()

      if (concError) {
        console.error('⚠️ Errore recupero concessionario:', concError)
        // Non bloccante, continuiamo senza venditore
      } else if (concessionario) {
        // Se il concessionario esiste, la città DEVE essere presente (NOT NULL constraint)
        console.log(`✅ Concessionario trovato:`, { id: concessionario.id, user_id: concessionario.user_id, nome: concessionario.nome, citta: concessionario.citta })
        if (!concessionario.citta) {
          console.error(`❌ ERRORE: Concessionario trovato ma città è NULL! Verifica database.`)
        }
        venditore = {
          id: concessionario.id,
          nome: concessionario.nome,
          email: concessionario.email,
          telefono: concessionario.telefono,
          citta: concessionario.citta || null,
          provincia: concessionario.provincia,
          via: concessionario.via,
          descrizione: concessionario.descrizione,
          tipo: 'concessionario'
        }
      } else {
        console.warn(`⚠️ Nessun concessionario trovato per user_id: ${moto.venditore_id}`)
      }
    }

    // Helper per parsare campo foto
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

    const marca = moto.moto_usate_catalogo?.marca || moto.marca
    const modello = moto.moto_usate_catalogo?.modello || moto.modello
    const categoria = moto.categoria || null // categoria nella tabella moto_usate
    const fotoArray = parseFoto(moto.foto)
    
    // Costruisci oggetto risposta (stesso formato delle moto nuove, senza wrapper success)
    // Per le moto usate, il venditore è uno solo (non array come nelle moto nuove)
    // Lo mettiamo in un array per compatibilità con il frontend
    const motoData = {
      id: moto.id,
      marca: marca,
      modello: modello,
      categoria: categoria,
      anno: moto.anno,
      km: moto.km,
      condizione: moto.condizione,
      prezzo: moto.prezzo,
      descrizione: moto.descrizione,
      foto: fotoArray,
      immagine_copertina: moto.immagine_copertina || (fotoArray.length > 0 ? fotoArray[0] : null),
      // Metto venditore in un array per compatibilità con il frontend delle moto nuove
      concessionari: venditore ? [{
        id: venditore.id,
        _id: venditore.id,
        nome: venditore.nome,
        citta: venditore.citta,
        provincia: venditore.provincia,
        telefono: venditore.telefono,
        email: venditore.email,
        tipo: venditore.tipo
      }] : [],
      venditore: venditore, // Manteniamo anche questo per retrocompatibilità
      venditore_type: moto.venditore_type,
      created_at: moto.created_at,
      updated_at: moto.updated_at
    }

    return motoData

  } catch (error) {
    console.error('❌ Errore API moto-usate/[id]:', error)
    
    // Se è già un errore H3, rilancialo
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server',
      data: error.message
    })
  }
})
