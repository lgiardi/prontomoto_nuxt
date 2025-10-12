export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceRoleKey

    console.log('🔧 Abilitazione RLS su tutte le tabelle...')
    
    // Client con Service Key
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Lista delle tabelle da abilitare
    const tables = [
      'conversazioni',
      'messaggi', 
      'concessionari',
      'moto',
      'moto_concessionari',
      'appuntamenti',
      'lead',
      'utenti',
      'preferiti_utenti',
      'ricerche_utenti',
      'promozioni_concessionario',
      'colori_disponibili'
    ]

    const results = []

    for (const table of tables) {
      try {
        console.log(`📋 Abilitazione RLS per tabella: ${table}`)
        
        // Usa rpc per eseguire SQL diretto
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
        })
        
        if (error) {
          console.error(`❌ Errore per ${table}:`, error.message)
          results.push({ table, status: 'error', message: error.message })
        } else {
          console.log(`✅ RLS abilitato per ${table}`)
          results.push({ table, status: 'success' })
        }
      } catch (err) {
        console.error(`❌ Errore per ${table}:`, err.message)
        results.push({ table, status: 'error', message: err.message })
      }
    }

    console.log('🎉 Processo completato!')
    
    return {
      success: true,
      message: 'RLS abilitato su tutte le tabelle',
      results
    }

  } catch (error) {
    console.error('❌ Errore generale:', error)
    return {
      success: false,
      error: error.message
    }
  }
})



