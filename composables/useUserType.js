import { ref, watch, readonly } from 'vue'

export const useUserType = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const userType = ref(null)
  const userData = ref(null)
  const loading = ref(true)

  const loadUserData = async () => {
    if (!user.value) {
      userType.value = null
      userData.value = null
      loading.value = false
      return
    }

    try {
      // Prima controlla se è un concessionario
      const { data: dealerData, error: dealerError } = await supabase
        .from('concessionari')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (dealerData && !dealerError) {
        userType.value = 'concessionario'
        userData.value = dealerData
        loading.value = false
        return
      }

      // Se non è un concessionario, controlla se è un cliente
      const { data: clientData, error: clientError } = await supabase
        .from('utenti')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (clientData && !clientError) {
        userType.value = clientData.user_type || 'cliente'
        userData.value = clientData
        loading.value = false
        return
      }

      // Se non trova nulla, è un cliente di default
      userType.value = 'cliente'
      userData.value = null
      loading.value = false

    } catch (error) {
      console.error('Errore nel caricamento dati utente:', error)
      userType.value = 'cliente'
      userData.value = null
      loading.value = false
    }
  }

  // Carica i dati quando l'utente cambia
  watch(user, loadUserData, { immediate: true })

  return {
    userType: readonly(userType),
    userData: readonly(userData),
    loading: readonly(loading),
    loadUserData
  }
}




