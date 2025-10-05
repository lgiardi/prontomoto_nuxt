import { ref, onMounted, readonly } from 'vue'
import { supabase } from '~/utils/supabase'

export const useSupabaseUser = () => {
  const user = ref(null)
  const loading = ref(true)

  const loadUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
    } catch (error) {
      console.error('Errore nel caricamento utente:', error)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // Carica l'utente all'inizio
  onMounted(loadUser)

  // Ascolta i cambiamenti di autenticazione
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })

  return readonly(user)
}
