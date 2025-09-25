<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Recupera Password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Inserisci la tua email per ricevere il link di reset
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
            placeholder="Inserisci la tua email"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div v-if="success" class="text-green-600 text-sm text-center">
          {{ success }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#90c149] hover:bg-[#7aa83f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#90c149] disabled:opacity-50"
          >
            <span v-if="loading">Invio in corso...</span>
            <span v-else>Invia Link Reset</span>
          </button>
        </div>

        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600">
            Ricordi la password?
            <NuxtLink to="/auth/login" class="text-[#90c149] hover:text-[#7aa83f] font-medium">
              Accedi
            </NuxtLink>
          </p>
          <p class="text-sm text-gray-600">
            Non hai un account?
            <NuxtLink to="/auth/register" class="text-[#90c149] hover:text-[#7aa83f] font-medium">
              Registrati
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleResetPassword = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const { supabase } = useSupabase()
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (resetError) {
      throw resetError
    }
    
    success.value = 'Link di reset inviato! Controlla la tua email e clicca sul link per reimpostare la password.'
    
  } catch (err) {
    error.value = err.message || 'Errore durante l\'invio del link di reset'
  } finally {
    loading.value = false
  }
}

// Meta
definePageMeta({
  layout: false
})
</script>



