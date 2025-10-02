// Script per creare un utente di test
// Esegui questo script per creare un utente di test

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  try {
    // Crea utente di test
    const { data, error } = await supabase.auth.signUp({
      email: 'test@concessionario.com',
      password: 'password123',
      options: {
        data: {
          user_type: 'concessionario'
        }
      }
    })

    if (error) {
      console.error('Errore:', error)
    } else {
      console.log('Utente creato:', data)
    }
  } catch (error) {
    console.error('Errore:', error)
  }
}

createTestUser()
