import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const leadId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { 
      status, 
      priorita, 
      noteInternal, 
      rispostaConcessionario,
      dataRisposta 
    } = body

    if (!leadId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID lead è obbligatorio'
      })
    }

    console.log('📝 Aggiornamento lead:', leadId, body)

    // Prepara i dati da aggiornare
    const updateData: any = {}
    
    if (status) updateData.status = status
    if (priorita) updateData.priorita = priorita
    if (noteInternal) updateData.note_internal = noteInternal
    if (rispostaConcessionario) updateData.risposta_concessionario = rispostaConcessionario
    if (dataRisposta) updateData.data_risposta = dataRisposta

    // Se viene fornita una risposta, imposta automaticamente la data
    if (rispostaConcessionario && !dataRisposta) {
      updateData.data_risposta = new Date().toISOString()
    }

    // Aggiorna il lead
    const { data: leadData, error: leadError } = await supabase
      .from('lead')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single()

    if (leadError) {
      console.error('❌ Errore aggiornamento lead:', leadError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nell\'aggiornamento del lead',
        data: leadError.message
      })
    }

    console.log('✅ Lead aggiornato con successo:', leadId)

    return {
      success: true,
      lead: leadData,
      message: 'Lead aggiornato con successo'
    }

  } catch (error) {
    console.error('❌ Errore API aggiornamento lead:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Errore del server durante l\'aggiornamento del lead',
      data: error.data || error.message
    })
  }
})






