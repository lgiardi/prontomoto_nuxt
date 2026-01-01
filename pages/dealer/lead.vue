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
              <option value="new">Nuovo</option>
              <option value="contacted">Contattato</option>
              <option value="converted">Convertito</option>
              <option value="lost">Perso</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Richiesta</label>
            <select v-model="filters.tipoRichiesta" @change="loadLeads" class="w-full p-2 border rounded-lg">
              <option value="">Tutti i tipi</option>
              <optgroup label="Categoria">
                <option value="moto_nuova">🏍️ Moto Nuova</option>
                <option value="moto_usata">🛵 Moto Usata</option>
                <option value="servizio">🔧 Servizio</option>
              </optgroup>
              <optgroup label="Tipo Richiesta">
                <option value="informazioni">ℹ️ Informazioni</option>
                <option value="preventivo">💰 Preventivo</option>
                <option value="appuntamento">📅 Appuntamento</option>
                <option value="acquisto">🛒 Acquisto</option>
              </optgroup>
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
            <!-- Badge Tipo Richiesta (Moto Nuova/Usata/Servizio) -->
            <div class="mb-3">
              <span :class="getTipoRichiestaBadgeClass(lead.tipo_richiesta)" class="px-3 py-1 rounded-full text-xs font-bold uppercase">
                {{ getTipoRichiestaBadgeLabel(lead.tipo_richiesta) }}
              </span>
            </div>
            
            <!-- Dettagli Richiesta -->
            <div class="bg-gray-50 rounded-lg p-3 mb-2">
              <p v-if="lead.tipo_richiesta === 'moto_nuova' || lead.tipo_richiesta === 'moto_usata'" class="text-sm text-gray-700 mb-1">
                <strong>Moto:</strong> {{ lead.moto_marca || 'N/A' }} {{ lead.moto_modello || 'N/A' }}
              </p>
              <p v-if="lead.tipo_richiesta === 'servizio' && lead.servizio_nome" class="text-sm text-gray-700 mb-1">
                <strong>Servizio:</strong> {{ lead.servizio_nome }}
              </p>
              <p v-if="lead.tipo_richiesta === 'moto_usata'" class="text-xs text-gray-500">
                Moto Usata
              </p>
              <p v-if="lead.tipo_richiesta === 'moto_nuova'" class="text-xs text-gray-500">
                Moto Nuova
              </p>
            </div>
            
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
                <option value="new">Nuovo</option>
                <option value="contacted">Contattato</option>
                <option value="converted">Convertito</option>
                <option value="lost">Perso</option>
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
                @click="openConversationModal(lead)"
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

    <!-- Conversation Modal -->
    <ConversationModal
      v-if="selectedConversationId && dealerData"
      :is-open="showConversationModal"
      :conversazione-id="selectedConversationId"
      :concessionario-id="dealerData.id"
      @close="closeConversationModal"
      @message-sent="handleMessageSent"
    />
  </div>
</template>

<script setup>
import ConversationModal from '~/components/ConversationModal.vue'

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
const showConversationModal = ref(false)
const selectedConversationId = ref(null)

// Filtri
const filters = ref({
  status: '',
  tipoRichiesta: '',
  priorita: ''
})

// Carica i dati del concessionario
const loadDealerData = async () => {
  if (!user.value) {
    console.warn('⚠️ User non disponibile in loadDealerData')
    return
  }

  try {
    console.log('🔍 Caricamento dati concessionario per user:', user.value.id)
    
    // Prima prova a trovare il concessionario esistente
    const { data: existingDealer, error: findError } = await supabase
      .from('concessionari')
      .select('*')
      .eq('user_id', user.value.id)
      .maybeSingle()

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Errore nel trovare concessionario:', findError)
      throw findError
    }

    if (existingDealer) {
      console.log('✅ Concessionario trovato:', {
        id: existingDealer.id,
        nome: existingDealer.nome,
        tipoId: typeof existingDealer.id
      })
      dealerData.value = existingDealer
      return
    }

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
        status: 'active',
        subscription_plan: 'basic',
        subscription_status: 'active'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Errore nella creazione concessionario:', createError)
      throw createError
    }
    
    console.log('✅ Concessionario creato:', {
      id: newDealer.id,
      nome: newDealer.nome,
      tipoId: typeof newDealer.id
    })
    dealerData.value = newDealer
  } catch (error) {
    console.error('❌ Errore nel caricamento dati concessionario:', error)
    console.error('❌ Dettagli errore:', {
      message: error.message,
      code: error.code,
      details: error.details
    })
    // Non bloccare, ma mostra un messaggio all'utente
    loading.value = false
    throw error
  }
}

