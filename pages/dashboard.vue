<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149]"></div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <NuxtLink to="/" class="text-2xl font-bold text-gray-900">
                ← ProntoMoto
              </NuxtLink>
            </div>
            
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">
                Dashboard {{ userType === 'concessionario' ? 'Concessionario' : 'Cliente' }}
              </span>
              <button
                @click="handleLogout"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Message -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            Benvenuto, {{ user?.user_metadata?.nome || 'Utente' }}!
          </h1>
          <p class="text-gray-600 mt-2">
            Ecco un riepilogo della tua attività su ProntoMoto
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Moto Visualizzate -->
          <div class="bg-blue-50 p-6 rounded-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-2xl">🏍️</span>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-blue-900">Moto Visualizzate</h3>
                <p class="text-2xl font-bold text-blue-600">0</p>
              </div>
            </div>
          </div>

          <!-- Ricerche -->
          <div class="bg-green-50 p-6 rounded-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-2xl">🔍</span>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-green-900">Ricerche</h3>
                <p class="text-2xl font-bold text-green-600">0</p>
              </div>
            </div>
          </div>

          <!-- Preferiti -->
          <div class="bg-yellow-50 p-6 rounded-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-2xl">❤️</span>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-yellow-900">Preferiti</h3>
                <p class="text-2xl font-bold text-yellow-600">0</p>
              </div>
            </div>
          </div>

          <!-- Contatti -->
          <div class="bg-purple-50 p-6 rounded-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <span class="text-2xl">📞</span>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-purple-900">Contatti</h3>
                <p class="text-2xl font-bold text-purple-600">0</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NuxtLink 
              to="/" 
              class="bg-[#90c149] text-white px-6 py-3 rounded-md text-center hover:bg-[#7ba83a] transition-colors"
            >
              Cerca Moto
            </NuxtLink>
            <NuxtLink 
              to="/dashboard/moto-usate" 
              class="bg-orange-600 text-white px-6 py-3 rounded-md text-center hover:bg-orange-700 transition-colors"
            >
              🏍️ Le Mie Moto Usate
            </NuxtLink>
            <NuxtLink 
              to="/conversazioni" 
              class="bg-purple-600 text-white px-6 py-3 rounded-md text-center hover:bg-purple-700 transition-colors"
            >
              💬 Le Mie Conversazioni
            </NuxtLink>
            <NuxtLink 
              to="/favorites" 
              class="bg-gray-600 text-white px-6 py-3 rounded-md text-center hover:bg-gray-700 transition-colors"
            >
              I Miei Preferiti
            </NuxtLink>
            <NuxtLink 
              to="/profile" 
              class="bg-blue-600 text-white px-6 py-3 rounded-md text-center hover:bg-blue-700 transition-colors"
            >
              Modifica Profilo
            </NuxtLink>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Ricerche Recenti</h3>
            <p class="text-gray-500">Nessuna ricerca recente</p>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Moto Preferite</h3>
            <p class="text-gray-500">Nessuna moto nei preferiti</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
// Questo middleware protegge la pagina - solo utenti autenticati possono accedere
definePageMeta({
  middleware: 'auth',
  layout: false
})

const { user } = useSupabaseUser()
const loading = ref(true)
const userType = ref('')

// Verifica il tipo di utente
onMounted(async () => {
  if (user.value) {
    // Controlla se è un concessionario
    const { data: concessionario } = await useSupabase()
      .from('concessionari')
      .select('*')
      .eq('user_id', user.value.id)
      .single()
    
    userType.value = concessionario ? 'concessionario' : 'cliente'
    
    // Se è un concessionario, reindirizza alla dashboard specifica
    if (concessionario) {
      setTimeout(() => {
        navigateTo('/dealer/dashboard')
      }, 2000) // 2 secondi di attesa per mostrare il messaggio
    }
  }
  
  loading.value = false
})

const handleLogout = async () => {
  try {
    const { signOut } = useSupabase()
    await signOut()
    await navigateTo('/')
  } catch (error) {
    console.error('Errore durante il logout:', error)
  }
}
</script>