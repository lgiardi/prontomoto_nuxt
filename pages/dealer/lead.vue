<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/dealer/dashboard" class="flex items-center text-gray-700 hover:text-[#90c149]">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span class="font-medium">Torna alla Dashboard</span>
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
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestione Lead</h1>
        <p class="text-gray-600 mt-2">Gestisci i contatti e le richieste dei tuoi clienti.</p>
      </div>

      <!-- Filtri -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
            <select v-model="filters.status" @change="loadLeads" class="w-full p-2 border rounded-lg">
              <option value="">Tutti gli stati</option>
              <option value="nuovo">Nuovo</option>
              <option value="contattato">Contattato</option>
              <option value="interessato">Interessato</option>
              <option value="non_interessato">Non Interessato</option>
              <option value="venduto">Venduto</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Richiesta</label>
            <select v-model="filters.tipoRichiesta" @change="loadLeads" class="w-full p-2 border rounded-lg">
              <option value="">Tutti i tipi</option>
              <option value="informazioni">Informazioni</option>
              <option value="preventivo">Preventivo</option>
              <option value="appuntamento">Appuntamento</option>
              <option value="acquisto">Acquisto</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priorità</label>
            <select v-model="filters.priorita" @change="loadLeads" class="w-full p-2 border rounded-lg">
              <option value="">Tutte le priorità</option>
              <option value="bassa">Bassa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button 
              @click="resetFilters"
              class="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset Filtri
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <svg class="animate-spin h-8 w-8 text-[#90c149] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-3 text-gray-600">Caricamento lead...</p>
      </div>

      <!-- Lead List -->
      <div v-else-if="leads.length > 0" class="space-y-4">
        <div v-for="lead in leads" :key="lead.id" class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ lead.nome_cliente }}</h3>
              <p class="text-sm text-gray-600">{{ lead.email_cliente }}</p>
              <p v-if="lead.telefono_cliente" class="text-sm text-gray-600">{{ lead.telefono_cliente }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="getStatusBadgeClass(lead.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ getStatusLabel(lead.status) }}
              </span>
              <span :class="getPriorityBadgeClass(lead.priorita)" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ getPriorityLabel(lead.priorita) }}
              </span>
            </div>
          </div>
          
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">
              <strong>Moto:</strong> {{ lead.moto_marca }} {{ lead.moto_modello }}
            </p>
            <p class="text-sm text-gray-600 mb-2">
              <strong>Tipo Richiesta:</strong> {{ getTipoRichiestaLabel(lead.tipo_richiesta) }}
            </p>
            <p class="text-sm text-gray-600">
              <strong>Data:</strong> {{ formatDate(lead.created_at) }}
            </p>
          </div>
          
          <div class="mb-4">
            <p class="text-sm text-gray-700">{{ lead.messaggio }}</p>
          </div>
          
          <!-- Azioni -->
          <div class="flex justify-between items-center">
            <div class="flex space-x-2">
              <select 
                v-model="lead.status" 
                @change="updateLeadStatus(lead)"
                class="text-sm border rounded px-2 py-1"
              >
                <option value="nuovo">Nuovo</option>
                <option value="contattato">Contattato</option>
                <option value="interessato">Interessato</option>
                <option value="non_interessato">Non Interessato</option>
                <option value="venduto">Venduto</option>
              </select>
              
              <select 
                v-model="lead.priorita" 
                @change="updateLeadPriority(lead)"
                class="text-sm border rounded px-2 py-1"
              >
                <option value="bassa">Bassa</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            
            <div class="flex space-x-2">
              <button 
                @click="openLeadModal(lead)"
                class="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                Rispondi
              </button>
              <button 
                v-if="lead.tipo_richiesta === 'appuntamento'"
                @click="openAppointmentModal(lead)"
                class="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
              >
                Fissa Appuntamento
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="bg-white rounded-lg shadow p-8 text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Nessun lead trovato</h3>
        <p class="text-gray-600">Non ci sono lead che corrispondono ai filtri selezionati.</p>
      </div>
    </main>

    <!-- Lead Modal -->
    <div v-if="showLeadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <h3 class="text-lg font-semibold mb-4">Rispondi al Lead</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Risposta</label>
          <textarea 
            v-model="leadResponse"
            rows="4"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="Scrivi la tua risposta al cliente..."
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="closeLeadModal"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annulla
          </button>
          <button 
            @click="sendLeadResponse"
            class="px-4 py-2 bg-[#90c149] text-white rounded-lg hover:bg-[#7aa83f] transition-colors"
          >
            Invia Risposta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Middleware per proteggere la pagina
