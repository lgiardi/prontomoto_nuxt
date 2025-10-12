import { createClient } from '@supabase/supabase-js'

// Credenziali da nuxt.config.ts
const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MDg5OCwiZXhwIjoyMDczNjM2ODk4fQ.REPLACE_WITH_YOUR_ACTUAL_SERVICE_ROLE_KEY'

// Client con Service Key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixPublicReadPolicies() {
  try {
    console.log('🔧 Creazione policy per lettura pubblica...')
    
    // Policy per moto
    const { data: motoPolicy, error: motoError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Lettura pubblica moto" ON moto;
        CREATE POLICY "Lettura pubblica moto" ON moto FOR SELECT USING (true);
      `
    })
    
    if (motoError) {
      console.error('❌ Errore policy moto:', motoError.message)
    } else {
      console.log('✅ Policy moto creata')
    }

    // Policy per concessionari
    const { data: concessionariPolicy, error: concessionariError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Lettura pubblica concessionari" ON concessionari;
        CREATE POLICY "Lettura pubblica concessionari" ON concessionari FOR SELECT USING (true);
      `
    })
    
    if (concessionariError) {
      console.error('❌ Errore policy concessionari:', concessionariError.message)
    } else {
      console.log('✅ Policy concessionari creata')
    }

    // Policy per moto_concessionari
    const { data: motoConcessionariPolicy, error: motoConcessionariError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Lettura pubblica moto_concessionari" ON moto_concessionari;
        CREATE POLICY "Lettura pubblica moto_concessionari" ON moto_concessionari FOR SELECT USING (true);
      `
    })
    
    if (motoConcessionariError) {
      console.error('❌ Errore policy moto_concessionari:', motoConcessionariError.message)
    } else {
      console.log('✅ Policy moto_concessionari creata')
    }

    console.log('🎉 Policy pubbliche create!')

  } catch (error) {
    console.error('❌ Errore generale:', error)
  }
}

// Esegui
fixPublicReadPolicies()



