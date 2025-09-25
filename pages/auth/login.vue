<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Accedi
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Accedi al tuo account ProntoMoto
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Indirizzo email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span v-if="loading">Accesso...</span>
            <span v-else>Accedi</span>
          </button>
        </div>

        <div class="text-center space-y-2">
          <div>
            <NuxtLink to="/auth/forgot-password" class="text-indigo-600 hover:text-indigo-500 text-sm">
              Password dimenticata?
            </NuxtLink>
          </div>
          <div>
            <NuxtLink to="/auth/register" class="text-indigo-600 hover:text-indigo-500">
              Non hai un account? Registrati
            </NuxtLink>
          </div>
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

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const { signIn } = useSupabase()
    const { data, error: supabaseError } = await signIn(email.value, password.value)
    
    if (supabaseError) {
      throw supabaseError
    }

    if (data.user) {
      // Redirect alla home dopo il login
      await navigateTo('/')
    }
    
  } catch (err) {
    error.value = err.message || 'Errore durante l\'accesso'
  } finally {
    loading.value = false
  }
}

// Meta
definePageMeta({
  layout: false
})
</script>