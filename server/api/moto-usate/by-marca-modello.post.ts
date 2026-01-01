import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler, readBody } from 'h3'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

// Usa service role per bypassare RLS quando serve leggere concessionari
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { marca, modello } = body
    
    if (!marca || !modello) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Marca e modello richiesti'
      })
    }
    
    // Normalizza marca e modello - mantieni trattini come nella pagina lista
    // La pagina lista usa: .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    // Ma la normalizzazione ricevuta dall'URL potrebbe essere già normalizzata
    // Normalizza sempre per sicurezza
    const normalizeSlug = (str: string): string => {
      if (!str) return ''
      // Rimuovi eventuali caratteri speciali, mantieni trattini
      return str.toLowerCase()
        .trim()
        .replace(/\s+/g, '-')  // Spazi diventano trattini
        .replace(/[^a-z0-9-]/g, '')  // Rimuovi tutto tranne lettere, numeri e trattini
        .replace(/-+/g, '-')  // Sostituisci più trattini con uno solo
        .replace(/^-|-$/g, '')  // Rimuovi trattini all'inizio e alla fine
    }
    
    // Normalizza sia l'input che i dati dal database
    const marcaNorm = normalizeSlug(marca)
    const modelloNorm = normalizeSlug(modello)
    
    console.log('🔍 Ricerca moto - Input normalizzato:', { marcaNorm, modelloNorm })
    
    // Cerca tutte le moto approvate (solo concessionari)
    const { data: motoUsate, error: motoError } = await supabase
      .from('moto_usate')
      .select(`
        *,
        moto_usate_catalogo (
          marca,
          modello
        )
      `)
      .eq('status', 'approved')
      .eq('venditore_type', 'concessionario')
    
    if (motoError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore recupero moto usate: ' + motoError.message
      })
    }
    
    // Trova la prima moto che corrisponde
    console.log('🔍 Cerca moto con marca norm:', marcaNorm, 'modello norm:', modelloNorm)
    console.log('📊 Totale moto disponibili:', motoUsate?.length || 0)
    
    // Prima prova: match esatto
    let motoTrovata = motoUsate?.find(moto => {
      const m = normalizeSlug(moto.moto_usate_catalogo?.marca || moto.marca || '')
      const mod = normalizeSlug(moto.moto_usate_catalogo?.modello || moto.modello || '')
      return m === marcaNorm && mod === modelloNorm
    })
    
    if (motoTrovata) {
      console.log('✅ Match ESATTO trovato:', {
        motoId: motoTrovata.id,
        marca: motoTrovata.moto_usate_catalogo?.marca || motoTrovata.marca,
        modello: motoTrovata.moto_usate_catalogo?.modello || motoTrovata.modello
      })
    } else {
      // Seconda prova: match flessibile (solo se non trovato match esatto)
      console.log('⚠️ Match esatto non trovato, provo match flessibile...')
      motoTrovata = motoUsate?.find(moto => {
        // Usa la stessa normalizzazione per confrontare
        const m = normalizeSlug(moto.moto_usate_catalogo?.marca || moto.marca || '')
        const mod = normalizeSlug(moto.moto_usate_catalogo?.modello || moto.modello || '')
        
        // Match flessibile: corrispondenza esatta o parziale
        const marcaMatch = m === marcaNorm || m.includes(marcaNorm) || marcaNorm.includes(m)
        const modelloMatch = mod === modelloNorm || mod.includes(modelloNorm) || modelloNorm.includes(mod)
      
        // Log per debug
      if (marcaMatch && modelloMatch) {
          console.log('✅ Match FLESSIBILE trovato:', {
            db: `${m}-${mod}`,
            input: `${marcaNorm}-${modelloNorm}`,
            motoId: moto.id,
            marcaOriginale: moto.moto_usate_catalogo?.marca || moto.marca,
            modelloOriginale: moto.moto_usate_catalogo?.modello || moto.modello
          })
          return true
      }
      
        return false
    })
    }
    
    if (!motoTrovata) {
      console.log('❌ Nessuna moto trovata per:', marcaNorm, modelloNorm)
      console.log('📋 Prime 5 moto disponibili nel database:')
      motoUsate?.slice(0, 5).forEach((m, idx) => {
        const mNorm = normalizeSlug(m.moto_usate_catalogo?.marca || m.marca || '')
        const modNorm = normalizeSlug(m.moto_usate_catalogo?.modello || m.modello || '')
        console.log(`  ${idx + 1}. ${m.moto_usate_catalogo?.marca || m.marca} ${m.moto_usate_catalogo?.modello || m.modello} (norm: ${mNorm}-${modNorm})`)
      })
      throw createError({
        statusCode: 404,
        statusMessage: `Moto usata non trovata per ${marca} ${modello}`,
        data: {
          marcaInput: marca,
          modelloInput: modello,
          marcaNorm,
          modelloNorm
        }
      })
    }
    
    console.log('✅ [API] Moto trovata:', motoTrovata.id)
    console.log('📋 [API] Dati moto trovata:', {
      id: motoTrovata.id,
      marca: motoTrovata.moto_usate_catalogo?.marca || motoTrovata.marca,
      modello: motoTrovata.moto_usate_catalogo?.modello || motoTrovata.modello,
      venditore_id: motoTrovata.venditore_id,
      venditore_type: motoTrovata.venditore_type
    })
    
    // Recupera venditore (solo concessionario)
    let venditore = null
    if (motoTrovata.venditore_type === 'concessionario') {
      // Usa service role per bypassare RLS
      // CORRETTO: Cerchiamo con user_id, non con id
      // venditore_id = auth.users.id = concessionari.user_id
      console.log(`🔍 Recupero concessionario per moto ${motoTrovata.id} con venditore_id (user_id): ${motoTrovata.venditore_id}`)
      const { data: conc, error: concError } = await supabaseService
        .from('concessionari')
        .select('id, nome, email, telefono, citta, provincia, via, descrizione, user_id')
        .eq('user_id', motoTrovata.venditore_id)
        .maybeSingle()
      
      if (concError) {
        console.error(`❌ Errore recupero concessionario:`, concError)
      } else if (conc) {
        // Se il concessionario esiste, la città DEVE essere presente (NOT NULL constraint)
        console.log(`✅ Concessionario trovato:`, { id: conc.id, user_id: conc.user_id, nome: conc.nome, citta: conc.citta })
        if (!conc.citta) {
          console.error(`❌ ERRORE: Concessionario trovato ma città è NULL! Verifica database.`)
        }
        venditore = {
          id: conc.id,
          nome: conc.nome,
          email: conc.email,
          telefono: conc.telefono,
          citta: conc.citta || null,
          provincia: conc.provincia,
          tipo: 'concessionario'
        }
      } else {
        console.warn(`⚠️ Nessun concessionario trovato per user_id: ${motoTrovata.venditore_id}`)
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
    
    const marcaMoto = motoTrovata.moto_usate_catalogo?.marca || motoTrovata.marca
    const modelloMoto = motoTrovata.moto_usate_catalogo?.modello || motoTrovata.modello
    const fotoArray = parseFoto(motoTrovata.foto)
    
    const responseData = {
      id: motoTrovata.id,
      marca: marcaMoto,
      modello: modelloMoto,
      categoria: motoTrovata.categoria || null, // categoria nella tabella moto_usate
      anno: motoTrovata.anno,
      km: motoTrovata.km,
      condizione: motoTrovata.condizione,
      prezzo: motoTrovata.prezzo,
      descrizione: motoTrovata.descrizione,
      foto: fotoArray,
      immagine_copertina: motoTrovata.immagine_copertina || (fotoArray.length > 0 ? fotoArray[0] : null),
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
      venditore: venditore,
      venditore_type: motoTrovata.venditore_type
    }
    
    console.log('✅ [API] Response data preparata:', {
      id: responseData.id,
      marca: responseData.marca,
      modello: responseData.modello,
      hasVenditore: !!responseData.venditore,
      fotoCount: responseData.foto?.length || 0
    })
    
    return responseData
    
  } catch (error) {
    console.error('Errore API by-marca-modello:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore server',
      data: error.message || String(error)
    })
  }
})
