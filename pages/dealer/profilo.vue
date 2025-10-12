<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <DealerHeader />

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Form -->
      <div class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="updateProfile" class="space-y-6">
          <!-- Nome -->
          <div>
            <label for="nome" class="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              id="nome"
              v-model="form.nome"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="Inserisci il tuo nome completo"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="Inserisci la tua email"
            />
            <p class="text-sm text-gray-500 mt-1">L'email viene utilizzata per l'accesso e le notifiche</p>
          </div>

          <!-- Password Section -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Cambia Password</h3>
            <p class="text-sm text-gray-500 mb-4">Lascia vuoto se non vuoi cambiare la password</p>
            
            <!-- Nuova Password -->
            <div class="mb-4">
              <label for="nuovaPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Nuova Password
              </label>
              <input
                id="nuovaPassword"
                v-model="form.nuovaPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
                placeholder="Inserisci la nuova password"
              />
            </div>

            <!-- Conferma Password -->
            <div>
              <label for="confermaPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Conferma Nuova Password
              </label>
              <input
                id="confermaPassword"
                v-model="form.confermaPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
                placeholder="Conferma la nuova password"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-4 pt-6 border-t">
            <NuxtLink 
              to="/dealer/dashboard" 
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-[#90c149] text-white rounded-md hover:bg-[#7ba83a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Salvataggio...' : 'Salva Modifiche' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="mt-4">
        <div :class="[
          'p-4 rounded-md',
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        ]">
          {{ message.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Protezione della pagina
definePageMeta({
  middleware: 'dealer',
  layout: false
})

const user = ref(null)
const userData = ref(null)
const loading = ref(false)
const message = ref(null)

// Form data
const form = ref({
  nome: '',
  email: '',
  nuovaPassword: '',
  confermaPassword: ''
})

// Inizializza Supabase
const supabase = useSupabaseClient()

// Carica i dati dell'utente
const loadUserData = async () => {
  try {
    const { data: { user: currentUser }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Errore nel caricamento utente:', error)
      return
    }
    
    if (!currentUser) {
      await navigateTo('/auth/login')
      return
    }
    
    user.value = currentUser
    userData.value = currentUser
    
    // Popola il form con i dati esistenti
    form.value.nome = currentUser.user_metadata?.nome || currentUser.email?.split('@')[0] || ''
    form.value.email = currentUser.email || ''
    
  } catch (error) {
    console.error('Errore nel caricamento dati utente:', error)
  }
}

// Aggiorna il profilo
const updateProfile = async () => {
  if (!user.value) return
  
  // Validazione password
  if (form.value.nuovaPassword && form.value.nuovaPassword !== form.value.confermaPassword) {
    message.value = {
      type: 'error',
      text: 'Le password non coincidono'
    }
    return
  }
  
  loading.value = true
  message.value = null
  
  try {
    // Prepara i dati per l'aggiornamento
    const updateData = {
      email: form.value.email,
      data: {
        nome: form.value.nome
      }
    }
    
    // Aggiungi password se fornita
    if (form.value.nuovaPassword) {
      updateData.password = form.value.nuovaPassword
    }
    
    // Aggiorna l'utente
    const { error } = await supabase.auth.updateUser(updateData)
    
    if (error) {
      throw error
    }
    
    message.value = {
      type: 'success',
      text: 'Profilo aggiornato con successo!'
    }
    
    // Pulisci i campi password
    form.value.nuovaPassword = ''
    form.value.confermaPassword = ''
    
    // Ricarica i dati
    await loadUserData()
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento profilo:', error)
    message.value = {
      type: 'error',
      text: error.message || 'Errore nell\'aggiornamento del profilo'
    }
  } finally {
    loading.value = false
  }
}

// Carica i dati al mount
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
