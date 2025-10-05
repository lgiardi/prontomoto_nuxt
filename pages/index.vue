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
              :class="[
                'rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow',
                cittaSelezionata && moto.concessionari?.some(c => c.citta === cittaSelezionata) 
                  ? 'bg-green-50 border-2 border-[#90c149]' 
                  : 'bg-white'
              ]"
            >
              <!-- Immagine con logo sopra -->
              <div class="relative">
                <!-- Logo sopra l'immagine -->
                <div class="absolute top-4 left-4 right-4 z-10 flex justify-center">
                  <img 
                    v-if="moto.marca === 'Benelli'"
                    src="https://www.gemotors.it/wp-content/uploads/2025/03/benelli-seeklogo-768x243.png" 
                    :alt="`Logo ${moto.marca}`"
                    class="h-8"
                  />
                </div>
                
              <!-- Immagine -->
              <div 
                  class="aspect-square cursor-pointer bg-center bg-no-repeat bg-contain relative" 
                @click="goToMoto(moto)"
              >
                
                <!-- Immagine con tag img -->
                <img 
                  v-if="moto.immagineUrl"
                  :src="moto.immagineUrl" 
                  :alt="`${moto.marca} ${moto.modello}`"
                  class="w-full h-full object-contain"
                  @error="console.log('Errore caricamento immagine:', moto.immagineUrl)"
                />
                
                <div v-if="!moto.immagineUrl" class="w-full h-full flex items-center justify-center">
                  <span class="text-4xl text-gray-400">🏍️</span>
                </div>
                </div>
              </div>
              
              <!-- Info sotto l'immagine -->
              <div class="p-6">
                <!-- Header con titolo e prezzo -->
                <div class="mb-4">
                  <h3 class="font-bold text-xl text-gray-900 mb-1">
                  {{ moto.marca }} {{ moto.modello }}
                </h3>
                
                <div v-if="moto.allestimento" class="text-sm text-gray-600 mb-2">
                  {{ moto.allestimento }}
                </div>
                
                  <div class="text-2xl font-bold text-gray-900">
                    {{ moto.prezzo ? `€${moto.prezzo.toLocaleString()}` : 'Prezzo su richiesta' }}
                  </div>
                </div>
                
                <!-- Specifiche tecniche -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="text-center p-2 bg-gray-50 rounded-lg">
                    <div class="text-xs text-gray-500 uppercase tracking-wide">Categoria</div>
                    <div class="text-sm font-medium text-gray-900">{{ moto.categoria }}</div>
                  </div>
                  <div class="text-center p-2 bg-gray-50 rounded-lg">
                    <div class="text-xs text-gray-500 uppercase tracking-wide">Cilindrata</div>
                    <div class="text-sm font-medium text-gray-900">{{ moto.cilindrata }} cc</div>
                  </div>
                </div>
                
                <!-- Badge disponibilità città -->
                <div v-if="cittaSelezionata && moto.concessionari?.some(c => c.citta === cittaSelezionata)" class="mb-3">
                  <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#90c149] text-white rounded-full text-xs font-medium">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Disponibile a {{ cittaSelezionata }}
                  </div>
                </div>
                
                <!-- Disponibilità e colori -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span class="text-sm font-medium text-gray-900">
                        <template v-if="cittaSelezionata">
                          Disponibile a {{ cittaSelezionata }}
                        </template>
                        <template v-else>
                          Disponibile in Italia
                        </template>
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      <span class="text-sm text-gray-600">
                        <template v-if="cittaSelezionata">
                          {{ getConcessionariInCitta(moto, cittaSelezionata) }} venditori
                        </template>
                        <template v-else>
                          {{ moto.concessionari?.length || 0 }} concessionari
                        </template>
                      </span>
                    </div>
                  </div>
                  
                  <!-- Colori Disponibili -->
                  <div v-if="moto.colori && moto.colori.length > 0" class="mt-3">
                    <div class="flex items-center gap-2 mb-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                      </svg>
                      <span class="text-xs text-gray-500 uppercase tracking-wide">Colori disponibili</span>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="(colore, index) in moto.colori.slice(0, 3)" 
                        :key="index"
                        class="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 font-medium"
                      >
                        {{ colore }}
                  </span>
                      <span v-if="moto.colori.length > 3" class="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 font-medium">
                        +{{ moto.colori.length - 3 }}
                </span>
                    </div>
                  </div>
                </div>
                
                <!-- CTA Vedi Dettagli -->
                <button 
                  @click="goToMoto(moto)"
                  class="w-full bg-[#90c149] text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-[#7aa83f] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Vedi Dettagli
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
const cittaSelezionata = computed(() => {
  return filters.value.citta
})

