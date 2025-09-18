<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header Menu -->
    <HeaderMenu />
    
    <!-- Hero Banner -->
    <div class="relative bg-gradient-to-r from-[#90c149] to-[#7aa83f] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Trova la Moto Perfetta 🏍️
          </h1>
          <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Scopri migliaia di moto disponibili dai migliori concessionari d'Italia
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              @click="scrollToFilters"
              class="bg-white text-[#90c149] px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cerca Moto
            </button>
            <NuxtLink 
              to="/auth/register"
              class="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#90c149] transition-colors"
            >
              Diventa Concessionario
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Decorative elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-10 left-10 text-6xl opacity-20">🏍️</div>
        <div class="absolute top-20 right-20 text-4xl opacity-20">🏁</div>
        <div class="absolute bottom-10 left-1/4 text-5xl opacity-20">🏆</div>
        <div class="absolute bottom-20 right-1/4 text-3xl opacity-20">⚡</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="w-full px-4 py-8">
      <div class="max-w-7xl mx-auto">
        
        <!-- Filtri -->
        <div ref="filtersSection">
          <MotoFilters 
            :filters="filters" 
            :stats="stats" 
            @reset="resetFilters"
          />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
          <div class="text-lg text-gray-600">Caricamento moto...</div>
        </div>
          
        <!-- Results -->
        <div v-else>
          <!-- Results Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ filteredMotos.length }} moto trovate
            </h2>
            <div class="flex items-center space-x-4">
              <select v-model="sortBy" class="border rounded-lg px-3 py-2">
                <option value="marca">Ordina per Marca</option>
                <option value="prezzo">Ordina per Prezzo</option>
                <option value="cilindrata">Ordina per Cilindrata</option>
              </select>
            </div>
          </div>
            
          <!-- Moto Grid -->
          <div v-if="filteredMotos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div 
              v-for="moto in paginatedMotos" 
              :key="moto._id"
              class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <!-- Immagine -->
              <div class="aspect-square bg-gray-200 cursor-pointer" @click="goToMoto(moto._id)">
                <img 
                  v-if="moto.immagineUrl" 
                  :src="moto.immagineUrl" 
                  :alt="`${moto.marca} ${moto.modello}`"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-4xl text-gray-400">🏍️</span>
                </div>
              </div>
              
              <!-- Info -->
              <div class="p-4">
                <h3 class="font-bold text-lg text-gray-900 mb-1">
                  {{ moto.marca }} {{ moto.modello }}
                </h3>
                
                <div v-if="moto.allestimento" class="text-sm text-gray-600 mb-2">
                  {{ moto.allestimento }}
                </div>
                
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-gray-500">{{ moto.categoria }}</span>
                  <span class="text-sm text-gray-500">{{ moto.cilindrata }} cc</span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-lg font-bold text-[#90c149]">
                    {{ moto.prezzo ? `€${moto.prezzo.toLocaleString()}` : 'Prezzo su richiesta' }}
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ moto.concessionariCount }} concessionari
                </span>
                </div>
              </div>
              </div>
            </div>
            
          <!-- No Results -->
          <div v-else class="text-center py-12">
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Nessuna moto trovata</h3>
            <p class="text-gray-600 mb-4">Prova a modificare i filtri di ricerca</p>
            <button 
              @click="resetFilters"
              class="bg-[#90c149] text-white px-6 py-2 rounded-lg hover:bg-[#7aa83f] transition-colors"
            >
              Reset Filtri
            </button>
            </div>
            
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-8">
            <nav class="flex space-x-2">
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium',
                  currentPage === page 
                    ? 'bg-[#90c149] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </nav>
          </div>
        </div>
    </div>
    </div>

    <!-- Modal Fissa Appuntamento -->
    <ModalFissaAppuntamento 
      :isOpen="modalAppuntamento.isOpen"
      :moto="modalAppuntamento.moto"
      @close="chiudiModalAppuntamento"
      @bookAppointment="fissaAppuntamento"
    />

    <!-- Modal Concessionari -->
    <ModalConcessionari 
      :isOpen="modalConcessionari.isOpen"
      :moto="modalConcessionari.moto"
      @close="chiudiModalConcessionari"
      @bookAppointment="fissaAppuntamento"
    />
  </div>
</template>

<script setup>
// Meta
definePageMeta({
  layout: false
})

// Data
const motos = ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 12
const sortBy = ref('marca')
const filtersSection = ref(null)

// Modal states
const modalAppuntamento = ref({
  isOpen: false,
  moto: null
})

const modalConcessionari = ref({
  isOpen: false,
  moto: null
})

// Filters
const filters = ref({
  categoria: '',
  cilindrata: '',
  marca: '',
  modello: '',
  allestimento: '',
  citta: ''
})

