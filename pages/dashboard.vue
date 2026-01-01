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
                <p class="text-2xl font-bold text-yellow-600">{{ stats.preferiti }}</p>
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
                <h3 class="text-lg font-medium text-purple-900">Conversazioni</h3>
                <p class="text-2xl font-bold text-purple-600">{{ stats.conversazioni }}</p>
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
const supabase = useSupabaseClient()
const loading = ref(true)
const userType = ref('cliente')

// Statistiche
const stats = ref({
  preferiti: 0,
  conversazioni: 0,
  motoVisualizzate: 0,
  ricerche: 0
})

// Verifica il tipo di utente
onMounted(async () => {
  try {
    if (user.value) {
      console.log('👤 Verifica tipo utente per:', user.value.email)
      
      // Controlla se è un concessionario
      const { data: concessionario, error: dealerError } = await supabase
        .from('concessionari')
        .select('*')
        .eq('user_id', user.value.id)
        .maybeSingle()
      
      if (dealerError) {
        console.error('❌ Errore verifica concessionario:', dealerError)
      }
      
      if (concessionario) {
        userType.value = 'concessionario'
        console.log('🏪 Utente è un concessionario, reindirizzamento...')
        // Se è un concessionario, reindirizza alla dashboard specifica
        await navigateTo('/dealer/dashboard')
        return
      } else {
        userType.value = 'cliente'
        console.log('👤 Utente è un cliente privato')
        // Carica le statistiche per il cliente
        await caricaStatistiche()
      }
    } else {
      console.warn('⚠️ Nessun utente trovato')
      await navigateTo('/auth/login')
      return
    }
  } catch (error) {
    console.error('❌ Errore verifica tipo utente:', error)
    // In caso di errore, assume che sia un cliente
    userType.value = 'cliente'
  } finally {
    loading.value = false
  }
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

// Carica le statistiche
const caricaStatistiche = async () => {
  if (!user.value) return

  try {
    // Recupera l'ID utente dalla tabella utenti
    const { data: utenteData } = await supabase
      .from('utenti')
      .select('id')
      .eq('id', user.value.id)
      .maybeSingle()

    const utenteId = utenteData?.id || user.value.id

    // Carica preferiti
    try {
      const preferitiResponse = await $fetch('/api/preferiti', {
        query: { utenteId }
      })
      if (preferitiResponse.success) {
        stats.value.preferiti = preferitiResponse.total || 0
      }
    } catch (error) {
      console.error('Errore caricamento preferiti:', error)
    }

    // Carica conversazioni
    try {
      const conversazioniResponse = await $fetch('/api/conversazioni/cliente', {
        query: {
          clienteId: user.value.id,
          clienteEmail: user.value.email,
          status: 'attiva'
        }
      })
      if (conversazioniResponse.success) {
        stats.value.conversazioni = conversazioniResponse.total || 0
      }
    } catch (error) {
      console.error('Errore caricamento conversazioni:', error)
    }
  } catch (error) {
    console.error('Errore caricamento statistiche:', error)
  }
}
</script>