import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      motoId, 
      concessionarioId, 
      motoMarca, 
      motoModello,
      nomeCliente, 
      emailCliente, 
      telefonoCliente, 
      messaggio, 
      tipoRichiesta = 'informazioni' 
    } = body

    // Validazione dei campi obbligatori
    if (!motoId || !concessionarioId || !nomeCliente || !emailCliente) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Campi obbligatori mancanti: motoId, concessionarioId, nomeCliente, emailCliente'
      })
    }

    console.log('📝 Creazione nuovo lead:', {
      motoId,
      concessionarioId,
      motoMarca,
      motoModello,
      nomeCliente,
      emailCliente,
      tipoRichiesta
    })

    // Inserisci il lead nel database
    const { data: leadData, error: leadError } = await supabase
      .from('lead')
      .insert({
        moto_id: motoId,
        concessionario_id: concessionarioId,
        moto_marca: motoMarca,
        moto_modello: motoModello,
        nome_cliente: nomeCliente,
        email_cliente: emailCliente,
        telefono_cliente: telefonoCliente,
        messaggio: messaggio,
        tipo_richiesta: tipoRichiesta,
        status: 'nuovo',
        priorita: 'media',
        fonte: 'sito_web'
      })
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

    console.log('✅ Lead creato con successo:', leadData.id)

    // Se il tipo richiesta è 'appuntamento', crea anche un appuntamento
    if (tipoRichiesta === 'appuntamento') {
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appuntamenti')
        .insert({
          lead_id: leadData.id,
          concessionario_id: concessionarioId,
          cliente_nome: nomeCliente,
          cliente_email: emailCliente,
          cliente_telefono: telefonoCliente,
          moto_id: motoId,
          moto_marca: motoMarca,
          moto_modello: motoModello,
          tipo_appuntamento: 'visita',
          status: 'programmato',
          note: messaggio
        })
        .select()
        .single()

      if (appointmentError) {
        console.error('❌ Errore creazione appuntamento:', appointmentError)
        // Non bloccare il processo se l'appuntamento non viene creato
      } else {
        console.log('✅ Appuntamento creato con successo:', appointmentData.id)
      }
    }

    return {
      success: true,
      leadId: leadData.id,
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






