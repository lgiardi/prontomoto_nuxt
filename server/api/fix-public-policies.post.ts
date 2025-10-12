export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceRoleKey

    console.log('🔧 Creazione policy per lettura pubblica...')
    
    // Client con Service Key
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const results = []

    // Policy per moto
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "Lettura pubblica moto" ON moto;
          CREATE POLICY "Lettura pubblica moto" ON moto FOR SELECT USING (true);
        `
      })
      
      if (error) {
        console.error('❌ Errore policy moto:', error.message)
        results.push({ table: 'moto', status: 'error', message: error.message })
      } else {
        console.log('✅ Policy moto creata')
        results.push({ table: 'moto', status: 'success' })
      }
    } catch (err) {
      console.error('❌ Errore policy moto:', err.message)
      results.push({ table: 'moto', status: 'error', message: err.message })
    }

    // Policy per concessionari
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "Lettura pubblica concessionari" ON concessionari;
          CREATE POLICY "Lettura pubblica concessionari" ON concessionari FOR SELECT USING (true);
        `
      })
      
      if (error) {
        console.error('❌ Errore policy concessionari:', error.message)
        results.push({ table: 'concessionari', status: 'error', message: error.message })
      } else {
        console.log('✅ Policy concessionari creata')
        results.push({ table: 'concessionari', status: 'success' })
      }
    } catch (err) {
      console.error('❌ Errore policy concessionari:', err.message)
      results.push({ table: 'concessionari', status: 'error', message: err.message })
    }

    // Policy per moto_concessionari
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "Lettura pubblica moto_concessionari" ON moto_concessionari;
          CREATE POLICY "Lettura pubblica moto_concessionari" ON moto_concessionari FOR SELECT USING (true);
        `
      })
      
      if (error) {
        console.error('❌ Errore policy moto_concessionari:', error.message)
        results.push({ table: 'moto_concessionari', status: 'error', message: error.message })
      } else {
        console.log('✅ Policy moto_concessionari creata')
        results.push({ table: 'moto_concessionari', status: 'success' })
      }
    } catch (err) {
      console.error('❌ Errore policy moto_concessionari:', err.message)
      results.push({ table: 'moto_concessionari', status: 'error', message: err.message })
    }

    console.log('🎉 Policy pubbliche create!')
    
    return {
      success: true,
      message: 'Policy pubbliche create per lettura moto',
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



