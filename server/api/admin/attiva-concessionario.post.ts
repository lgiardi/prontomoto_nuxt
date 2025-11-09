import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email richiesta'
      })
    }

    console.log(`🔧 Attivazione concessionario per email: ${email}`)

    // Cerca il concessionario per email
    const { data: concessionario, error: findError } = await supabaseAdmin
      .from('concessionari')
      .select('id, nome, email, status')
      .eq('email', email)
      .single()

    if (findError || !concessionario) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Concessionario non trovato'
      })
    }

    console.log(`📋 Concessionario trovato: ${concessionario.nome}, status attuale: ${concessionario.status}`)

    // Aggiorna lo status a 'active'
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('concessionari')
      .update({ status: 'active' })
      .eq('id', concessionario.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Errore aggiornamento status:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Errore nell\'attivazione del concessionario',
        data: updateError.message
      })
    }

    console.log(`✅ Concessionario ${concessionario.nome} attivato con successo!`)

    return {
      success: true,
      message: `Concessionario ${concessionario.nome} attivato con successo`,
      data: updated
    }

  } catch (error) {
    console.error('❌ Errore API attivazione concessionario:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nell\'attivazione del concessionario',
      data: error.message
    })
  }
})
