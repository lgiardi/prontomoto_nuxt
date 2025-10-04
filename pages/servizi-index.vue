<template>
  <div class="min-h-screen w-full bg-white font-sans text-black">
    <!-- Header Menu -->
    <HeaderMenu />

    <!-- Main Content -->
    <div class="w-full px-5 py-4">
      <div class="w-full">
        
        <!-- Filtri -->
        <div ref="filtersSection" class="px-4 py-4">
          <ServiziFilters 
            :filters="filters" 
            :stats="stats" 
            @reset="resetFilters"
          />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
          <div class="text-lg text-gray-600">Caricamento servizi...</div>
        </div>
          
        <!-- Results -->
        <div v-else>
          <!-- Results Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ filteredServizi.length }} servizi trovati
            </h2>
            <div class="flex items-center space-x-4">
              <select v-model="sortBy" class="border rounded-lg px-3 py-2">
                <option value="nome">Ordina per Nome</option>
                <option value="prezzo">Ordina per Prezzo</option>
                <option value="rating">Ordina per Rating</option>
              </select>
            </div>
          </div>
            
          <!-- Servizi Grid -->
          <div v-if="filteredServizi.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div 
              v-for="servizio in paginatedServizi" 
              :key="servizio.id"
              :class="[
                'rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow',
                cittaSelezionata && servizio.concessionari?.some(c => c.citta === cittaSelezionata) 
                  ? 'bg-green-50 border-2 border-[#90c149]' 
                  : 'bg-white'
              ]"
            >
              <!-- Servizio Image -->
              <div class="relative h-48 bg-gray-200">
                <img 
                  :src="servizio.immagineUrl || 'https://via.placeholder.com/400x300'" 
                  :alt="servizio.nome"
                  class="w-full h-full object-cover"
                />
                <div class="absolute top-3 left-3">
                  <span class="bg-[#90c149] text-white px-2 py-1 rounded-full text-xs font-medium">
                    {{ servizio.categoria }}
                  </span>
                </div>
                <div class="absolute top-3 right-3">
                  <button class="bg-white/90 hover:bg-white p-2 rounded-full transition-colors">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Servizio Info -->
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {{ servizio.nome }}
                </h3>
                
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                  {{ servizio.descrizione }}
                </p>

                <!-- Prezzo -->
                <div class="flex items-center justify-between mb-3">
                  <div class="text-2xl font-bold text-gray-900">
                    €{{ servizio.prezzo?.toLocaleString() || 'N/A' }}
                  </div>
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">{{ servizio.rating || '4.5' }}</span>
                  </div>
                </div>

                <!-- Concessionari -->
                <div class="mb-4">
                  <div class="text-sm text-gray-600 mb-2">
                    {{ servizio.concessionari?.length || 0 }} concessionari disponibili
                  </div>
                  <div class="flex -space-x-2">
                    <div 
                      v-for="(concessionario, index) in servizio.concessionari?.slice(0, 3)" 
                      :key="index"
                      class="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                    >
                      {{ concessionario.nome?.charAt(0) || 'C' }}
                    </div>
                    <div 
                      v-if="servizio.concessionari?.length > 3"
                      class="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                    >
                      +{{ servizio.concessionari.length - 3 }}
                    </div>
                  </div>
                </div>

                <!-- Città -->
                <div class="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>{{ servizio.citta || 'Disponibile in tutta Italia' }}</span>
                </div>

                <!-- Action Button -->
                <button class="w-full bg-[#90c149] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#7ba83a] transition-colors">
                  Prenota Servizio
                </button>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else class="text-center py-12">
            <div class="text-gray-500 text-lg mb-4">Nessun servizio trovato</div>
            <button @click="resetFilters" class="text-[#90c149] hover:underline">
              Rimuovi filtri
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-8">
            <nav class="flex items-center space-x-2">
              <button 
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 rounded-lg text-sm font-medium',
                  page === currentPage 
                    ? 'bg-[#90c149] text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </button>
              
              <button 
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: false
})

// Reactive data
const loading = ref(true)
const servizi = ref([])
const filters = ref({
  citta: '',
  categoria: ''
})
const stats = ref({})
const cittaSelezionata = ref('')
const sortBy = ref('nome')
const currentPage = ref(1)
const itemsPerPage = ref(12)

