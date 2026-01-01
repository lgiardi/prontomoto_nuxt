import { z } from 'zod'

const createAppointmentFromConversationSchema = z.object({
  conversazione_id: z.string().uuid('ID conversazione non valido'),
  data_appuntamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido'),
  orario_appuntamento: z.string().regex(/^\d{2}:\d{2}$/, 'Formato orario non valido'),
  note: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    const body = await readBody(event)
    const validatedData = createAppointmentFromConversationSchema.parse(body)

    const supabase = useSupabaseClient()

    // Recupera la conversazione con tutti i dati collegati
    const { data: conversazione, error: convError } = await supabase
      .from('conversazioni')
      .select(`
        *,
        lead:lead(conversazione_id)
      `)
      .eq('id', validatedData.conversazione_id)
      .single()

    if (convError || !conversazione) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Conversazione non trovata'
      })
    }

    // Recupera il lead collegato (se esiste)
    const { data: lead, error: leadError } = await supabase
      .from('lead')
      .select('id')
      .eq('conversazione_id', validatedData.conversazione_id)
      .maybeSingle()

    if (leadError && leadError.code !== 'PGRST116') {
      console.error('Errore recupero lead:', leadError)
    }

    const concessionarioId = conversazione.concessionario_id

    // Verifica che il concessionario esista
    const { data: concessionario, error: concessionarioError } = await supabase
      .from('concessionari')
      .select('id, nome, email')
      .eq('id', concessionarioId)
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
      .eq('concessionario_id', concessionarioId)
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
      .eq('concessionario_id', concessionarioId)
      .eq('data_appuntamento', validatedData.data_appuntamento)
      .eq('orario_appuntamento', validatedData.orario_appuntamento)
      .in('stato', ['pending', 'confirmed'])

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

    // Prepara i dati per l'appuntamento
    const appointmentData: any = {
      concessionario_id: concessionarioId,
      conversazione_id: validatedData.conversazione_id,
      data_appuntamento: validatedData.data_appuntamento,
      orario_appuntamento: validatedData.orario_appuntamento,
      tipo_appuntamento: 'visita',
      stato: 'pending',
      tipo_richiesta: conversazione.tipo_richiesta || 'moto_nuova',
      // Dati cliente dalla conversazione
      cliente_nome: conversazione.cliente_nome,
      cliente_email: conversazione.cliente_email,
      cliente_telefono: conversazione.cliente_telefono || null,
      note: validatedData.note || null,
      ip_address: getClientIP(event),
      user_agent: getHeader(event, 'user-agent')
    }

    // Aggiungi lead_id se esiste
    if (lead?.id) {
      appointmentData.lead_id = lead.id
    }

    // Aggiungi i campi specifici in base al tipo di richiesta
    if (conversazione.tipo_richiesta === 'moto_nuova' && conversazione.moto_id) {
      appointmentData.moto_id = conversazione.moto_id
      appointmentData.moto_marca = conversazione.moto_marca
      appointmentData.moto_modello = conversazione.moto_modello
    } else if (conversazione.tipo_richiesta === 'moto_usata' && conversazione.moto_usata_id) {
      appointmentData.moto_usata_id = conversazione.moto_usata_id
      appointmentData.moto_marca = conversazione.moto_marca
      appointmentData.moto_modello = conversazione.moto_modello
    } else if (conversazione.tipo_richiesta === 'servizio' && conversazione.servizio_concessionario_id) {
      appointmentData.servizio_concessionario_id = conversazione.servizio_concessionario_id
    }

    // Crea l'appuntamento
    const { data: nuovoAppuntamento, error: insertError } = await supabase
      .from('appuntamenti')
      .insert(appointmentData)
      .select()
      .single()

    if (insertError) {
      console.error('Errore creazione appuntamento:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nella creazione dell\'appuntamento'
      })
    }

    // Aggiorna il lead con riferimento all'appuntamento (se esiste)
    if (lead?.id) {
      await supabase
        .from('lead')
        .update({ 
          // Nota: se la tabella lead ha un campo appuntamento_id, aggiungilo qui
        })
        .eq('id', lead.id)
    }

    // Invia email di notifica (non bloccante)
    try {
      const config = useRuntimeConfig()
      const { sendAppointmentNotificationToDealer, sendAppointmentConfirmationToCustomer } = await import('~/utils/emailService')
      
      // Notifica al concessionario
      await sendAppointmentNotificationToDealer({
        ...nuovoAppuntamento,
        concessionario_nome: concessionario.nome,
        concessionario_email: concessionario.email
      }, config)
      
      // Conferma al cliente
      await sendAppointmentConfirmationToCustomer({
        ...nuovoAppuntamento,
        concessionario_nome: concessionario.nome
      }, config)
    } catch (emailError) {
      console.error('❌ Errore invio email appuntamento:', emailError)
      // Non bloccare il processo se l'email fallisce
    }

    return {
      success: true,
      data: nuovoAppuntamento,
      message: 'Appuntamento creato con successo'
    }

  } catch (error) {
    console.error('Errore nella creazione appuntamento da conversazione:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})

