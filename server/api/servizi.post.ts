import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

const supabase = createClient(supabaseUrl, supabaseKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Schema di validazione
const createServizioSchema = z.object({
  servizio_catalogo_id: z.string().uuid('ID servizio catalogo non valido'),
  prezzo_da: z.number().min(0, 'Prezzo deve essere positivo'),
  prezzo_a: z.number().min(0, 'Prezzo massimo deve essere positivo').optional().nullable(),
  durata_minuti: z.number().min(1, 'Durata deve essere almeno 1 minuto').optional().nullable(),
  descrizione: z.string().min(1, 'Descrizione richiesta'),
  foto: z.union([z.array(z.string()), z.null(), z.undefined()]).optional().default([]), // Array di URL o null
  disponibile: z.boolean().default(true)
})

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

    // Verifica che sia una richiesta POST
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // Verifica il token e ottieni l'utente - usa questo client per tutte le operazioni DB
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

    // Usa il client autenticato per le verifiche
    const supabaseClient = supabaseAuth
    // Usa admin client per l'inserimento (bypassa RLS dopo aver verificato i permessi)
    const supabaseForInsert = supabaseAdmin

    // Parse e validazione del body
    const body = await readBody(event)
    console.log('📥 Body ricevuto:', JSON.stringify(body, null, 2))
    
    try {
      var validatedData = createServizioSchema.parse(body)
    } catch (validationError) {
      console.error('❌ Errore validazione Zod:', validationError.errors || validationError)
      throw createError({
        statusCode: 400,
        statusMessage: 'Dati non validi',
        data: validationError.errors || validationError.message
      })
    }

    console.log('🔧 Dati validati:', JSON.stringify(validatedData, null, 2))
    console.log('👤 Utente autenticato:', user.id)

    // Verifica che il servizio catalogo esista
    const { data: servizioCatalogo, error: catalogoError } = await supabaseClient
      .from('servizi_catalogo')
      .select('id, nome, categoria')
      .eq('id', validatedData.servizio_catalogo_id)
      .single()

    if (catalogoError || !servizioCatalogo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Servizio catalogo non trovato'
      })
    }

    // Verifica che il concessionario esista
    // Secondo lo schema, concessionari.id è un riferimento diretto a auth.users(id)
    // Quindi concessionario.id dovrebbe essere uguale a user.id
    let { data: concessionario, error: dealerError } = await supabaseClient
      .from('concessionari')
      .select('id, nome, status')
      .eq('id', user.id)
      .maybeSingle()
    
    // Se non trova con id = user.id, prova anche con user_id (se esiste il campo)
    if (dealerError || !concessionario) {
      const { data: concessionarioByUserId, error: dealerErrorByUserId } = await supabaseClient
        .from('concessionari')
        .select('id, nome, status, user_id')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (!dealerErrorByUserId && concessionarioByUserId) {
        concessionario = concessionarioByUserId
        dealerError = null
        console.log('✅ Concessionario trovato tramite user_id')
      }
    }
    
    // Se ancora non trova, usa user.id direttamente come fallback
    if (!concessionario) {
      console.warn('⚠️ Concessionario non trovato nella tabella, uso user.id come fallback')
      concessionario = {
        id: user.id,
        nome: 'Concessionario',
        status: 'active'
      }
    }

    if (dealerError) {
      console.error('❌ Errore ricerca concessionario:', dealerError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato'
      })
    }

    if (!concessionario) {
      console.error('❌ Concessionario non trovato per user_id:', user.id)
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato'
      })
    }

    // Verifica che il concessionario sia attivo
    if (concessionario.status !== 'active') {
      throw createError({
        statusCode: 403,
        statusMessage: `Concessionario non attivo. Status attuale: ${concessionario.status}. Contatta il supporto per attivare il tuo account.`
      })
    }

    console.log('✅ Concessionario trovato:', concessionario.nome, 'Status:', concessionario.status)
    console.log('📝 Concessionario ID:', concessionario.id, 'User ID:', user.id, 'User_id field:', concessionario.user_id)
    
    // Verifica che concessionario.id sia valido (non null/undefined)
    if (!concessionario.id) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore: ID concessionario non valido'
      })
    }

    // Usa user.id come concessionario_id se concessionario.id è diverso
    // Questo gestisce il caso in cui concessionario.id sia diverso da user.id
    const concessionarioIdToUse = concessionario.id

    // Verifica che non esista già questo servizio per questo concessionario
    const { data: existingServizio, error: checkError } = await supabaseClient
      .from('servizi_concessionari')
      .select('id')
      .eq('servizio_catalogo_id', validatedData.servizio_catalogo_id)
      .or(`concessionario_id.eq.${user.id},concessionario_id.eq.${concessionario.id}`)
      .maybeSingle()

    // Se checkError esiste e non è "nessun risultato", è un errore reale
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Errore verifica servizio esistente:', checkError)
    }

    if (existingServizio) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Hai già aggiunto questo servizio'
      })
    }

    // Prepara i dati foto - gestisci sia array che null/undefined
    let fotoValue = null
    let immagineUrlValue = null
    
    if (validatedData.foto && Array.isArray(validatedData.foto) && validatedData.foto.length > 0) {
      // Filtra solo URL validi (non vuoti)
      const fotoFiltered = validatedData.foto.filter(url => url && typeof url === 'string' && url.trim() !== '')
      if (fotoFiltered.length > 0) {
        fotoValue = fotoFiltered
        // Per retrocompatibilità, salva anche la prima immagine in immagine_url
        immagineUrlValue = fotoFiltered[0]
      }
    }

    // Crea il servizio - usa concessionario.id (deve esistere nella tabella concessionari)
    const servizioData = {
      servizio_catalogo_id: validatedData.servizio_catalogo_id,
      concessionario_id: concessionario.id, // Usa l'ID del concessionario dalla tabella
      prezzo_da: validatedData.prezzo_da,
      prezzo_a: validatedData.prezzo_a || null,
      durata_minuti: validatedData.durata_minuti || null,
      descrizione: validatedData.descrizione,
      disponibile: validatedData.disponibile
    }
    
    console.log('📝 Usando concessionario_id:', servizioData.concessionario_id, '(concessionario.id dalla tabella)')
    console.log('📝 User ID:', user.id, 'Concessionario ID:', concessionario.id)
    console.log('📝 Verifica: concessionario.id è UUID?', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(concessionario.id))
    
    // Verifica che il concessionario esista nel database prima di inserire
    const { data: verifyConcessionario, error: verifyError } = await supabaseForInsert
      .from('concessionari')
      .select('id')
      .eq('id', concessionario.id)
      .single()
    
    if (verifyError || !verifyConcessionario) {
      console.error('❌ Concessionario non trovato nel DB con ID:', concessionario.id)
      throw createError({
        statusCode: 500,
        statusMessage: `Errore: Il concessionario con ID ${concessionario.id} non esiste nel database`
      })
    }
    
    console.log('✅ Concessionario verificato nel DB:', verifyConcessionario.id)

    // Aggiungi immagine_url (campo esistente sicuro)
    if (immagineUrlValue) {
      servizioData.immagine_url = immagineUrlValue
    }
    
    // NON aggiungiamo foto per ora - usa solo immagine_url
    // TODO: Quando il campo foto è aggiunto al DB, decommentare:
    // if (fotoValue && fotoValue.length > 0) {
    //   servizioData.foto = fotoValue
    // }

    console.log('📝 Dati servizio da inserire:', JSON.stringify(servizioData, null, 2))
    console.log('📝 Tipo foto:', typeof fotoValue, 'È array?', Array.isArray(fotoValue))
    console.log('📝 Concessionario ID:', concessionario.id)

    // Prova inserimento
    let nuovoServizio = null
    let insertError = null
    
    // Usa admin client per l'inserimento (bypassa RLS, ma abbiamo già verificato i permessi)
    let { data: insertData, error: insertErr } = await supabaseForInsert
      .from('servizi_concessionari')
      .insert(servizioData)
      .select('id')
      .single()

    if (insertErr) {
      console.error('❌ Errore inserimento base:', insertErr)
      insertError = insertErr
    } else {
      console.log('✅ Inserimento base riuscito, ID:', insertData.id)
      
      // Ora recupera con i join
      const { data: fullData, error: selectErr } = await supabaseClient
        .from('servizi_concessionari')
        .select(`
          *,
          servizi_catalogo!inner(
            id,
            nome,
            slug,
            categoria,
            descrizione_breve,
            icona
          ),
          concessionari!inner(
            id,
            nome,
            citta,
            provincia
          )
        `)
        .eq('id', insertData.id)
        .single()

      if (selectErr) {
        console.error('❌ Errore recupero con join:', selectErr)
        insertError = selectErr
      } else {
        nuovoServizio = fullData
        insertError = null
      }
    }

    if (insertError) {
      console.error('❌ Errore creazione servizio COMPLETO:', JSON.stringify(insertError, null, 2))
      console.error('❌ Dettagli errore:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })
      throw createError({
        statusCode: 500,
        statusMessage: insertError.message || 'Errore nella creazione del servizio',
        data: {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        }
      })
    }

    console.log('✅ Servizio creato:', nuovoServizio.id)

    return {
      success: true,
      data: nuovoServizio,
      message: `Servizio "${servizioCatalogo.nome}" aggiunto con successo!`
    }

  } catch (error) {
    console.error('❌ Errore API creazione servizio:', error)
    console.error('❌ Stack trace:', error.stack)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Errore nella creazione del servizio',
      data: error.stack || error.message
    })
  }
})
