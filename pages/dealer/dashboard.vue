<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <DealerHeader />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Concessionario</h1>
        <p class="text-gray-600 mt-2">Gestisci la tua concessionaria e le tue moto</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149]"></div>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Moto in Vendita -->
        <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-sm font-medium">🏍️</span>
              </div>
          </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Moto in Vendita</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.motoInVendita }}</p>
          </div>
        </div>
      </div>

          <!-- Contatti -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 text-sm font-medium">📞</span>
              </div>
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Contatti</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.contatti }}</p>
            </div>
          </div>
        </div>

        <!-- Appuntamenti -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span class="text-yellow-600 text-sm font-medium">📅</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Appuntamenti</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.appuntamenti }}</p>
            </div>
          </div>
        </div>

        <!-- Visualizzazioni -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span class="text-purple-600 text-sm font-medium">👁️</span>
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
      <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <NuxtLink 
              to="/dealer/aggiungi-moto" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">➕</span>
              <span class="font-medium">Aggiungi Moto</span>
            </NuxtLink>
            <NuxtLink 
              to="/dealer/gestisci-moto" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">📋</span>
              <span class="font-medium">Gestisci Moto</span>
            </NuxtLink>
            <NuxtLink 
              to="/dealer/appuntamenti" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">📅</span>
              <span class="font-medium">Appuntamenti</span>
            </NuxtLink>
            <NuxtLink 
              to="/dealer/lead" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">🎯</span>
              <span class="font-medium">Lead</span>
            </NuxtLink>
            <NuxtLink 
              to="/dealer/conversazioni" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">💬</span>
              <span class="font-medium">Conversazioni</span>
            </NuxtLink>
            <NuxtLink 
              to="/dealer/servizi" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">🔧</span>
              <span class="font-medium">Gestisci Servizi</span>
            </NuxtLink>
            <NuxtLink 
              to="/dealer/moto-usate" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">🏍️</span>
              <span class="font-medium">Moto Usate</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Impostazioni Account -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Impostazioni Account</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NuxtLink 
              to="/dealer/profilo" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">👤</span>
              <span class="font-medium">Profilo</span>
          </NuxtLink>
            <NuxtLink 
              to="/dealer/impostazioni-negozio" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">🏪</span>
              <span class="font-medium">Impostazioni Negozio</span>
          </NuxtLink>
            <NuxtLink 
              to="/dealer/abbonamento" 
              class="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-[#90c149] hover:shadow-md transition-all"
            >
              <span class="text-2xl mr-2">💳</span>
              <span class="font-medium">Abbonamento</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Top Moto -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Moto Più Visualizzate</h2>
        <div v-if="topMoto.length > 0" class="space-y-4">
          <div v-for="moto in topMoto" :key="moto.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-4">
                <img :src="moto.immagine_copertina" :alt="moto.marca + ' ' + moto.modello" class="w-16 h-16 object-cover rounded">
              <div>
                  <h3 class="font-medium">{{ moto.marca }} {{ moto.modello }}</h3>
                  <p class="text-sm text-gray-500">{{ moto.categoria }}</p>
              </div>
        </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Visualizzazioni</p>
                <p class="font-semibold">{{ moto.visualizzazioni || 0 }}</p>
          </div>
                </div>
              </div>
        <div v-else class="text-center py-8 text-gray-500">
            <p>Nessuna moto visualizzata ancora</p>
        </div>
              </div>

        <!-- Recent Appointments -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Appuntamenti Recenti</h2>
          <NuxtLink to="/dealer/appuntamenti" class="text-[#90c149] hover:text-[#7ba83a] text-sm font-medium">
              Vedi tutti
          </NuxtLink>
        </div>
        <div v-if="recentAppointments.length > 0" class="space-y-4">
          <div v-for="appointment in recentAppointments" :key="appointment.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-[#90c149] rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">📅</span>
              </div>
              <div>
                  <h3 class="font-medium">{{ appointment.nome_cliente }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(appointment.data_appuntamento) }} - {{ appointment.orario }}</p>
              </div>
            </div>
            <div class="text-right">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusClass(appointment.status)">
                  {{ appointment.status }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <p>Nessun appuntamento recente</p>
        </div>
              </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Attività Recente</h2>
        <div v-if="recentActivity.length > 0" class="space-y-4">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center space-x-4 p-4 border rounded-lg">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span class="text-gray-600 text-sm">📝</span>
              </div>
            </div>
            <div class="flex-1">
                <p class="text-sm text-gray-900">{{ activity.descrizione }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(activity.created_at) }}</p>
          </div>
        </div>
      </div>
        <div v-else class="text-center py-8 text-gray-500">
          <p>Nessuna attività recente</p>
          </div>
    </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '~/composables/useSupabaseClient'
import { useSupabaseUser } from '~/composables/useSupabaseUser'
import DealerHeader from '~/components/DealerHeader.vue'

