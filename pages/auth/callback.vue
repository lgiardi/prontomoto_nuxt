<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="text-gray-600">Conferma in corso...</p>
      </div>
      
      <div v-else-if="error" class="space-y-4">
        <div class="text-red-600 text-6xl">⚠️</div>
        <h2 class="text-2xl font-bold text-gray-900">Errore di conferma</h2>
        <p class="text-gray-600">{{ error }}</p>
        <NuxtLink to="/auth/login" class="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Torna al login
        </NuxtLink>
      </div>
      
      <div v-else class="space-y-4">
        <div class="text-green-600 text-6xl">✅</div>
        <h2 class="text-2xl font-bold text-gray-900">Account confermato!</h2>
        <p class="text-gray-600">Il tuo account è stato confermato con successo.</p>
        <NuxtLink to="/" class="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Vai alla home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { supabase } = useSupabase()
  
    // Gestisce il callback di conferma email
    const { data, error: supabaseError } = await supabase.auth.getSession()
    
    if (supabaseError) {
      throw supabaseError
    }

    if (data.session) {
      // Utente confermato con successo
      loading.value = false
      } else {
      // Nessuna sessione trovata
      error.value = 'Link di conferma non valido o scaduto'
      loading.value = false
      }
    
  } catch (err) {
    error.value = err.message || 'Errore durante la conferma'
    loading.value = false
  }
})

// Meta
definePageMeta({
  layout: false
})
</script>