// Stats for filters
const stats = ref({
  categorie: [],
  cilindrate: [],
  marche: [],
  modelli: [],
  allestimenti: [],
  citta: []
})

// Computed
const filteredMotos = computed(() => {
  let filtered = [...motos.value]
  
  // Apply filters
  if (filters.value.categoria) {
    filtered = filtered.filter(moto => moto.categoria === filters.value.categoria)
  }
  if (filters.value.cilindrata) {
    filtered = filtered.filter(moto => moto.cilindrata === parseInt(filters.value.cilindrata))
  }
  if (filters.value.marca) {
    filtered = filtered.filter(moto => moto.marca === filters.value.marca)
  }
  if (filters.value.modello) {
    filtered = filtered.filter(moto => moto.modello === filters.value.modello)
  }
  if (filters.value.allestimento) {
    filtered = filtered.filter(moto => moto.allestimento === filters.value.allestimento)
  }
  if (filters.value.citta) {
    filtered = filtered.filter(moto => 
      moto.concessionari.some(c => c.citta === filters.value.citta)
    )
  }
  
  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'prezzo':
        return (a.prezzo || 0) - (b.prezzo || 0)
      case 'cilindrata':
        return (a.cilindrata || 0) - (b.cilindrata || 0)
      default:
        return a.marca.localeCompare(b.marca)
    }
  })
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredMotos.value.length / itemsPerPage)
})

const paginatedMotos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredMotos.value.slice(start, end)
})

// Methods
const goToMoto = (id) => {
  navigateTo(`/moto/${id}`)
}

const resetFilters = () => {
  filters.value = {
    categoria: '',
    cilindrata: '',
    marca: '',
    modello: '',
    allestimento: '',
    citta: ''
  }
  currentPage.value = 1
}

const scrollToFilters = () => {
  if (filtersSection.value) {
    filtersSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

// Modal methods
const apriModalAppuntamento = (moto) => {
  modalAppuntamento.value = {
    isOpen: true,
    moto: moto
  }
}

const chiudiModalAppuntamento = () => {
  modalAppuntamento.value = {
    isOpen: false,
    moto: null
  }
}

const apriModalConcessionari = (moto) => {
  modalConcessionari.value = {
    isOpen: true,
    moto: moto
  }
}

const chiudiModalConcessionari = () => {
  modalConcessionari.value = {
    isOpen: false,
    moto: null
  }
}

const fissaAppuntamento = (concessionario) => {
  // Logica per fissare appuntamento
  console.log('Fissare appuntamento con:', concessionario)
  // Qui potresti aprire un form o reindirizzare a una pagina
  chiudiModalAppuntamento()
  chiudiModalConcessionari()
}

const calculateStats = () => {
  const categories = {}
  const cilindrate = {}
  const marche = {}
  const modelli = {}
  const allestimenti = {}
  const citta = {}
  
  motos.value.forEach(moto => {
    // Categories
    if (moto.categoria) {
      categories[moto.categoria] = (categories[moto.categoria] || 0) + 1
    }
    
    // Cilindrate
    if (moto.cilindrata) {
      cilindrate[moto.cilindrata] = (cilindrate[moto.cilindrata] || 0) + 1
    }
    
    // Marche
    if (moto.marca) {
      marche[moto.marca] = (marche[moto.marca] || 0) + 1
    }
    
    // Modelli
    if (moto.modello) {
      modelli[moto.modello] = (modelli[moto.modello] || 0) + 1
    }
    
    // Allestimenti
    if (moto.allestimento) {
      allestimenti[moto.allestimento] = (allestimenti[moto.allestimento] || 0) + 1
    }
    
    // Città
    moto.concessionari.forEach(concessionario => {
      if (concessionario.citta) {
        citta[concessionario.citta] = (citta[concessionario.citta] || 0) + 1
      }
    })
  })
  
  stats.value = {
    categorie: Object.entries(categories).map(([name, count]) => ({ name, count })),
    cilindrate: Object.entries(cilindrate).map(([value, count]) => ({ value: parseInt(value), count })),
    marche: Object.entries(marche).map(([name, count]) => ({ name, count })),
    modelli: Object.entries(modelli).map(([name, count]) => ({ name, count })),
    allestimenti: Object.entries(allestimenti).map(([name, count]) => ({ name, count })),
    citta: Object.entries(citta).map(([name, count]) => ({ name, count }))
  }
}

// Load data
onMounted(async () => {
  try {
    const data = await $fetch('/api/motos')
    motos.value = data || []
    calculateStats()
  } catch (error) {
    console.error('Errore nel caricamento moto:', error)
  } finally {
    loading.value = false
  }
})

// Watch filters to reset pagination
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })
</script>

