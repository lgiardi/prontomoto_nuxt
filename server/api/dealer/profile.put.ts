import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { user_id, updateData } = body

    if (!user_id || !updateData) {
      return { success: false, error: 'Missing user_id or updateData' }
    }

    console.log('Updating dealer profile for user:', user_id)
    console.log('Update data:', updateData)

    // Assicurati che i campi array siano sempre array validi
    if (updateData.marchi_trattati && !Array.isArray(updateData.marchi_trattati)) {
      updateData.marchi_trattati = []
    }
    if (updateData.servizi && !Array.isArray(updateData.servizi)) {
      updateData.servizi = []
    }

    // Prova prima con user_id
    let { data, error } = await supabaseAdmin
      .from('concessionari')
      .update(updateData)
      .eq('user_id', user_id)
      .select()

    // Se non trova nulla, prova a creare il concessionario
    if (!data || data.length === 0) {
      console.log('No existing record found, creating new dealer...')
      
      const { data: newDealer, error: createError } = await supabaseAdmin
        .from('concessionari')
        .insert({
          user_id: user_id,
          ...updateData,
          status: 'pending',
          subscription_plan: 'basic',
          subscription_status: 'inactive',
          is_attivo: true,
          data_iscrizione: new Date().toISOString()
        })
        .select()

      if (createError) {
        console.error('Error creating dealer:', createError)
        return { success: false, error: createError.message }
      }

      return { success: true, data: newDealer, created: true }
    }

    if (error) {
      console.error('Error updating dealer:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data, created: false }

  } catch (error) {
    console.error('Server error:', error)
    return { success: false, error: error.message }
  }
})
