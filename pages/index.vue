<template>
  <div class="min-h-screen w-full bg-white font-sans text-black">
    <!-- Header Menu -->
    <HeaderMenu />
    
    
    <!-- Main Content -->
    <div class="w-full px-5 py-4">
      <div class="w-full">
        
        <!-- Filtri -->
        <div ref="filtersSection" class="px-4 py-4">
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
              <div 
                class="aspect-square bg-gray-200 cursor-pointer bg-center bg-no-repeat bg-contain" 
                :style="moto.immagineUrl ? `background-image: url(${moto.immagineUrl})` : ''"
                @click="goToMoto(moto._id)"
              >
                <div v-if="!moto.immagineUrl" class="w-full h-full flex items-center justify-center">
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
                
                <div class="flex justify-between items-center mb-3">
                  <span class="text-lg font-bold text-[#90c149]">
                    {{ moto.prezzo ? `€${moto.prezzo.toLocaleString()}` : 'Prezzo su richiesta' }}
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ moto.concessionariCount }} concessionari
                </span>
                </div>
                
                <!-- CTA Fissa Appuntamento -->
                <button 
                  @click="openAppointmentModal(moto)"
                  class="w-full bg-[#90c149] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#7aa83f] transition-colors"
                >
                  Fissa Appuntamento
                </button>
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
      :isOpen="showAppointmentModal"
      :moto="selectedMoto"
      @close="closeAppointmentModal"
      @openDetail="goToMotoDetail"
    />
  </div>
</template>

<script setup>
// Meta
definePageMeta({
  layout: false
})

// Import components
import ModalFissaAppuntamento from '~/components/ModalFissaAppuntamento.vue'

// Data
const motos = ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 12
const sortBy = ref('marca')
const filtersSection = ref(null)


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

// Modal state
const showAppointmentModal = ref(false)
const selectedMoto = ref(null)

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

// Modal functions
const openAppointmentModal = (moto) => {
  selectedMoto.value = moto
  showAppointmentModal.value = true
}

const closeAppointmentModal = () => {
  showAppointmentModal.value = false
  selectedMoto.value = null
}

const goToMotoDetail = (concessionario) => {
  // Naviga alla scheda moto con il concessionario selezionato
  navigateTo(`/moto/${selectedMoto.value._id}?concessionario=${concessionario._id}`)
}
</script>