// Middleware
definePageMeta({
  middleware: 'dealer'
})

// Composables
const supabase = useSupabaseClient()
const { user } = useSupabaseUser()

// Reactive data
const loading = ref(true)
const dealerData = ref(null)
const stats = ref({
  motoInVendita: 0,
  contatti: 0,
  appuntamenti: 0,
  visualizzazioni: 0
})
const topMoto = ref([])
const recentAppointments = ref([])
const recentActivity = ref([])

// Methods

const loadDealerData = async () => {
  try {
    console.log('🔍 Caricamento dati concessionario per user:', user.value?.id)
    
    // Prima prova a trovare il concessionario esistente
    const { data: existingDealer, error: findError } = await supabase
      .from('concessionari')
      .select('*')
      .eq('user_id', user.value.id)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Errore nel trovare concessionario:', findError)
      throw findError
    }

    if (existingDealer) {
      console.log('✅ Concessionario trovato:', existingDealer)
      dealerData.value = existingDealer
    } else {
      console.log('⚠️ Concessionario non trovato, creazione automatica...')
      
      // Crea automaticamente un concessionario se non esiste
      const { data: newDealer, error: createError } = await supabase
          .from('concessionari')
          .insert({
          user_id: user.value.id,
          nome: user.value.user_metadata?.full_name || user.value.email?.split('@')[0] || 'Concessionario',
            email: user.value.email,
          telefono: '',
          citta: '',
          provincia: '',
          status: 'attivo',
          subscription_plan: 'basic',
          subscription_status: 'active'
          })
          .select()
          .single()

      if (createError) {
        console.error('❌ Errore nella creazione concessionario:', createError)
        throw createError
        }
        
        console.log('✅ Concessionario creato:', newDealer)
        dealerData.value = newDealer
    }
  } catch (error) {
    console.error('❌ Errore nel caricamento dati concessionario:', error)
    throw error
  }
}

const loadStats = async () => {
  try {
    if (!dealerData.value) return

    // Conta moto in vendita
    const { count: motoCount } = await supabase
      .from('moto_concessionari')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', dealerData.value.id)

    // Conta lead
    const { count: leadCount } = await supabase
      .from('lead')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', dealerData.value.id)

    // Conta appuntamenti
    const { count: appointmentCount } = await supabase
      .from('appuntamenti')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', dealerData.value.id)

    stats.value = {
      motoInVendita: motoCount || 0,
      contatti: leadCount || 0,
      appuntamenti: appointmentCount || 0,
      visualizzazioni: 0 // Placeholder
    }
  } catch (error) {
    console.error('Errore nel caricamento statistiche:', error)
  }
}

const loadTopMoto = async () => {
  try {
    if (!dealerData.value) return

    const { data: motoData, error } = await supabase
      .from('moto_concessionari')
      .select(`
        *,
        moto:moto_id (
          id,
          marca,
          modello,
          categoria,
          immagine_copertina
        )
      `)
      .eq('concessionario_id', dealerData.value.id)
      .limit(5)

    if (error) {
      console.error('Errore nel caricamento top moto:', error)
      return
    }

    topMoto.value = motoData?.map(mc => ({
      id: mc.moto.id,
      marca: mc.moto.marca,
      modello: mc.moto.modello,
      categoria: mc.moto.categoria,
      immagine_copertina: mc.moto.immagine_copertina,
      visualizzazioni: 0 // Placeholder
    })) || []
  } catch (error) {
    console.error('Errore nel caricamento top moto:', error)
  }
}

const loadRecentAppointments = async () => {
  try {
    if (!dealerData.value) return

    const { data: appointments, error } = await supabase
      .from('appuntamenti')
      .select('*')
      .eq('concessionario_id', dealerData.value.id)
      .order('data_appuntamento', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Errore nel caricamento appuntamenti:', error)
      return
    }

    recentAppointments.value = appointments || []
  } catch (error) {
    console.error('Errore nel caricamento appuntamenti:', error)
  }
}

const loadRecentActivity = async () => {
  try {
    // Placeholder per attività recente
    recentActivity.value = [
      {
        id: 1,
        descrizione: 'Nuova moto aggiunta al catalogo',
        created_at: new Date().toISOString()
      }
    ]
  } catch (error) {
    console.error('Errore nel caricamento attività:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
    return date.toLocaleDateString('it-IT')
}

const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Lifecycle
onMounted(async () => {
  try {
    console.log('🚀 Inizializzazione dashboard dealer...')
    
    // Aspetta che l'utente sia caricato
    while (!user.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('👤 User caricato:', user.value)
    
  await loadDealerData()
  await loadStats()
  await loadTopMoto()
  await loadRecentAppointments()
  await loadRecentActivity()
  
  loading.value = false
    console.log('✅ Dashboard caricata con successo')
  } catch (error) {
    console.error('❌ Errore nell\'inizializzazione dashboard:', error)
    loading.value = false
  }
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>