export default defineEventHandler(async (event) => {
  try {
    console.log('🧪 Test connessione Supabase...')
    
    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    
    // Test 1: Verifica che l'URL sia raggiungibile
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
      }
    })
    
    console.log('✅ Risposta Supabase:', response.status, response.statusText)
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      message: 'Connessione a Supabase riuscita!'
    }
    
  } catch (error) {
    console.error('❌ Errore test Supabase:', error)
    return {
      success: false,
      error: error.message,
      details: error.toString()
    }
  }
})









