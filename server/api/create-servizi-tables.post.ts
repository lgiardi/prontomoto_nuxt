import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default defineEventHandler(async (event) => {
  try {
    console.log('🚀 Test connessione tabelle servizi...')

    // Test se le tabelle esistono già
    const { data: catalogoData, error: catalogoError } = await supabase
      .from('servizi_catalogo')
      .select('id, nome')
      .limit(5)

    if (catalogoError) {
      console.error('❌ Tabella servizi_catalogo non esiste:', catalogoError.message)
      return {
        success: false,
        error: 'Tabella servizi_catalogo non esiste. Esegui il file servizi-schema-completo.sql nel SQL Editor di Supabase.',
        instructions: 'Vai su Supabase Dashboard > SQL Editor e esegui il contenuto del file servizi-schema-completo.sql'
      }
    }

    const { data: concessionariData, error: concessionariError } = await supabase
      .from('servizi_concessionari')
      .select('id')
      .limit(1)

    if (concessionariError) {
      console.error('❌ Tabella servizi_concessionari non esiste:', concessionariError.message)
      return {
        success: false,
        error: 'Tabella servizi_concessionari non esiste. Esegui il file servizi-schema-completo.sql nel SQL Editor di Supabase.',
        instructions: 'Vai su Supabase Dashboard > SQL Editor e esegui il contenuto del file servizi-schema-completo.sql'
      }
    }

    console.log('✅ Tabelle servizi esistenti:', {
      catalogo: catalogoData?.length || 0,
      concessionari: concessionariData?.length || 0
    })

    return {
      success: true,
      message: 'Tabelle servizi verificate con successo!',
      data: {
        catalogo_count: catalogoData?.length || 0,
        concessionari_count: concessionariData?.length || 0
      }
    }

  } catch (error) {
    console.error('❌ Errore generale:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
