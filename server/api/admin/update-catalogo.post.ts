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
        sql: "ALTER TABLE moto_usate_catalogo ADD COLUMN IF NOT EXISTS versione TEXT DEFAULT 'Standard';"
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
        sql: "ALTER TABLE moto_usate_catalogo ADD COLUMN IF NOT EXISTS tipologia TEXT DEFAULT 'Naked';"
      })
      
      if (tipologiaError) {
        results.push({ step: 'add_tipologia', success: false, error: tipologiaError.message })
      } else {
        results.push({ step: 'add_tipologia', success: true })
      }
    } catch (error) {
      results.push({ step: 'add_tipologia', success: false, error: error.message })
    }

    // 3. Popola i campi con dati intelligenti basati sul modello
    try {
      const { error: populateError } = await supabase.rpc('exec_sql', {
        sql: `
          UPDATE moto_usate_catalogo 
          SET 
            tipologia = CASE 
              WHEN LOWER(modello) LIKE '%scooter%' OR LOWER(modello) LIKE '%vespa%' THEN 'Scooter'
              WHEN LOWER(modello) LIKE '%naked%' OR LOWER(modello) LIKE '%street%' OR LOWER(modello) LIKE '%mt-%' OR LOWER(modello) LIKE '%z %' OR LOWER(modello) LIKE '%cb %' OR LOWER(modello) LIKE '%monster%' OR LOWER(modello) LIKE '%scrambler%' THEN 'Naked'
              WHEN LOWER(modello) LIKE '%sport%' OR LOWER(modello) LIKE '%racing%' OR LOWER(modello) LIKE '%rr%' OR LOWER(modello) LIKE '%r1%' OR LOWER(modello) LIKE '%r6%' OR LOWER(modello) LIKE '%gsx-r%' OR LOWER(modello) LIKE '%ninja%' OR LOWER(modello) LIKE '%panigale%' OR LOWER(modello) LIKE '%rsv%' OR LOWER(modello) LIKE '%cbr%' THEN 'Sport'
              WHEN LOWER(modello) LIKE '%touring%' OR LOWER(modello) LIKE '%adventure%' OR LOWER(modello) LIKE '%gs%' OR LOWER(modello) LIKE '%multistrada%' OR LOWER(modello) LIKE '%africa%' OR LOWER(modello) LIKE '%v-strom%' OR LOWER(modello) LIKE '%tiger%' OR LOWER(modello) LIKE '%versys%' OR LOWER(modello) LIKE '%klr%' OR LOWER(modello) LIKE '%ténéré%' THEN 'Touring'
              WHEN LOWER(modello) LIKE '%enduro%' OR LOWER(modello) LIKE '%cross%' OR LOWER(modello) LIKE '%crf%' OR LOWER(modello) LIKE '%dr-%' OR LOWER(modello) LIKE '%duke%' OR LOWER(modello) LIKE '%super adventure%' THEN 'Enduro'
              WHEN LOWER(modello) LIKE '%cruiser%' OR LOWER(modello) LIKE '%chopper%' OR LOWER(modello) LIKE '%bonneville%' THEN 'Cruiser'
              ELSE 'Naked'
            END,
            versione = CASE 
              WHEN LOWER(modello) LIKE '%1100%' OR LOWER(modello) LIKE '%1200%' OR LOWER(modello) LIKE '%1000%' THEN '1100cc+'
              WHEN LOWER(modello) LIKE '%900%' OR LOWER(modello) LIKE '%850%' OR LOWER(modello) LIKE '%800%' THEN '800-900cc'
              WHEN LOWER(modello) LIKE '%700%' OR LOWER(modello) LIKE '%650%' OR LOWER(modello) LIKE '%600%' THEN '600-700cc'
              WHEN LOWER(modello) LIKE '%500%' OR LOWER(modello) LIKE '%450%' OR LOWER(modello) LIKE '%400%' THEN '400-500cc'
              WHEN LOWER(modello) LIKE '%390%' OR LOWER(modello) LIKE '%300%' OR LOWER(modello) LIKE '%250%' THEN '250-390cc'
              ELSE 'Standard'
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


