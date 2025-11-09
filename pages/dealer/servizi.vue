<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <DealerHeader />

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Gestisci Servizi</h1>
            <p class="text-gray-600 mt-2">Aggiungi e gestisci i servizi che offri ai tuoi clienti</p>
          </div>
          <button 
            @click="openForm"
            class="bg-[#90c149] text-white px-6 py-3 rounded-lg hover:bg-[#7ba83a] transition-colors font-medium"
          >
            + Aggiungi Servizio
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Servizi Attivi</p>
              <p class="text-2xl font-bold text-gray-900">{{ serviziAttivi }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Prezzo Medio</p>
              <p class="text-2xl font-bold text-gray-900">€{{ prezzoMedio }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Conversazioni</p>
              <p class="text-2xl font-bold text-gray-900">{{ conversazioniServizi }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-6">
          <div class="flex flex-wrap gap-4">
            <select v-model="filtroCategoria" class="border rounded-lg px-3 py-2">
              <option value="">Tutte le categorie</option>
              <option v-for="cat in categorie" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            
            <select v-model="filtroDisponibilita" class="border rounded-lg px-3 py-2">
              <option value="">Tutti</option>
              <option value="true">Disponibili</option>
              <option value="false">Non disponibili</option>
            </select>

            <button 
              @click="resetFilters"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
        <div class="text-lg text-gray-600">Caricamento servizi...</div>
      </div>

      <!-- Servizi List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="servizio in serviziFiltrati" 
          :key="servizio.id"
          class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <!-- Servizio Image -->
          <div class="relative h-48 bg-gray-200 rounded-t-lg">
            <img 
              v-if="servizio.foto && servizio.foto.length > 0 && servizio.foto[0]"
              :src="servizio.foto[0]" 
              :alt="servizio.servizi_catalogo.nome"
              class="w-full h-full object-cover rounded-t-lg"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            
            <!-- Status Badge -->
            <div class="absolute top-3 right-3">
              <span 
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  servizio.disponibile 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ servizio.disponibile ? 'Attivo' : 'Inattivo' }}
              </span>
            </div>
          </div>

          <!-- Servizio Info -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ servizio.servizi_catalogo.nome }}
              </h3>
              <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {{ servizio.servizi_catalogo.categoria }}
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">
              {{ servizio.descrizione }}
            </p>

            <!-- Prezzo -->
            <div class="mb-4">
              <div class="text-2xl font-bold text-gray-900">
                €{{ servizio.prezzo_da }}
                <span v-if="servizio.prezzo_a" class="text-lg text-gray-500">
                  - €{{ servizio.prezzo_a }}
                </span>
              </div>
              <div v-if="servizio.durata_minuti" class="text-sm text-gray-500">
                Durata: {{ servizio.durata_minuti }} min
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2">
              <button 
                @click="editServizio(servizio)"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Modifica
              </button>
              <button 
                @click="toggleDisponibilita(servizio)"
                :class="[
                  'flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium',
                  servizio.disponibile 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                ]"
              >
                {{ servizio.disponibile ? 'Disattiva' : 'Attiva' }}
              </button>
              <button 
                @click="deleteServizio(servizio)"
                class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Services -->
      <div v-if="!loading && servizi.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">🔧</div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">Nessun servizio aggiunto</h3>
        <p class="text-gray-600 mb-4">Inizia aggiungendo il tuo primo servizio</p>
        <button 
          @click="openForm"
          class="bg-[#90c149] text-white px-6 py-3 rounded-lg hover:bg-[#7ba83a] transition-colors font-medium"
        >
          Aggiungi Primo Servizio
        </button>
      </div>
    </main>

    <!-- Servizio Form Modal -->
    <ServizioForm 
      v-if="showForm"
      :servizio="servizioSelezionato"
      :catalogo="catalogoServizi"
      @close="closeForm"
      @saved="onServizioSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import ServizioForm from '~/components/ServizioForm.vue'

definePageMeta({
  middleware: 'dealer'
})

// Reactive data
const loading = ref(true)
const servizi = ref([])
const catalogoServizi = ref([])
const showForm = ref(false)
const servizioSelezionato = ref(null)

// Filters
const filtroCategoria = ref('')
const filtroDisponibilita = ref('')

// Computed
const serviziFiltrati = computed(() => {
  let filtered = servizi.value

  if (filtroCategoria.value) {
    filtered = filtered.filter(s => s.servizi_catalogo.categoria === filtroCategoria.value)
  }

  if (filtroDisponibilita.value !== '') {
    const disponibile = filtroDisponibilita.value === 'true'
    filtered = filtered.filter(s => s.disponibile === disponibile)
  }

  return filtered
})