definePageMeta({
  middleware: 'auth',
  layout: false
})

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State
const loading = ref(true)
const leads = ref([])
const dealerData = ref(null)
const showLeadModal = ref(false)
const selectedLead = ref(null)
const leadResponse = ref('')

// Filtri
const filters = ref({
  status: '',
  tipoRichiesta: '',
  priorita: ''
})

// Carica i dati del concessionario
const loadDealerData = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('concessionari')
      .select('*')
      .eq('user_id', user.value.id)
      .single()

    if (error) throw error
    dealerData.value = data
  } catch (error) {
    console.error('Errore nel caricamento dati concessionario:', error)
  }
}

// Carica i lead
const loadLeads = async () => {
  if (!dealerData.value) return

  try {
    loading.value = true
    
    const queryParams = new URLSearchParams({
      concessionarioId: dealerData.value.id
    })
    
    if (filters.value.status) queryParams.append('status', filters.value.status)
    if (filters.value.tipoRichiesta) queryParams.append('tipoRichiesta', filters.value.tipoRichiesta)
    if (filters.value.priorita) queryParams.append('priorita', filters.value.priorita)
    
    const response = await $fetch(`/api/lead?${queryParams}`)
    leads.value = response.leads || []
    
  } catch (error) {
    console.error('Errore nel caricamento lead:', error)
    leads.value = []
  } finally {
    loading.value = false
  }
}

// Aggiorna stato lead
const updateLeadStatus = async (lead) => {
  try {
    await $fetch(`/api/lead/${lead.id}`, {
      method: 'PUT',
      body: { status: lead.status }
    })
    console.log('Stato lead aggiornato')
  } catch (error) {
    console.error('Errore aggiornamento stato lead:', error)
  }
}

// Aggiorna priorità lead
const updateLeadPriority = async (lead) => {
  try {
    await $fetch(`/api/lead/${lead.id}`, {
      method: 'PUT',
      body: { priorita: lead.priorita }
    })
    console.log('Priorità lead aggiornata')
  } catch (error) {
    console.error('Errore aggiornamento priorità lead:', error)
  }
}

// Apri modal lead
const openLeadModal = (lead) => {
  selectedLead.value = lead
  showLeadModal.value = true
}

// Chiudi modal lead
const closeLeadModal = () => {
  showLeadModal.value = false
  selectedLead.value = null
  leadResponse.value = ''
}

// Invia risposta lead
const sendLeadResponse = async () => {
  if (!selectedLead.value || !leadResponse.value.trim()) return

  try {
    await $fetch(`/api/lead/${selectedLead.value.id}`, {
      method: 'PUT',
      body: { 
        rispostaConcessionario: leadResponse.value,
        status: 'contattato'
      }
    })
    
    // Aggiorna il lead locale
    selectedLead.value.risposta_concessionario = leadResponse.value
    selectedLead.value.status = 'contattato'
    selectedLead.value.data_risposta = new Date().toISOString()
    
    closeLeadModal()
    alert('Risposta inviata con successo!')
  } catch (error) {
    console.error('Errore invio risposta:', error)
    alert('Errore nell\'invio della risposta. Riprova.')
  }
}

// Reset filtri
const resetFilters = () => {
  filters.value = {
    status: '',
    tipoRichiesta: '',
    priorita: ''
  }
  loadLeads()
}

// Funzioni di utilità
const getStatusLabel = (status) => {
  const labels = {
    'nuovo': 'Nuovo',
    'contattato': 'Contattato',
    'interessato': 'Interessato',
    'non_interessato': 'Non Interessato',
    'venduto': 'Venduto'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'nuovo': 'bg-blue-100 text-blue-800',
    'contattato': 'bg-yellow-100 text-yellow-800',
    'interessato': 'bg-green-100 text-green-800',
    'non_interessato': 'bg-red-100 text-red-800',
    'venduto': 'bg-purple-100 text-purple-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityLabel = (priority) => {
  const labels = {
    'bassa': 'Bassa',
    'media': 'Media',
    'alta': 'Alta'
  }
  return labels[priority] || priority
}

const getPriorityBadgeClass = (priority) => {
  const classes = {
    'bassa': 'bg-gray-100 text-gray-800',
    'media': 'bg-yellow-100 text-yellow-800',
    'alta': 'bg-red-100 text-red-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const getTipoRichiestaLabel = (tipo) => {
  const labels = {
    'informazioni': 'Informazioni',
    'preventivo': 'Preventivo',
    'appuntamento': 'Appuntamento',
    'acquisto': 'Acquisto'
  }
  return labels[tipo] || tipo
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    await navigateTo('/')
  } catch (error) {
    console.error('Errore durante il logout:', error)
  }
}

// Inizializzazione
onMounted(async () => {
  await loadDealerData()
  await loadLeads()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>






