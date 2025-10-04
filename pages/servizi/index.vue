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
        
        <!-- Servizi Grid - Stile Scheda Moto -->
        <div v-if="filteredServizi.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div 
            v-for="servizio in paginatedServizi" 
            :key="servizio.id"
            class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
            @click="goToServizio(servizio.slug)"
          >
            <!-- Header con gradiente -->
            <div class="h-24 bg-gradient-to-r from-[#90c149] to-[#7ba83a] flex items-center justify-center">
              <span class="text-white font-bold text-lg">{{ servizio.categoria }}</span>
            </div>
            
            <!-- Contenuto principale -->
            <div class="p-5">
              <!-- Titolo e rating -->
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-bold text-lg text-gray-900 group-hover:text-[#90c149] transition-colors">
                  {{ servizio.nome }}
                </h3>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-700">{{ servizio.rating }}</span>
                </div>
              </div>
              
              <!-- Descrizione -->
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                {{ servizio.descrizione }}
              </p>
              
              <!-- Prezzo -->
              <div class="mb-4">
                <div class="text-2xl font-bold text-gray-900">
                  Da €{{ servizio.prezzoMin }}
                </div>
                <div class="text-sm text-gray-500">a partire da</div>
              </div>
              
              <!-- Info disponibilità -->
              <div class="mb-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-600">{{ servizio.disponibilita }}</span>
                </div>
                <div class="flex items-center gap-1 text-sm text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <span>{{ servizio.concessionari }} concessionari disponibili</span>
                </div>
              </div>
              
              <!-- Pulsante -->
              <button class="w-full bg-[#90c149] text-white py-3 px-4 rounded-lg hover:bg-[#7ba83a] transition-colors font-medium">
                Vedi Concessionari
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
import { ref, computed, onMounted } from 'vue'

// Reactive data
const loading = ref(false)
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

// Mock data
const servizi = ref([
  {
    id: 1,
    nome: 'Tagliando Moto',
    descrizione: 'Manutenzione completa per la tua moto',
    icon: '🔧',
    rating: 4.8,
    recensioni: 127,
    prezzoMin: 120,
    disponibilita: 'Disponibile oggi',
    categoria: 'Tagliando',
    citta: 'Roma',
    slug: 'tagliando',
    concessionari: 15
  },
  {
    id: 2,
    nome: 'Manutenzione Generale',
    descrizione: 'Controllo e riparazione componenti',
    icon: '⚙️',
    rating: 4.9,
    recensioni: 89,
    prezzoMin: 150,
    disponibilita: 'Disponibile domani',
    categoria: 'Manutenzione',
    citta: 'Milano',
    slug: 'manutenzione',
    concessionari: 12
  },
  {
    id: 3,
    nome: 'Riparazione Freni',
    descrizione: 'Sostituzione pastiglie e controllo sistema',
    icon: '🛑',
    rating: 4.7,
    recensioni: 203,
    prezzoMin: 80,
    disponibilita: 'Disponibile oggi',
    categoria: 'Riparazione',
    citta: 'Napoli',
    slug: 'riparazione-freni',
    concessionari: 8
  },
  {
    id: 4,
    nome: 'Revisione Tecnica',
    descrizione: 'Controllo completo per il bollo',
    icon: '📋',
    rating: 4.6,
    recensioni: 156,
    prezzoMin: 200,
    disponibilita: 'Prenotabile',
    categoria: 'Revisione',
    citta: 'Torino',
    slug: 'revisione',
    concessionari: 20
  },
  {
    id: 5,
    nome: 'Cambio Gomme',
    descrizione: 'Montaggio e bilanciamento pneumatici',
    icon: '🛞',
    rating: 4.8,
    recensioni: 98,
    prezzoMin: 60,
    disponibilita: 'Disponibile oggi',
    categoria: 'Gomme',
    citta: 'Firenze',
    slug: 'cambio-gomme',
    concessionari: 25
  },
  {
    id: 6,
    nome: 'Assicurazione Moto',
    descrizione: 'Polizze competitive per la tua moto',
    icon: '🛡️',
    rating: 4.5,
    recensioni: 234,
    prezzoMin: 300,
    disponibilita: 'Sempre disponibile',
    categoria: 'Assicurazione',
    citta: 'Bologna',
    slug: 'assicurazione',
    concessionari: 18
  }
])

// Computed properties
const filteredServizi = computed(() => {
  let filtered = servizi.value

  if (filters.value.citta) {
    filtered = filtered.filter(servizio => 
      servizio.citta.toLowerCase().includes(filters.value.citta.toLowerCase())
    )
  }

  if (filters.value.categoria) {
    filtered = filtered.filter(servizio => 
      servizio.categoria.toLowerCase().includes(filters.value.categoria.toLowerCase())
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
const resetFilters = () => {
  filters.value = {
    citta: '',
    categoria: ''
  }
  currentPage.value = 1
}

const goToServizio = (slug) => {
  navigateTo(`/servizi/${slug}`)
}

// Lifecycle
onMounted(() => {
  // Simulate loading
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>
