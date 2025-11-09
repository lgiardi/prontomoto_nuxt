import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

const supabase = createClient(supabaseUrl, supabaseKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Schema di validazione per l'aggiornamento
const updateServizioSchema = z.object({
  prezzo_da: z.number().min(0, 'Prezzo deve essere positivo').optional(),
  prezzo_a: z.number().min(0, 'Prezzo massimo deve essere positivo').optional().nullable(),
  durata_minuti: z.number().min(1, 'Durata deve essere almeno 1 minuto').optional().nullable(),
  descrizione: z.string().min(1, 'Descrizione richiesta').optional(),
  foto: z.array(z.string()).optional(), // Array di URL (non validiamo URL perché possono essere percorsi locali)
  disponibile: z.boolean().optional()
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

    // Verifica che sia una richiesta PUT
    if (getMethod(event) !== 'PUT') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

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

    // Ottieni l'ID del servizio dalla route
    const servizioId = getRouterParam(event, 'id')
    
    if (!servizioId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID servizio richiesto'
      })
    }

    // Parse e validazione del body
    const body = await readBody(event)
    const validatedData = updateServizioSchema.parse(body)

    console.log('🔧 Aggiornamento servizio...', { servizioId, validatedData })
    console.log('👤 Utente autenticato:', user.id)

    // Trova il concessionario usando user_id con client autenticato
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

    // Verifica che il servizio esista - prima cerca senza filtro concessionario per vedere se esiste
    console.log('🔍 Cerca servizio con ID:', servizioId)
    
    // Usa admin client per cercare senza RLS
    const { data: servizioEsistente, error: checkError } = await supabaseAdmin
      .from('servizi_concessionari')
      .select(`
        *,
        servizi_catalogo!inner(
          id,
          nome,
          slug,
          categoria
        ),
        concessionari!inner(
          id,
          nome,
          user_id
        )
      `)
      .eq('id', servizioId)
      .maybeSingle()

    console.log('📝 Servizio trovato:', servizioEsistente ? 'Sì' : 'No')
    console.log('📝 Concessionario_id del servizio:', servizioEsistente?.concessionario_id)
    console.log('📝 Concessionario.id cercato:', concessionario.id)
    console.log('📝 User.id:', user.id)

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Errore verifica servizio esistente:', checkError)
    }

    if (!servizioEsistente) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Servizio non trovato'
      })
    }

    // Verifica che il servizio appartenga al concessionario
    // Il servizio può essere salvato con concessionario.id o user.id (confronta come stringhe)
    const servizioConcessionarioId = String(servizioEsistente.concessionario_id)
    const concessionarioIdStr = String(concessionario.id)
    const userIdStr = String(user.id)
    
    if (servizioConcessionarioId !== concessionarioIdStr && servizioConcessionarioId !== userIdStr) {
      console.error('❌ Servizio non autorizzato')
      console.error('   Servizio concessionario_id:', servizioConcessionarioId)
      console.error('   Concessionario.id:', concessionarioIdStr)
      console.error('   User.id:', userIdStr)
      throw createError({
        statusCode: 403,
        statusMessage: 'Non autorizzato - il servizio non appartiene al tuo account'
      })
    }

    console.log('✅ Servizio trovato e autorizzato')

    // Prepara i dati per l'aggiornamento
    const updateData = {}
    
    if (validatedData.prezzo_da !== undefined) updateData.prezzo_da = validatedData.prezzo_da
    if (validatedData.prezzo_a !== undefined) updateData.prezzo_a = validatedData.prezzo_a
    if (validatedData.durata_minuti !== undefined) updateData.durata_minuti = validatedData.durata_minuti
    if (validatedData.descrizione !== undefined) updateData.descrizione = validatedData.descrizione
    if (validatedData.disponibile !== undefined) updateData.disponibile = validatedData.disponibile
    
    // Gestisci foto e immagine_url
    if (validatedData.foto !== undefined) {
      const fotoFiltered = validatedData.foto.filter(url => url && typeof url === 'string' && url.trim() !== '')
      if (fotoFiltered.length > 0) {
        // Aggiorna immagine_url con la prima foto per retrocompatibilità
        updateData.immagine_url = fotoFiltered[0]
      } else {
        updateData.immagine_url = null
      }
      // NON aggiorniamo foto per ora (campo potrebbe non esistere)
    }
    
    console.log('📝 Dati servizio da aggiornare:', updateData)

    // Aggiorna il servizio usando admin client (bypassa RLS dopo aver verificato i permessi)
    const { data: servizioAggiornato, error: updateError } = await supabaseAdmin
      .from('servizi_concessionari')
      .update(updateData)
      .eq('id', servizioId)
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
      .single()

    if (updateError) {
      console.error('❌ Errore aggiornamento servizio:', updateError)
      console.error('❌ Dettagli errore:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      })
      throw createError({
        statusCode: 500,
        statusMessage: updateError.message || 'Errore nell\'aggiornamento del servizio',
        data: {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        }
      })
    }

    console.log('✅ Servizio aggiornato:', servizioAggiornato.id)

    return {
      success: true,
      data: servizioAggiornato,
      message: `Servizio "${servizioEsistente.servizi_catalogo.nome}" aggiornato con successo!`
    }

  } catch (error) {
    console.error('❌ Errore API aggiornamento servizio:', error)
    
    if (error.statusCode) {
      throw error
    }

    return {
      success: false,
      error: error.message || 'Errore nell\'aggiornamento del servizio'
    }
  }
})
