import { z } from 'zod'

// Schema di validazione per la creazione di un appuntamento
const createAppointmentSchema = z.object({
  nome: z.string().min(1, 'Nome richiesto'),
  cognome: z.string().min(1, 'Cognome richiesto'),
  email: z.string().email('Email non valida'),
  telefono: z.string().optional(),
  note: z.string().optional(),
  data_appuntamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido'),
  orario_appuntamento: z.string().regex(/^\d{2}:\d{2}$/, 'Formato orario non valido'),
  concessionario_id: z.string().uuid('ID concessionario non valido'),
  moto_id: z.string().optional(),
  servizio: z.string().min(1, 'Servizio richiesto')
})

export default defineEventHandler(async (event) => {
  try {
    // Verifica che sia una richiesta POST
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // Parse e validazione del body
    const body = await readBody(event)
    const validatedData = createAppointmentSchema.parse(body)

    // Connessione a Supabase
    const supabase = useSupabaseClient()

    // Verifica che il concessionario esista
    const { data: concessionario, error: concessionarioError } = await supabase
      .from('concessionari')
      .select('id, nome, email')
      .eq('id', validatedData.concessionario_id)
      .single()

    if (concessionarioError || !concessionario) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato'
      })
    }

    // Verifica che lo slot sia disponibile
    const dataAppuntamento = new Date(validatedData.data_appuntamento)
    const giornoSettimana = dataAppuntamento.getDay()
    
    // Controlla se ci sono slot disponibili per quel giorno
    const { data: slotDisponibili, error: slotError } = await supabase
      .from('slot_disponibili')
      .select('*')
      .eq('concessionario_id', validatedData.concessionario_id)
      .eq('giorno_settimana', giornoSettimana)
      .eq('attivo', true)

    if (slotError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel controllo disponibilità'
      })
    }

    if (!slotDisponibili || slotDisponibili.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nessuno slot disponibile per questo giorno'
      })
    }

    // Verifica che l'orario sia all'interno degli slot disponibili
    const orarioAppuntamento = validatedData.orario_appuntamento
    const slotValido = slotDisponibili.some(slot => {
      return orarioAppuntamento >= slot.orario_inizio && 
             orarioAppuntamento < slot.orario_fine
    })

    if (!slotValido) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Orario non disponibile'
      })
    }

    // Verifica che non ci sia già un appuntamento per lo stesso slot
    const { data: appuntamentoEsistente, error: checkError } = await supabase
      .from('appuntamenti')
      .select('id')
      .eq('concessionario_id', validatedData.concessionario_id)
      .eq('data_appuntamento', validatedData.data_appuntamento)
      .eq('orario_appuntamento', validatedData.orario_appuntamento)
      .eq('stato', 'pending')

    if (checkError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel controllo conflitti'
      })
    }

    if (appuntamentoEsistente && appuntamentoEsistente.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Slot già occupato'
      })
    }

    // Crea l'appuntamento
    const { data: nuovoAppuntamento, error: insertError } = await supabase
      .from('appuntamenti')
      .insert({
        nome: validatedData.nome,
        cognome: validatedData.cognome,
        email: validatedData.email,
        telefono: validatedData.telefono,
        note: validatedData.note,
        data_appuntamento: validatedData.data_appuntamento,
        orario_appuntamento: validatedData.orario_appuntamento,
        concessionario_id: validatedData.concessionario_id,
        moto_id: validatedData.moto_id,
        servizio: validatedData.servizio,
        ip_address: getClientIP(event),
        user_agent: getHeader(event, 'user-agent')
      })
      .select()
      .single()

    if (insertError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nella creazione dell\'appuntamento'
      })
    }

    // Recupera i dati del concessionario per l'email
    const { data: concessionarioData, error: dealerError } = await supabase
      .from('concessionari')
      .select('nome, email')
      .eq('id', validatedData.concessionario_id)
      .single()

    // Invia email di notifica (non bloccante)
    if (!dealerError && concessionarioData) {
      try {
        const config = useRuntimeConfig()
        const { sendAppointmentNotificationToDealer, sendAppointmentConfirmationToCustomer } = await import('~/utils/emailService')
        
        // Notifica al concessionario
        await sendAppointmentNotificationToDealer({
          ...nuovoAppuntamento,
          concessionario_nome: concessionarioData.nome,
          concessionario_email: concessionarioData.email
        }, config)
        
        // Conferma al cliente
        await sendAppointmentConfirmationToCustomer({
          ...nuovoAppuntamento,
          concessionario_nome: concessionarioData.nome
        }, config)
      } catch (emailError) {
        console.error('❌ Errore invio email appuntamento:', emailError)
        // Non bloccare il processo se l'email fallisce
      }
    }

    return {
      success: true,
      data: nuovoAppuntamento,
      message: 'Appuntamento creato con successo'
    }

  } catch (error) {
    console.error('Errore nella creazione appuntamento:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})
