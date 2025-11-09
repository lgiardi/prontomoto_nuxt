import { createClient } from '@supabase/supabase-js'
import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.Kij1kL_Ja1i0zEAguZ0gooRv-YCic-THL-DDfLVubBY'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const results = []

    // 1. Aggiungi campo versione se non esiste
    try {
      const { error: versioneError } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE moto_usate_catalogo ADD COLUMN IF NOT EXISTS versione TEXT;"
      })
      
      if (versioneError) {
        results.push({ step: 'add_versione', success: false, error: versioneError.message })
      } else {
        results.push({ step: 'add_versione', success: true })
      }
    } catch (error) {
      results.push({ step: 'add_versione', success: false, error: error.message })
    }

    // 2. Aggiungi campo tipologia se non esiste
    try {
      const { error: tipologiaError } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE moto_usate_catalogo ADD COLUMN IF NOT EXISTS tipologia TEXT;"
      })
      
      if (tipologiaError) {
        results.push({ step: 'add_tipologia', success: false, error: tipologiaError.message })
      } else {
        results.push({ step: 'add_tipologia', success: true })
      }
    } catch (error) {
      results.push({ step: 'add_tipologia', success: false, error: error.message })
    }

    // 3. Popola i campi con dati di esempio se sono vuoti
    try {
      const { error: populateError } = await supabase.rpc('exec_sql', {
        sql: `
          UPDATE moto_usate_catalogo 
          SET 
            versione = CASE 
              WHEN versione IS NULL OR versione = '' 
              THEN 'Standard'
              ELSE versione 
            END,
            tipologia = CASE 
              WHEN tipologia IS NULL OR tipologia = '' 
              THEN CASE 
                WHEN LOWER(modello) LIKE '%scooter%' OR LOWER(modello) LIKE '%vespa%' THEN 'Scooter'
                WHEN LOWER(modello) LIKE '%naked%' OR LOWER(modello) LIKE '%street%' THEN 'Naked'
                WHEN LOWER(modello) LIKE '%sport%' OR LOWER(modello) LIKE '%racing%' THEN 'Sport'
                WHEN LOWER(modello) LIKE '%touring%' OR LOWER(modello) LIKE '%adventure%' THEN 'Touring'
                WHEN LOWER(modello) LIKE '%enduro%' OR LOWER(modello) LIKE '%cross%' THEN 'Enduro'
                WHEN LOWER(modello) LIKE '%cruiser%' OR LOWER(modello) LIKE '%chopper%' THEN 'Cruiser'
                ELSE 'Naked'
              END
              ELSE tipologia 
            END
          WHERE versione IS NULL OR versione = '' OR tipologia IS NULL OR tipologia = '';
        `
      })
      
      if (populateError) {
        results.push({ step: 'populate_data', success: false, error: populateError.message })
      } else {
        results.push({ step: 'populate_data', success: true })
      }
    } catch (error) {
      results.push({ step: 'populate_data', success: false, error: error.message })
    }

    return {
      success: true,
      message: 'Aggiornamento catalogo completato',
      results: results
    }

  } catch (error) {
    console.error('Errore aggiornamento catalogo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore interno del server'
    })
  }
})


