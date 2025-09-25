<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reimposta Password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Inserisci la tua nuova password
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Nuova Password</label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
            placeholder="Inserisci la nuova password"
          />
          <div v-if="password" class="mt-1 text-xs">
            <div class="flex items-center space-x-2">
              <span :class="password.length >= 6 ? 'text-green-600' : 'text-red-600'">
                {{ password.length >= 6 ? '✓' : '✗' }} Minimo 6 caratteri
              </span>
              <span :class="/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-red-600'">
                {{ /(?=.*[a-z])/.test(password) ? '✓' : '✗' }} Minuscola
              </span>
              <span :class="/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-red-600'">
                {{ /(?=.*[A-Z])/.test(password) ? '✓' : '✗' }} Maiuscola
              </span>
              <span :class="/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-red-600'">
                {{ /(?=.*\d)/.test(password) ? '✓' : '✗' }} Numero
              </span>
            </div>
          </div>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Conferma Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
            placeholder="Conferma la nuova password"
          />
          <div v-if="confirmPassword && password !== confirmPassword" class="mt-1 text-xs text-red-600">
            Le password non coincidono
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
            :disabled="loading || password !== confirmPassword || !isPasswordValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#90c149] hover:bg-[#7aa83f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#90c149] disabled:opacity-50"
          >
            <span v-if="loading">Aggiornamento...</span>
            <span v-else>Reimposta Password</span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            <NuxtLink to="/auth/login" class="text-[#90c149] hover:text-[#7aa83f] font-medium">
              Torna al Login
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

// Computed per validare la password
const isPasswordValid = computed(() => {
  return password.value.length >= 6 && 
         /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)
})

const handleResetPassword = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  // Validazione password
  if (password.value.length < 6) {
    error.value = 'La password deve essere di almeno 6 caratteri'
    loading.value = false
    return
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)) {
    error.value = 'La password deve contenere almeno una lettera minuscola, una maiuscola e un numero'
    loading.value = false
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Le password non coincidono'
    loading.value = false
    return
  }

  try {
    const { supabase } = useSupabase()
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: password.value
    })
    
    if (updateError) {
      throw updateError
    }
    
    success.value = 'Password aggiornata con successo! Ora puoi accedere con la nuova password.'
    
    // Redirect al login dopo 3 secondi
    setTimeout(() => {
      navigateTo('/auth/login')
    }, 3000)
    
  } catch (err) {
    error.value = err.message || 'Errore durante l\'aggiornamento della password'
  } finally {
    loading.value = false
  }
}

// Meta
definePageMeta({
  layout: false
})
</script>



