import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default defineEventHandler(async (event) => {
  try {
    console.log('🚀 API add-moto chiamata')
    const body = await readBody(event)
    console.log('📝 Body ricevuto:', body)
    
    const { user_id, motoData } = body

    if (!user_id || !motoData) {
      console.log('❌ Missing user_id or motoData')
      return { success: false, error: 'Missing user_id or motoData' }
    }

    console.log('✅ Adding moto for user:', user_id)
    console.log('✅ Moto data:', motoData)

    // Prima controlla se l'utente esiste nella tabella concessionari
    let dealerId = null
    const { data: dealerCheck, error: dealerError } = await supabaseAdmin
      .from('concessionari')
      .select('id')
      .eq('user_id', user_id)
      .single()

    if (dealerError && dealerError.code === 'PGRST116') {
      console.log('User not found in concessionari table, creating...')
      const { data: newDealer, error: insertError } = await supabaseAdmin
        .from('concessionari')
        .insert({
          user_id: user_id,
          nome: 'Concessionario',
          email: 'temp@example.com',
          status: 'pending',
          subscription_plan: 'basic',
          subscription_status: 'inactive',
          is_attivo: true,
          data_iscrizione: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating dealer:', insertError)
        return { success: false, error: insertError.message }
      }
      
      dealerId = newDealer.id
      console.log('Dealer created:', newDealer)
    } else if (dealerCheck) {
      dealerId = dealerCheck.id
      console.log('Existing dealer:', dealerCheck)
    } else {
      return { success: false, error: 'Error loading dealer' }
    }

    // Aggiungi la relazione moto_concessionari
    const insertData = {
      moto_id: motoData.moto_id,
      concessionario_id: dealerId,
      disponibile: true,
      prezzo_speciale: motoData.prezzo_speciale,
      quantita: motoData.quantita,
      colore: motoData.colore,
      promozioni: motoData.promozioni,
      foto_principale: motoData.foto_principale,
      foto_gallery: motoData.foto_gallery,
      note: motoData.note,
      tasso_interesse: motoData.tasso_interesse,
      durata_mesi: motoData.durata_mesi,
      anticipo_percentuale: motoData.anticipo_percentuale,
      offerte_finanziamento: motoData.offerte_finanziamento
    }

    const { data, error } = await supabaseAdmin
      .from('moto_concessionari')
      .insert(insertData)
      .select()

    if (error) {
      console.error('Error inserting moto_concessionari:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data }

  } catch (error) {
    console.error('Server error:', error)
    return { success: false, error: error.message }
  }
})
