<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center">
              <img 
                src="https://prontomoto.it/wp-content/uploads/2025/06/Risorsa-12.svg" 
                alt="ProntoMoto Logo" 
                class="h-8 w-auto"
              />
            </NuxtLink>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-600">
              Benvenuto, <span class="font-medium">{{ dealerData?.nome }}</span>
            </div>
            <button 
              @click="handleLogout"
              class="text-gray-500 hover:text-gray-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Status Banner -->
      <div v-if="dealerData?.status === 'pending'" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              Account in attesa di approvazione
            </h3>
            <p class="text-sm text-yellow-700 mt-1">
              Il tuo account è stato creato ma è in attesa di approvazione da parte dell'amministratore.
            </p>
          </div>
        </div>
      </div>

      <!-- Dashboard Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Moto Disponibili -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-[#90c149] rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">🏍️</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Moto Disponibili</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.motoDisponibili }}</p>
            </div>
          </div>
        </div>

        <!-- Lead Ricevuti -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">📞</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Lead Ricevuti</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.leadRicevuti }}</p>
            </div>
          </div>
        </div>

        <!-- Visualizzazioni -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">👁️</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Visualizzazioni</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.visualizzazioni }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Gestione Moto -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Gestione Moto</h3>
          <p class="text-sm text-gray-600 mb-4">
            Aggiungi o rimuovi moto dal tuo catalogo disponibile.
          </p>
          <button 
            @click="navigateTo('/dealer/moto')"
            class="bg-[#90c149] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7aa83f] transition-colors"
          >
            Gestisci Moto
          </button>
        </div>

        <!-- Lead Management -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Gestione Lead</h3>
          <p class="text-sm text-gray-600 mb-4">
            Visualizza e gestisci i lead ricevuti dai potenziali clienti.
          </p>
          <button 
            @click="navigateTo('/dealer/lead')"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Visualizza Lead
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Attività Recente</h3>
        </div>
        <div class="p-6">
          <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
            <p>Nessuna attività recente</p>
          </div>
          <div v-else class="space-y-4">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-[#90c149] rounded-full flex items-center justify-center">
                  <span class="text-white text-xs">📞</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                <p class="text-sm text-gray-500">{{ activity.description }}</p>
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(activity.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Meta
definePageMeta({
  layout: false,
  middleware: 'auth'
})

// Data
const dealerData = ref(null)
const stats = ref({
  motoDisponibili: 0,
  leadRicevuti: 0,
  visualizzazioni: 0
})
const recentActivity = ref([])

// Supabase client
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Redirect if not logged in
watch(user, (newUser) => {
  if (!newUser) {
    navigateTo('/auth/login')
  }
}, { immediate: true })

const loadDealerData = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('concessionari')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) throw error
    dealerData.value = data
  } catch (err) {
    console.error('Error loading dealer data:', err)
  }
}

const loadStats = async () => {
  if (!user.value) return

  try {
    // Load moto disponibili
    const { data: motoData } = await supabase
      .from('moto_concessionari')
      .select('*')
      .eq('concessionario_id', user.value.id)
      .eq('disponibile', true)

    stats.value.motoDisponibili = motoData?.length || 0

    // Load lead ricevuti (placeholder)
    stats.value.leadRicevuti = 0 // TODO: Implement when lead system is ready

    // Load visualizzazioni (placeholder)
    stats.value.visualizzazioni = 0 // TODO: Implement analytics
  } catch (err) {
    console.error('Error loading stats:', err)
  }
}

const loadRecentActivity = async () => {
  // Placeholder for recent activity
  recentActivity.value = []
}

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    navigateTo('/')
  } catch (err) {
    console.error('Logout error:', err)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await loadDealerData()
  await loadStats()
  await loadRecentActivity()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>



