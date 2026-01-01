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

    // Se si sta aggiornando l'email, verifica che non sia già in uso da un altro concessionario
    if (updateData.email) {
      // Prima recupera il concessionario corrente per escluderlo dal controllo
      const { data: currentDealer } = await supabaseAdmin
        .from('concessionari')
        .select('id, email')
        .eq('user_id', user_id)
        .maybeSingle()

      // Verifica se l'email è già in uso da un altro concessionario
      const { data: existingDealer, error: checkError } = await supabaseAdmin
        .from('concessionari')
        .select('id, email')
        .eq('email', updateData.email)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking email:', checkError)
        return { success: false, error: 'Errore nella verifica dell\'email' }
      }

      // Se l'email esiste e appartiene a un altro concessionario, restituisci errore
      if (existingDealer && (!currentDealer || existingDealer.id !== currentDealer.id)) {
        console.error('Email già in uso:', updateData.email)
        return { 
          success: false, 
          error: 'Questa email è già utilizzata da un altro concessionario. Scegli un\'altra email.' 
        }
      }
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
      
      // Se si sta creando con un'email, verifica che non sia già in uso
      if (updateData.email) {
        const { data: existingDealer, error: checkError } = await supabaseAdmin
          .from('concessionari')
          .select('id, email')
          .eq('email', updateData.email)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking email:', checkError)
          return { success: false, error: 'Errore nella verifica dell\'email' }
        }

        if (existingDealer) {
          console.error('Email già in uso:', updateData.email)
          return { 
            success: false, 
            error: 'Questa email è già utilizzata da un altro concessionario. Scegli un\'altra email.' 
          }
        }
      }
      
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
        // Se l'errore è dovuto all'email duplicata, restituisci un messaggio più chiaro
        if (createError.code === '23505' && createError.message.includes('email')) {
          return { 
            success: false, 
            error: 'Questa email è già utilizzata da un altro concessionario. Scegli un\'altra email.' 
          }
        }
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
