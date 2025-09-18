<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Inserisci il tuo stock di moto e scooter
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Registra la tua concessionaria su ProntoMoto
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="email@concessionaria.it"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="Password sicura"
            />
          </div>
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
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#90c149] hover:bg-[#7aa83f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#90c149] disabled:opacity-50"
          >
            <span v-if="loading">Registrazione...</span>
            <span v-else>Registrati</span>
          </button>
        </div>

        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600">
            Hai già un account?
            <NuxtLink to="/auth/login" class="text-[#90c149] hover:text-[#7aa83f] font-medium">
              Accedi
            </NuxtLink>
          </p>
          <p class="text-xs text-gray-500">
            Sei un cliente? 
            <NuxtLink to="/auth/register" class="text-[#90c149] hover:text-[#7aa83f]">
              Registrati qui
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const { signUp, supabase } = useSupabase()
    const { data, error: supabaseError } = await signUp(email.value, password.value)
    
    if (supabaseError) {
      throw supabaseError
    }
    
    // Se la registrazione è andata a buon fine, salva come concessionario
    if (data.user) {
      // Inserisci il record nella tabella utenti come concessionario
      const { error: insertError } = await supabase
        .from('utenti')
        .insert({
          id: data.user.id,
          email: email.value,
          user_type: 'concessionario',
          created_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error('Errore nel salvare il tipo utente:', insertError)
        // Non blocchiamo la registrazione se c'è un errore nel salvare il tipo
      }
    }
    
    if (data.user && !data.user.email_confirmed_at) {
      success.value = 'Registrazione completata! Controlla la tua email per confermare l\'account.'
    } else {
      success.value = 'Registrazione completata!'
    }
    
  } catch (err) {
    error.value = err.message || 'Errore durante la registrazione'
  } finally {
    loading.value = false
  }
}

// Meta
definePageMeta({
  layout: false
})
</script>
