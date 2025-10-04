import { z } from 'zod'

// Schema di validazione per i parametri
const getSlotsSchema = z.object({
  concessionario_id: z.string().uuid('ID concessionario non valido'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido')
})

export default defineEventHandler(async (event) => {
  try {
    // Verifica che sia una richiesta GET
    if (getMethod(event) !== 'GET') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // Parse e validazione dei query parameters
    const query = getQuery(event)
    const validatedData = getSlotsSchema.parse(query)

    // Connessione a Supabase
    const supabase = useSupabaseClient()

    // Verifica che il concessionario esista
    const { data: concessionario, error: concessionarioError } = await supabase
      .from('concessionari')
      .select('id, nome')
      .eq('id', validatedData.concessionario_id)
      .single()

    if (concessionarioError || !concessionario) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato'
      })
    }

    // Calcola il giorno della settimana
    const dataRichiesta = new Date(validatedData.data)
    const giornoSettimana = dataRichiesta.getDay()

    // Ottieni gli slot disponibili per quel giorno
    const { data: slotDisponibili, error: slotError } = await supabase
      .from('slot_disponibili')
      .select('*')
      .eq('concessionario_id', validatedData.concessionario_id)
      .eq('giorno_settimana', giornoSettimana)
      .eq('attivo', true)

    if (slotError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel recupero degli slot'
      })
    }

    if (!slotDisponibili || slotDisponibili.length === 0) {
      return {
        success: true,
        data: {
          concessionario: concessionario.nome,
          data: validatedData.data,
          slot_disponibili: []
        },
        message: 'Nessuno slot disponibile per questo giorno'
      }
    }

    // Ottieni gli appuntamenti già prenotati per quella data
    const { data: appuntamentiEsistenti, error: appuntamentiError } = await supabase
      .from('appuntamenti')
      .select('orario_appuntamento')
      .eq('concessionario_id', validatedData.concessionario_id)
      .eq('data_appuntamento', validatedData.data)
      .in('stato', ['pending', 'confirmed'])

    if (appuntamentiError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel controllo appuntamenti esistenti'
      })
    }

    // Genera gli slot orari disponibili
    const slotOrari: string[] = []
    const orariOccupati = appuntamentiEsistenti?.map(a => a.orario_appuntamento) || []

    slotDisponibili.forEach(slot => {
      const inizio = new Date(`2000-01-01T${slot.orario_inizio}`)
      const fine = new Date(`2000-01-01T${slot.orario_fine}`)
      const durataSlot = slot.slot_durata || 60 // minuti

      let orarioCorrente = new Date(inizio)
      
      while (orarioCorrente < fine) {
        const orarioString = orarioCorrente.toTimeString().slice(0, 5)
        
        // Controlla se l'orario è già occupato
        if (!orariOccupati.includes(orarioString)) {
          slotOrari.push(orarioString)
        }
        
        // Avanza al prossimo slot
        orarioCorrente.setMinutes(orarioCorrente.getMinutes() + durataSlot)
      }
    })

    // Ordina gli orari
    slotOrari.sort()

    return {
      success: true,
      data: {
        concessionario: concessionario.nome,
        data: validatedData.data,
        slot_disponibili: slotOrari,
        slot_info: slotDisponibili.map(slot => ({
          orario_inizio: slot.orario_inizio,
          orario_fine: slot.orario_fine,
          durata_slot: slot.slot_durata
        }))
      }
    }

  } catch (error) {
    console.error('Errore nel recupero slot:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})
