import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const results = []

    // 1. Aggiungi campo foto_gallery se non esiste
    try {
      const { error: galleryError } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE moto_usate ADD COLUMN IF NOT EXISTS foto_gallery JSONB DEFAULT '[]'::jsonb;"
      })
      
      if (galleryError) {
        results.push({ step: 'add_foto_gallery', success: false, error: galleryError.message })
      } else {
        results.push({ step: 'add_foto_gallery', success: true })
      }
    } catch (error) {
      results.push({ step: 'add_foto_gallery', success: false, error: error.message })
    }

    // 2. Aggiungi campo immagine_copertina se non esiste
    try {
      const { error: coverError } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE moto_usate ADD COLUMN IF NOT EXISTS immagine_copertina TEXT;"
      })
      
      if (coverError) {
        results.push({ step: 'add_immagine_copertina', success: false, error: coverError.message })
      } else {
        results.push({ step: 'add_immagine_copertina', success: true })
      }
    } catch (error) {
      results.push({ step: 'add_immagine_copertina', success: false, error: error.message })
    }

    // 3. Migra i dati esistenti (con gestione errori per dati malformati)
    try {
      const { error: migrateError } = await supabase.rpc('exec_sql', {
        sql: `
          UPDATE moto_usate 
          SET 
            immagine_copertina = CASE 
              WHEN foto IS NOT NULL AND jsonb_typeof(foto) = 'array' AND jsonb_array_length(foto) > 0 
              THEN foto->>0 
              ELSE NULL 
            END,
            foto_gallery = CASE 
              WHEN foto IS NOT NULL AND jsonb_typeof(foto) = 'array' AND jsonb_array_length(foto) > 1 
              THEN foto->1 
              ELSE '[]'::jsonb 
            END
          WHERE immagine_copertina IS NULL;
        `
      })
      
      if (migrateError) {
        results.push({ step: 'migrate_data', success: false, error: migrateError.message })
      } else {
        results.push({ step: 'migrate_data', success: true })
      }
    } catch (error) {
      results.push({ step: 'migrate_data', success: false, error: error.message })
    }

    return {
      success: true,
      message: 'Aggiornamento database completato',
      results: results
    }

  } catch (error) {
    console.error('Errore aggiornamento DB:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})


