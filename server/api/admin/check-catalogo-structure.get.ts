import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Controlla se i campi esistono nella tabella moto_usate_catalogo
    let hasMarca = false
    let hasModello = false
    let hasVersione = false
    let hasTipologia = false
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('moto_usate_catalogo')
        .select('marca')
        .limit(1)
      
      if (!testError) hasMarca = true
    } catch (e) {}

    try {
      const { data: testData, error: testError } = await supabase
        .from('moto_usate_catalogo')
        .select('modello')
        .limit(1)
      
      if (!testError) hasModello = true
    } catch (e) {}

    try {
      const { data: testData, error: testError } = await supabase
        .from('moto_usate_catalogo')
        .select('versione')
        .limit(1)
      
      if (!testError) hasVersione = true
    } catch (e) {}

    try {
      const { data: testData, error: testError } = await supabase
        .from('moto_usate_catalogo')
        .select('tipologia')
        .limit(1)
      
      if (!testError) hasTipologia = true
    } catch (e) {}

    // Controlla alcuni dati esistenti
    const { data: sampleData, error: sampleError } = await supabase
      .from('moto_usate_catalogo')
      .select('*')
      .limit(3)

    return {
      success: true,
      sample_data: sampleData,
      has_marca: hasMarca,
      has_modello: hasModello,
      has_versione: hasVersione,
      has_tipologia: hasTipologia,
      needs_marca: !hasMarca,
      needs_modello: !hasModello,
      needs_versione: !hasVersione,
      needs_tipologia: !hasTipologia
    }

  } catch (error) {
    console.error('Errore controllo catalogo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})


