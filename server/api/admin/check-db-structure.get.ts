import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Controlla se i campi esistono provando a selezionarli
    let motoUsateHasImmagineCopertina = false
    let motoUsateHasFotoGallery = false
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('moto_usate')
        .select('immagine_copertina')
        .limit(1)
      
      if (!testError) {
        motoUsateHasImmagineCopertina = true
      }
    } catch (e) {
      // Campo non esiste
    }

    try {
      const { data: testData2, error: testError2 } = await supabase
        .from('moto_usate')
        .select('foto_gallery')
        .limit(1)
      
      if (!testError2) {
        motoUsateHasFotoGallery = true
      }
    } catch (e) {
      // Campo non esiste
    }

    // Controlla alcuni dati esistenti per capire il formato
    const { data: sampleData, error: sampleError } = await supabase
      .from('moto_usate')
      .select('foto')
      .limit(3)

    return {
      success: true,
      sample_foto_data: sampleData,
      has_immagine_copertina: motoUsateHasImmagineCopertina,
      has_foto_gallery: motoUsateHasFotoGallery,
      needs_immagine_copertina: !motoUsateHasImmagineCopertina,
      needs_foto_gallery: !motoUsateHasFotoGallery
    }

  } catch (error) {
    console.error('Errore controllo DB:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})
