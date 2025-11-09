<template>
  <div class="min-h-screen w-full bg-white font-sans text-black">
    <!-- Header Menu -->
    <HeaderMenu />

    <!-- Hero Section -->
    <div class="bg-white" style="height: 200px;">
      <div class="container mx-auto px-4 h-full">
        <div class="grid lg:grid-cols-2 gap-8 items-center h-full">
          <!-- Testo a sinistra -->
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
              Servizi per la Tua Moto
            </h1>
            <p class="text-lg text-gray-600">
              Trova i migliori servizi di manutenzione e riparazione
            </p>
          </div>
          
          <!-- Immagine a destra -->
          <div class="flex justify-end">
            <div class="w-32 h-32 bg-gradient-to-br from-[#90c149] to-[#7ba83a] rounded-2xl shadow-lg">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri -->
    <div class="bg-gray-50 py-8">
      <div class="container mx-auto px-4">
        <ServiziFilters 
          :filters="filters" 
          :stats="stats" 
          @reset="resetFilters"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
      <div class="text-lg text-gray-600">Caricamento servizi...</div>
    </div>

    <!-- Servizi List -->
    <div v-else class="py-16">
      <div class="container mx-auto px-4">
        <!-- Results Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ servizi.length }} servizi trovati
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
        <div v-if="servizi.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div 
            v-for="servizio in servizi" 
            :key="servizio.id"
            class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
            @click="goToServizio(servizio)"
          >
            <!-- Header con gradiente -->
            <div class="h-24 bg-gradient-to-r from-[#90c149] to-[#7ba83a] flex items-center justify-center">
              <span class="text-white font-bold text-lg">{{ servizio.servizi_catalogo.categoria }}</span>
            </div>
            
            <!-- Contenuto principale -->
            <div class="p-5">
              <!-- Titolo -->
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-bold text-lg text-gray-900 group-hover:text-[#90c149] transition-colors">
                  {{ servizio.servizi_catalogo.nome }}
                </h3>
                <div class="text-2xl">
                  {{ servizio.servizi_catalogo.icona }}
                </div>
              </div>
              
              <!-- Descrizione -->
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">
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
              
              <!-- Info concessionari (array come moto nuove) -->
              <div class="mb-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-600">
                    {{ servizio.concessionari?.length || 0 }} 
                    {{ servizio.concessionari?.length === 1 ? 'concessionario' : 'concessionari' }}
                  </span>
                </div>
                <div v-if="servizio.concessionari && servizio.concessionari.length > 0" class="flex items-center gap-1 text-sm text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>
                    {{ [...new Set(servizio.concessionari.map(c => c.citta))].join(', ') }}
                  </span>
                </div>
              </div>
              
              <!-- Pulsante -->
              <button class="w-full bg-[#90c149] text-white py-3 px-4 rounded-lg hover:bg-[#7ba83a] transition-colors font-medium">
                Vedi Dettagli
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredServizi.length > 0" class="flex justify-center mt-12">
          <nav class="flex space-x-2">
            <button 
              v-for="page in totalPages" 
              :key="page"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium',
                currentPage === page 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              ]"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </nav>
        </div>

        <!-- No Results -->
        <div v-if="filteredServizi.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Nessun servizio trovato</h3>
          <p class="text-gray-600 mb-4">Prova a modificare i filtri di ricerca</p>
          <button 
            @click="resetFilters"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Reset Filtri
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Reactive data
const currentPage = ref(1)
const itemsPerPage = 12
const sortBy = ref('nome')

// Filters
const filters = ref({
  citta: '',
  categoria: ''
})

// Stats for filters
const stats = ref({
  citta: ['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze', 'Bologna'],
  categorie: ['Tagliando', 'Manutenzione', 'Riparazione', 'Revisione', 'Gomme', 'Assicurazione']
})

// Real data from API
const servizi = ref([])
const loading = ref(true)

// Computed properties
const filteredServizi = computed(() => {
  let filtered = [...servizi.value]
  
  // Filtro città lato client (come moto nuove) - mostra servizi che hanno almeno un concessionario nella città
  if (filters.value.citta) {
    filtered = filtered.filter(servizio => 
      servizio.concessionari?.some(c => c.citta === filters.value.citta)
    )
  }
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredServizi.value.length / itemsPerPage)
})

const paginatedServizi = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredServizi.value.slice(start, end)
})

// Methods
const loadServizi = async () => {
  try {
    loading.value = true
    
    const query = {}
    if (filters.value.citta) query.citta = filters.value.citta
    if (filters.value.categoria) query.categoria = filters.value.categoria
    
    const response = await $fetch('/api/servizi', { query })
    
    if (response.success) {
      servizi.value = response.data
      
      // Aggiorna le statistiche
      if (response.meta?.stats) {
        stats.value.citta = response.meta.stats.citta
        stats.value.categorie = response.meta.stats.categorie
      }
    }
  } catch (error) {
    console.error('Errore caricamento servizi:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    citta: '',
    categoria: ''
  }
  currentPage.value = 1
  loadServizi()
}

const goToServizio = (servizio) => {
  // Usa lo slug del servizio catalogo invece dell'ID (come moto nuove)
  const slug = servizio.servizi_catalogo?.slug || servizio.id
  navigateTo(`/servizi/${slug}`)
}

// Watch filters changes
watch(filters, () => {
  loadServizi()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadServizi()
})
</script>