const filteredMotos = computed(() => {
  let filtered = [...motos.value]
  
  // Apply filters
  if (filters.value.categoria) {
    filtered = filtered.filter(moto => moto.categoria === filters.value.categoria)
  }
  if (filters.value.cilindrata) {
    filtered = filtered.filter(moto => {
      const motoCilindrataNormalizzata = normalizeCilindrata(moto.cilindrata, moto.modello)
      return motoCilindrataNormalizzata === parseInt(filters.value.cilindrata)
    })
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
      moto.concessionari?.some(c => c.citta === filters.value.citta)
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
const goToMoto = (moto) => {
  // Crea URL basato su categoria e marca-modello
  const categoria = moto.categoria?.toLowerCase().replace(/\s+/g, '-') || 'moto'
  const marca = moto.marca?.toLowerCase().replace(/\s+/g, '-') || ''
  const modello = moto.modello?.toLowerCase().replace(/\s+/g, '-') || ''
  const slug = `${marca}-${modello}`
  
  console.log('Navigating to:', `/${categoria}/${slug}`)
  console.log('Moto data:', { categoria: moto.categoria, marca: moto.marca, modello: moto.modello })
  
  navigateTo(`/${categoria}/${slug}`)
}

const getConcessionariInCitta = (moto, citta) => {
  if (!moto.concessionari) return 0
  return moto.concessionari.filter(concessionario => 
    concessionario.citta.toLowerCase() === citta.toLowerCase()
  ).length
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


// Funzione per normalizzare le cilindrate (raggruppa 124 in 125, etc.)
const normalizeCilindrata = (cilindrata, modello = '') => {
  if (!cilindrata && !modello) return null
  
  // Prima controlla se nel modello c'è un numero
  if (modello) {
    const modelloStr = modello.toString()
    const numeroNelModello = modelloStr.match(/\d+/)
    if (numeroNelModello) {
      const numero = parseInt(numeroNelModello[0])
      // Se il numero è una cilindrata valida, usalo
      if (numero >= 50 && numero <= 2000) {
        return numero
      }
    }
  }
  
  // Se non c'è nel modello, usa la cilindrata numerica
  const cc = parseInt(cilindrata)
  if (!cc) return null
  
  // Raggruppa cilindrate simili
  if (cc >= 120 && cc <= 130) return 125
  if (cc >= 150 && cc <= 160) return 150
  if (cc >= 200 && cc <= 250) return 250
  if (cc >= 300 && cc <= 350) return 300
  if (cc >= 400 && cc <= 450) return 400
  if (cc >= 500 && cc <= 550) return 500
  if (cc >= 600 && cc <= 650) return 600
  if (cc >= 700 && cc <= 750) return 700
  if (cc >= 800 && cc <= 850) return 800
  if (cc >= 900 && cc <= 950) return 900
  if (cc >= 1000 && cc <= 1100) return 1000
  if (cc >= 1200 && cc <= 1300) return 1200
  
  return cc
}

const calculateStats = () => {
  const categories = {}
  const cilindrate = {}
  const marche = {}
  const modelli = {}
  const allestimenti = {}
  const citta = {}
  
  // Filtra le moto in base ai filtri attuali (escluso il filtro per cui stiamo calcolando le stats)
  const filteredMotos = motos.value.filter(moto => {
    // Applica tutti i filtri tranne quello per cui stiamo calcolando le statistiche
    if (filters.value.categoria && moto.categoria !== filters.value.categoria) return false
    
    // Per il filtro cilindrata, usa la cilindrata normalizzata
    if (filters.value.cilindrata) {
      const motoCilindrataNormalizzata = normalizeCilindrata(moto.cilindrata, moto.modello)
      const filtroCilindrata = parseInt(filters.value.cilindrata)
      if (motoCilindrataNormalizzata !== filtroCilindrata) return false
    }
    
    if (filters.value.marca && moto.marca !== filters.value.marca) return false
    if (filters.value.modello && moto.modello !== filters.value.modello) return false
    if (filters.value.allestimento && moto.allestimento !== filters.value.allestimento) return false
    // Non applico il filtro per città quando calcolo le statistiche delle città
    // altrimenti vedo solo le città che hanno moto con i filtri attuali
    return true
  })
  
  filteredMotos.forEach(moto => {
    // Categories
    if (moto.categoria) {
      categories[moto.categoria] = (categories[moto.categoria] || 0) + 1
    }
    
    // Cilindrate (normalizzate)
    if (moto.cilindrata || moto.modello) {
      const cilindrataNormalizzata = normalizeCilindrata(moto.cilindrata, moto.modello)
      if (cilindrataNormalizzata) {
        cilindrate[cilindrataNormalizzata] = (cilindrate[cilindrataNormalizzata] || 0) + 1
      }
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

// Watch filters to reset pagination and recalculate stats
watch(filters, () => {
  currentPage.value = 1
  calculateStats() // Ricalcola le statistiche quando cambiano i filtri
}, { deep: true })

</script>