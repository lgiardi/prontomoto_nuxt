export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const supabaseAnonKey = config.public.supabaseAnonKey
    const supabaseServiceKey = config.supabaseServiceRoleKey

    console.log('🔍 Debug RLS - Configurazione:')
    console.log('- supabaseUrl:', supabaseUrl)
    console.log('- supabaseAnonKey presente:', !!supabaseAnonKey)
    console.log('- supabaseServiceKey presente:', !!supabaseServiceKey)

    // Test con anon key
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test con service key
    const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }) : null

    // Test inserimento con anon key
    console.log('🧪 Test inserimento con anon key...')
    const { data: testAnon, error: errorAnon } = await supabaseAnon
      .from('conversazioni')
      .insert({
        moto_id: 'test-uuid',
        concessionario_id: 'test-uuid',
        cliente_nome: 'Test Anon',
        cliente_email: 'test@example.com',
        messaggio_iniziale: 'Test con anon key'
      })
      .select()

    console.log('Risultato anon key:', { testAnon, errorAnon })

    // Test inserimento con service key
    if (supabaseService) {
      console.log('🧪 Test inserimento con service key...')
      const { data: testService, error: errorService } = await supabaseService
        .from('conversazioni')
        .insert({
          moto_id: 'test-uuid-2',
          concessionario_id: 'test-uuid-2',
          cliente_nome: 'Test Service',
          cliente_email: 'test-service@example.com',
          messaggio_iniziale: 'Test con service key'
        })
        .select()

      console.log('Risultato service key:', { testService, errorService })
    }

    return {
      success: true,
      message: 'Debug completato - controlla i log del server',
      config: {
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!supabaseServiceKey
      }
    }

  } catch (error) {
    console.error('❌ Errore debug RLS:', error)
    return {
      success: false,
      error: error.message
    }
  }
})



