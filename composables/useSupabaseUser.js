export const useSupabaseUser = () => {
  const user = ref(null)
  const supabase = useSupabaseClient()
  
  // Listener per cambiamenti di autenticazione
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
  
  // Carica l'utente corrente all'inizio
  const initUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
  }
  
  // Inizializza l'utente
  initUser()
  
  // Cleanup della subscription
  onUnmounted(() => {
    subscription?.unsubscribe()
  })
  
  return user
}