const categorie = computed(() => {
  return [...new Set(servizi.value.map(s => s.servizi_catalogo.categoria))].sort()
})

const serviziAttivi = computed(() => {
  return servizi.value.filter(s => s.disponibile).length
})

const prezzoMedio = computed(() => {
  if (servizi.value.length === 0) return 0
  const totale = servizi.value.reduce((sum, s) => sum + parseFloat(s.prezzo_da), 0)
  return Math.round(totale / servizi.value.length)
})

const conversazioniServizi = computed(() => {
  // TODO: Implementare conteggio conversazioni per servizi
  return 0
})

// Methods
const openForm = () => {
  console.log('📝 Apertura form servizio...')
  console.log('📝 catalogoServizi:', catalogoServizi.value)
  console.log('📝 showForm PRIMA:', showForm.value)
  servizioSelezionato.value = null
  
  // Force reactivity
  nextTick(() => {
    showForm.value = true
    console.log('✅ showForm DOPO nextTick:', showForm.value)
    console.log('✅ Catalogo disponibile:', catalogoServizi.value.length, 'servizi')
  })
}

const loadServizi = async () => {
  try {
    loading.value = true
    
    // Ottieni userId dalla sessione
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('Nessuna sessione trovata')
      return
    }
    
    const userId = session.user.id
    
    // Carica servizi del concessionario
    const response = await $fetch('/api/dealer/servizi', {
      query: { userId, limit: 100 }
    })

    if (response.success) {
      servizi.value = response.data
    }

    // Carica catalogo servizi
    console.log('📋 Caricamento catalogo servizi...')
    try {
      const catalogoResponse = await $fetch('/api/servizi-catalogo')
      console.log('📋 Risposta catalogo:', catalogoResponse)
      if (catalogoResponse.success) {
        catalogoServizi.value = catalogoResponse.data || []
        console.log('✅ Catalogo caricato:', catalogoServizi.value.length, 'servizi')
      } else {
        console.error('❌ Errore nel caricamento catalogo:', catalogoResponse.error)
      }
    } catch (error) {
      console.error('❌ Errore chiamata API catalogo:', error)
    }

  } catch (error) {
    console.error('Errore caricamento servizi:', error)
  } finally {
    loading.value = false
  }
}

const editServizio = (servizio) => {
  servizioSelezionato.value = servizio
  showForm.value = true
}

const toggleDisponibilita = async (servizio) => {
  try {
    // Ottieni token di autenticazione
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('Sessione non valida. Effettua il login.')
    }

    const response = await $fetch(`/api/servizi/${servizio.id}`, {
      method: 'PUT',
      body: {
        disponibile: !servizio.disponibile
      },
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    if (response.success) {
      servizio.disponibile = !servizio.disponibile
    }
  } catch (error) {
    console.error('Errore aggiornamento disponibilità:', error)
    alert(error.data?.message || error.message || 'Errore nell\'aggiornamento della disponibilità')
  }
}

const deleteServizio = async (servizio) => {
  if (!confirm(`Sei sicuro di voler eliminare il servizio "${servizio.servizi_catalogo.nome}"?`)) {
    return
  }

  try {
    // Ottieni token di autenticazione
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('Sessione non valida. Effettua il login.')
    }

    const response = await $fetch(`/api/servizi/${servizio.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    if (response.success) {
      servizi.value = servizi.value.filter(s => s.id !== servizio.id)
    }
  } catch (error) {
    console.error('Errore eliminazione servizio:', error)
    alert(error.data?.message || error.message || 'Errore nell\'eliminazione del servizio')
  }
}

const resetFilters = () => {
  filtroCategoria.value = ''
  filtroDisponibilita.value = ''
}

const closeForm = () => {
  showForm.value = false
  servizioSelezionato.value = null
}

const onServizioSaved = (nuovoServizio) => {
  if (servizioSelezionato.value) {
    // Aggiorna servizio esistente
    const index = servizi.value.findIndex(s => s.id === servizioSelezionato.value.id)
    if (index !== -1) {
      servizi.value[index] = nuovoServizio
    }
  } else {
    // Aggiungi nuovo servizio
    servizi.value.unshift(nuovoServizio)
  }
  closeForm()
}

// Lifecycle
onMounted(() => {
  loadServizi()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
