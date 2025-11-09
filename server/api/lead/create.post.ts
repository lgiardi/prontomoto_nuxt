import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      motoId, 
      motoUsataId,
      servizioConcessionarioId,
      conversazioneId,
      concessionarioId, 
      motoMarca, 
      motoModello,
      nomeCliente, 
      emailCliente, 
      telefonoCliente, 
      messaggio, 
      tipoRichiesta = 'moto_nuova' 
    } = body

    // Validazione dei campi obbligatori
    if (!concessionarioId || !nomeCliente || !emailCliente) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Campi obbligatori mancanti: concessionarioId, nomeCliente, emailCliente'
      })
    }

    // Determina il tipo di richiesta se non specificato
    let finalTipoRichiesta = tipoRichiesta
    if (!finalTipoRichiesta || finalTipoRichiesta === 'informazioni') {
      if (motoUsataId) {
        finalTipoRichiesta = 'moto_usata'
      } else if (servizioConcessionarioId) {
        finalTipoRichiesta = 'servizio'
      } else if (motoId) {
        finalTipoRichiesta = 'moto_nuova'
      }
    }

    console.log('📝 Creazione nuovo lead:', {
      motoId,
      motoUsataId,
      servizioConcessionarioId,
      conversazioneId,
      concessionarioId,
      motoMarca,
      motoModello,
      nomeCliente,
      emailCliente,
      tipoRichiesta: finalTipoRichiesta
    })

    // Prepara i dati del lead
    const leadData: any = {
      conversazione_id: conversazioneId || null,
      concessionario_id: concessionarioId,
      nome_cliente: nomeCliente,
      email_cliente: emailCliente,
      telefono_cliente: telefonoCliente || null,
      messaggio: messaggio || null,
      tipo_richiesta: finalTipoRichiesta,
      status: 'nuovo',
      priorita: 'media',
      fonte: 'sito_web'
    }

    // Aggiungi i campi specifici in base al tipo di richiesta
    if (finalTipoRichiesta === 'moto_nuova' && motoId) {
      leadData.moto_id = motoId
      leadData.moto_marca = motoMarca || null
      leadData.moto_modello = motoModello || null
    } else if (finalTipoRichiesta === 'moto_usata' && motoUsataId) {
      leadData.moto_usata_id = motoUsataId
      leadData.moto_marca = motoMarca || null
      leadData.moto_modello = motoModello || null
    } else if (finalTipoRichiesta === 'servizio' && servizioConcessionarioId) {
      leadData.servizio_concessionario_id = servizioConcessionarioId
      // Per servizi, marca/modello possono essere null
      if (motoMarca) leadData.moto_marca = motoMarca
      if (motoModello) leadData.moto_modello = motoModello
    } else {
      // Fallback: se c'è motoId ma tipo non specificato, usa moto_nuova
      if (motoId) {
        leadData.moto_id = motoId
        leadData.moto_marca = motoMarca || null
        leadData.moto_modello = motoModello || null
        leadData.tipo_richiesta = 'moto_nuova'
      }
    }

    // Inserisci il lead nel database
    const { data: leadResult, error: leadError } = await supabase
      .from('lead')
      .insert(leadData)
      .select()
      .single()

    if (leadError) {
      console.error('❌ Errore creazione lead:', leadError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nel salvataggio del lead',
        data: leadError.message
      })
    }

    console.log('✅ Lead creato con successo:', leadResult.id)

    // Se il tipo richiesta è 'appuntamento', crea anche un appuntamento
    if (tipoRichiesta === 'appuntamento') {
      const appointmentData: any = {
        lead_id: leadResult.id,
        conversazione_id: conversazioneId || null,
        concessionario_id: concessionarioId,
        cliente_nome: nomeCliente,
        cliente_email: emailCliente,
        cliente_telefono: telefonoCliente || null,
        tipo_appuntamento: 'visita',
        status: 'programmato',
        note: messaggio || null
      }

      // Aggiungi i campi specifici in base al tipo
      if (finalTipoRichiesta === 'moto_nuova' && motoId) {
        appointmentData.moto_id = motoId
        appointmentData.moto_marca = motoMarca || null
        appointmentData.moto_modello = motoModello || null
      } else if (finalTipoRichiesta === 'moto_usata' && motoUsataId) {
        appointmentData.moto_usata_id = motoUsataId
        appointmentData.moto_marca = motoMarca || null
        appointmentData.moto_modello = motoModello || null
      } else if (finalTipoRichiesta === 'servizio' && servizioConcessionarioId) {
        appointmentData.servizio_concessionario_id = servizioConcessionarioId
      }

      const { data: appointmentResult, error: appointmentError } = await supabase
        .from('appuntamenti')
        .insert(appointmentData)
        .select()
        .single()

      if (appointmentError) {
        console.error('❌ Errore creazione appuntamento:', appointmentError)
        // Non bloccare il processo se l'appuntamento non viene creato
      } else {
        console.log('✅ Appuntamento creato con successo:', appointmentResult.id)
      }
    }

    return {
      success: true,
      leadId: leadResult.id,
      message: 'Lead creato con successo'
    }

  } catch (error) {
    console.error('❌ Errore API creazione lead:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server durante la creazione del lead',
      data: error.data || error.message
    })
  }
})