// Computed properties
const filteredServizi = computed(() => {
  let filtered = servizi.value

  // Filtro per città
  if (filters.value.citta) {
    filtered = filtered.filter(servizio => 
      servizio.concessionari?.some(c => c.citta === filters.value.citta)
    )
  }

  // Filtro per categoria
  if (filters.value.categoria) {
    filtered = filtered.filter(servizio => 
      servizio.categoria === filters.value.categoria
    )
  }


  // Ordinamento
  if (sortBy.value === 'nome') {
    filtered.sort((a, b) => a.nome.localeCompare(b.nome))
  } else if (sortBy.value === 'prezzo') {
    filtered.sort((a, b) => (a.prezzo || 0) - (b.prezzo || 0))
  } else if (sortBy.value === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredServizi.value.length / itemsPerPage.value))

const paginatedServizi = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredServizi.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
const loadServizi = async () => {
  try {
    loading.value = true
    
    // Dati mock per i servizi (come le moto)
    servizi.value = [
      {
        id: 1,
        nome: 'Tagliando Completo Honda',
        categoria: 'Manutenzione',
        descrizione: 'Tagliando completo con cambio olio, filtri, controlli generali e certificato',
        prezzo: 120,
        rating: 4.8,
        immagineUrl: 'https://via.placeholder.com/400x300',
        citta: 'Roma',
        concessionari: [
          { nome: 'Honda Roma Centro', citta: 'Roma' },
          { nome: 'Honda Milano', citta: 'Milano' }
        ]
      },
      {
        id: 2,
        nome: 'Carrozzeria e Verniciatura',
        categoria: 'Riparazione',
        descrizione: 'Riparazione carrozzeria, verniciatura, trattamento antiruggine',
        prezzo: 350,
        rating: 4.9,
        immagineUrl: 'https://via.placeholder.com/400x300',
        citta: 'Milano',
        concessionari: [
          { nome: 'Yamaha Milano', citta: 'Milano' },
          { nome: 'Carrozzeria Roma', citta: 'Roma' }
        ]
      },
      {
        id: 3,
        nome: 'Revisione Tecnica',
        categoria: 'Revisione',
        descrizione: 'Revisione tecnica completa, certificazione, bollo',
        prezzo: 80,
        rating: 4.7,
        immagineUrl: 'https://via.placeholder.com/400x300',
        citta: 'Napoli',
        concessionari: [
          { nome: 'KTM Napoli', citta: 'Napoli' }
        ]
      },
      {
        id: 4,
        nome: 'Riparazione Guasti',
        categoria: 'Riparazione',
        descrizione: 'Diagnosi e riparazione guasti, interventi urgenti',
        prezzo: 200,
        rating: 4.6,
        immagineUrl: 'https://via.placeholder.com/400x300',
        citta: 'Torino',
        concessionari: [
          { nome: 'Ducati Torino', citta: 'Torino' }
        ]
      },
      {
        id: 5,
        nome: 'Lavaggio e Lucidatura',
        categoria: 'Lavaggio',
        descrizione: 'Lavaggio completo, lucidatura, trattamento cera',
        prezzo: 45,
        rating: 4.8,
        immagineUrl: 'https://via.placeholder.com/400x300',
        citta: 'Bologna',
        concessionari: [
          { nome: 'BMW Bologna', citta: 'Bologna' }
        ]
      },
      {
        id: 6,
        nome: 'Sostituzione Pneumatici',
        categoria: 'Pneumatici',
        descrizione: 'Sostituzione pneumatici, bilanciatura, allineamento',
        prezzo: 180,
        rating: 4.5,
        immagineUrl: 'https://via.placeholder.com/400x300',
        citta: 'Firenze',
        concessionari: [
          { nome: 'Kawasaki Firenze', citta: 'Firenze' }
        ]
      }
    ]

    // Calcola statistiche
    stats.value = {
      citta: [...new Set(servizi.value.flatMap(s => s.concessionari?.map(c => c.citta) || []))],
      categorie: [...new Set(servizi.value.map(s => s.categoria))]
    }

  } catch (error) {
    console.error('Errore nel caricamento servizi:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    citta: '',
    categoria: ''
  }
  cittaSelezionata.value = ''
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Lifecycle
onMounted(() => {
  loadServizi()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
