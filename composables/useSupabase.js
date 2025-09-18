import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  return {
    supabase,
    
    // Metodi di autenticazione
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { data, error }
    },

    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    },

    async signOut() {
      const { error } = await supabase.auth.signOut()
      return { error }
    },

    async getCurrentUser() {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    },

    async getUser() {
      const { data: { user }, error } = await supabase.auth.getUser()
      return user
    },

    // Listener per cambiamenti di autenticazione
    onAuthStateChange(callback) {
      return supabase.auth.onAuthStateChange(callback)
    }
  }
}
