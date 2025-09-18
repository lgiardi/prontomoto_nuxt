export default defineNuxtRouteMiddleware(async (to, from) => {
  const { getCurrentUser } = useSupabase()
  
  try {
    const { user } = await getCurrentUser()
    
    if (!user) {
      // Utente non autenticato, redirect al login
      return navigateTo('/auth/login')
    }
    
    // Utente autenticato, può procedere
    return true
    
  } catch (error) {
    console.error('Errore nel middleware auth:', error)
    return navigateTo('/auth/login')
  }
})

