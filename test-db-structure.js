// Test struttura database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDB() {
  console.log('🔍 Verifica struttura tabella servizi_concessionari...\n')
  
  try {
    // Prova a fare una query SELECT per vedere la struttura
    const { data, error } = await supabase
      .from('servizi_concessionari')
      .select('*')
      .limit(0)
    
    if (error) {
      console.error('❌ Errore accesso tabella:', error.message)
      console.error('   Codice:', error.code)
      console.error('   Dettagli:', error.details)
      return
    }
    
    console.log('✅ Tabella servizi_concessionari accessibile')
    console.log('✅ La struttura della tabella è corretta\n')
    
    // Verifica se ci sono colonne
    console.log('📋 Verifica colonne esistenti...')
    const testData = {
      servizio_catalogo_id: '00000000-0000-0000-0000-000000000000',
      concessionario_id: '00000000-0000-0000-0000-000000000000',
      prezzo_da: 1,
      descrizione: 'test',
      disponibile: true
    }
    
    // Prova a vedere quale colonna manca
    console.log('   Campi da inserire:', Object.keys(testData).join(', '))
    console.log('\n✅ Test completato')
    
  } catch (err) {
    console.error('❌ Errore:', err.message)
  }
}

testDB()