// Carica i lead
const loadLeads = async () => {
  if (!dealerData.value) {
    console.warn('⚠️ dealerData non disponibile, attendo...')
    return
  }

  try {
    loading.value = true
    
    console.log('📊 Caricamento lead per concessionario:', {
      id: dealerData.value.id,
      tipo: typeof dealerData.value.id,
      nome: dealerData.value.nome
    })
    
    const queryParams = new URLSearchParams({
      concessionarioId: dealerData.value.id
    })
    
    if (filters.value.status) queryParams.append('status', filters.value.status)
    if (filters.value.tipoRichiesta) queryParams.append('tipoRichiesta', filters.value.tipoRichiesta)
    if (filters.value.priorita) queryParams.append('priorita', filters.value.priorita)
    
    console.log('📊 Query params:', queryParams.toString())
    
    const response = await $fetch(`/api/lead?${queryParams}`)
    
    console.log('📊 Risposta API lead:', {
      success: response.success,
      total: response.total,
      leadsCount: response.leads?.length || 0
    })
    
    if (response.success) {
      leads.value = response.leads || []
      console.log('✅ Lead caricati:', leads.value.length, 'di', response.total || 0)
      
      if (leads.value.length === 0 && response.total === 0) {
        console.log('ℹ️ Nessun lead trovato per questo concessionario')
      }
    } else {
      console.error('❌ Risposta API non valida:', response)
      leads.value = []
    }
    
  } catch (error) {
    console.error('❌ Errore nel caricamento lead:', error)
    console.error('❌ Dettagli errore:', {
      message: error.message,
      statusCode: error.statusCode,
      data: error.data
    })
    leads.value = []
    // Mostra un messaggio all'utente se possibile
    if (error.statusCode === 400 || error.statusCode === 500) {
      alert('Errore nel caricamento dei lead. Controlla la console per i dettagli.')
    }
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

// Apri modale conversazione
const openConversationModal = (lead) => {
  if (!lead.conversazione_id) {
    alert('Errore: questo lead non ha una conversazione associata. Contatta il supporto.')
    console.error('❌ Lead senza conversazione_id:', lead)
    return
  }
  
  selectedConversationId.value = lead.conversazione_id
  showConversationModal.value = true
  console.log('💬 Apertura modale conversazione:', lead.conversazione_id)
}

// Chiudi modale conversazione
const closeConversationModal = () => {
  showConversationModal.value = false
  selectedConversationId.value = null
}

// Gestisci messaggio inviato
const handleMessageSent = async (messaggio) => {
  console.log('✅ Messaggio inviato, ricarico i lead...')
  // Ricarica i lead per aggiornare lo stato
  await loadLeads()
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
    'new': 'Nuovo',
    'contacted': 'Contattato',
    'converted': 'Convertito',
    'lost': 'Perso',
    'interessato': 'Interessato',
    'non_interessato': 'Non Interessato',
    'venduto': 'Venduto'
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'converted': 'bg-green-100 text-green-800',
    'lost': 'bg-red-100 text-red-800',
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
    'acquisto': 'Acquisto',
    'moto_nuova': 'Moto Nuova',
    'moto_usata': 'Moto Usata',
    'servizio': 'Servizio'
  }
  return labels[tipo] || tipo
}

const getTipoRichiestaBadgeLabel = (tipo) => {
  const labels = {
    'moto_nuova': '🏍️ Moto Nuova',
    'moto_usata': '🛵 Moto Usata',
    'servizio': '🔧 Servizio',
    'informazioni': 'ℹ️ Informazioni',
    'preventivo': '💰 Preventivo',
    'appuntamento': '📅 Appuntamento',
    'acquisto': '🛒 Acquisto'
  }
  return labels[tipo] || tipo
}

const getTipoRichiestaBadgeClass = (tipo) => {
  const classes = {
    'moto_nuova': 'bg-blue-100 text-blue-800',
    'moto_usata': 'bg-purple-100 text-purple-800',
    'servizio': 'bg-green-100 text-green-800',
    'informazioni': 'bg-gray-100 text-gray-800',
    'preventivo': 'bg-yellow-100 text-yellow-800',
    'appuntamento': 'bg-orange-100 text-orange-800',
    'acquisto': 'bg-red-100 text-red-800'
  }
  return classes[tipo] || 'bg-gray-100 text-gray-800'
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
  try {
    // Aspetta che l'utente sia caricato
    if (!user.value) {
      console.warn('⚠️ User non disponibile, attendo...')
      // Prova a recuperare l'utente
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        user.value = currentUser
      } else {
        console.error('❌ Utente non autenticato')
        await navigateTo('/auth/login')
        return
      }
    }
    
    console.log('👤 User disponibile:', user.value.id)
    
    // Carica i dati del concessionario
    await loadDealerData()
    
    // Verifica che dealerData sia stato caricato
    if (!dealerData.value) {
      console.error('❌ dealerData non disponibile dopo loadDealerData')
      loading.value = false
      alert('Errore nel caricamento dei dati del concessionario. Ricarica la pagina.')
      return
    }
    
    console.log('✅ dealerData caricato:', {
      id: dealerData.value.id,
      nome: dealerData.value.nome
    })
    
    // Carica i lead
    await loadLeads()
  } catch (error) {
    console.error('❌ Errore inizializzazione pagina lead:', error)
    console.error('❌ Stack trace:', error.stack)
    loading.value = false
    alert('Errore nel caricamento della pagina. Controlla la console per i dettagli.')
  }
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>






