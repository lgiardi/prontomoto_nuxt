export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  
  try {
    // Verifica che l'utente sia autenticato
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return navigateTo('/auth/login')
    }

    // Verifica che l'utente sia un concessionario
    const { data: dealerData, error: dealerError } = await supabase
      .from('concessionari')
      .select('id, user_id, nome, status')
      .eq('user_id', session.user.id)
      .single()

    if (dealerError || !dealerData) {
      console.log('Utente non è un concessionario, redirect a dashboard cliente')
      return navigateTo('/dashboard')
    }

    // Verifica che il concessionario sia attivo
    if (dealerData.status === 'suspended') {
      console.log('Concessionario sospeso')
      return navigateTo('/dashboard?error=suspended')
    }

    // Se tutto ok, continua
    console.log('Accesso dealer autorizzato:', dealerData.nome)
    return
    
  } catch (error) {
    console.error('Errore nel middleware dealer:', error)
    return navigateTo('/auth/login')
  }
})
