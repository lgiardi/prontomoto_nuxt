<template>
  <div class="min-h-screen w-full bg-white font-sans text-black">
    <HeaderMenu />
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
      <div class="text-lg text-gray-600">Caricamento dati concessionario...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 text-xl font-semibold mb-2">{{ error }}</div>
      <NuxtLink to="/" class="text-[#90c149] hover:underline">Torna alla home</NuxtLink>
    </div>

    <!-- Main Content -->
    <div v-else-if="concessionario" class="w-full px-5 py-4">
      <!-- Header Concessionario -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ concessionario.nome }}</h1>
            <div class="flex items-center gap-4 text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>{{ concessionario.via ? `${concessionario.via}, ` : '' }}{{ concessionario.citta }}, {{ concessionario.provincia }}</span>
              </div>
              <div v-if="concessionario.telefono" class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>{{ concessionario.telefono }}</span>
              </div>
            </div>
          </div>
          <!-- Rating -->
          <div v-if="concessionario.rating_medio && concessionario.numero_recensioni > 0" class="flex items-center gap-2">
            <div class="flex items-center gap-0.5">
              <svg 
                v-for="i in 5" 
                :key="i"
                class="w-6 h-6"
                :class="i <= Math.round(concessionario.rating_medio) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <div class="text-lg font-bold text-gray-900">{{ concessionario.rating_medio.toFixed(1) }}</div>
              <div class="text-sm text-gray-600">({{ concessionario.numero_recensioni }} recensioni)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex space-x-8">
          <button
            @click="activeTab = 'motos'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'motos'
                ? 'border-[#90c149] text-[#90c149]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Moto Nuove
            <span v-if="motosNuove.length > 0" class="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {{ motosNuove.length }}
            </span>
          </button>
          <button
            v-if="motoUsate.length > 0"
            @click="activeTab = 'usate'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'usate'
                ? 'border-[#90c149] text-[#90c149]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Moto Usate
            <span class="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {{ motoUsate.length }}
            </span>
          </button>
          <button
            v-if="servizi.length > 0"
            @click="activeTab = 'servizi'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'servizi'
                ? 'border-[#90c149] text-[#90c149]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Servizi
            <span class="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {{ servizi.length }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Filtri (condivisi tra tutte le tab) -->
      <div v-if="activeTab === 'motos'" class="mb-6">
        <MotoFilters 
          :filters="filters" 
          :stats="statsMotos" 
          @update:filters="(newFilters) => { filters = newFilters }"
          @reset="resetFilters"
        />
      </div>

      <!-- Tab Content: Moto Nuove -->
      <div v-if="activeTab === 'motos'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ filteredMotosNuove.length }} moto trovate
          </h2>
          <select v-model="sortBy" class="border rounded-lg px-3 py-2">
            <option value="marca">Ordina per Marca</option>
            <option value="prezzo">Ordina per Prezzo</option>
            <option value="cilindrata">Ordina per Cilindrata</option>
          </select>
        </div>

        <!-- Grid Moto Nuove -->
        <div v-if="filteredMotosNuove.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="moto in paginatedMotosNuove" 
            :key="moto._id || moto.id"
            class="rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer"
            @click="goToMoto(moto)"
          >
            <!-- Immagine -->
            <div class="aspect-square bg-center bg-no-repeat bg-contain relative">
              <img 
                v-if="moto.immagineUrl"
                :src="moto.immagineUrl" 
                :alt="`${moto.marca} ${moto.modello}`"
                class="w-full h-full object-contain"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-4xl text-gray-400">🏍️</span>
              </div>
            </div>
            
            <!-- Info -->
            <div class="p-6">
              <h3 class="font-bold text-xl text-gray-900 mb-1">
                {{ moto.marca }} {{ moto.modello }}
              </h3>
              <div v-if="moto.allestimento" class="text-sm text-gray-600 mb-2">
                {{ moto.allestimento }}
              </div>
              <div class="text-2xl font-bold text-gray-900 mb-4">
                {{ moto.prezzo ? `€${moto.prezzo.toLocaleString()}` : 'Prezzo su richiesta' }}
              </div>
              
              <!-- Specifiche -->
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
              
              <button 
                @click.stop="goToMoto(moto)"
                class="w-full bg-[#90c149] text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-[#7aa83f] transition-all"
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
        <div v-if="totalPagesMotos > 1" class="flex justify-center mt-8">
          <nav class="flex space-x-2">
            <button 
              v-for="page in totalPagesMotos" 
              :key="page"
              @click="currentPageMotos = page"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium',
                currentPageMotos === page 
                  ? 'bg-[#90c149] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab Content: Moto Usate -->
      <div v-if="activeTab === 'usate'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ filteredMotoUsate.length }} moto usate trovate
          </h2>
        </div>

        <!-- Grid Moto Usate -->
        <div v-if="filteredMotoUsate.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="moto in filteredMotoUsate" 
            :key="moto.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewMotoUsata(moto)"
          >
            <!-- Immagine -->
            <div class="h-48 bg-gray-200 relative">
              <img 
                :src="moto.immagineUrl || 'https://via.placeholder.com/300x200?text=' + moto.marca + '+' + moto.modello" 
                :alt="moto.marca + ' ' + moto.modello"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Contenuto -->
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                {{ moto.marca }} {{ moto.modello }}
              </h3>
              
              <div class="space-y-2 text-sm text-gray-600 mb-4">
                <div class="flex justify-between">
                  <span>Anno:</span>
                  <span class="font-medium">{{ moto.anno }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Km:</span>
                  <span class="font-medium">{{ moto.km?.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Prezzo:</span>
                  <span class="font-bold text-[#90c149] text-lg">€{{ moto.prezzo?.toLocaleString() }}</span>
                </div>
              </div>

              <button
                @click.stop="viewMotoUsata(moto)"
                class="w-full px-3 py-2 text-sm bg-[#90c149] text-white rounded-md hover:bg-[#7ba83a] transition-colors"
              >
                Vedi Dettagli
              </button>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Nessuna moto usata trovata</h3>
        </div>
      </div>

      <!-- Tab Content: Servizi -->
      <div v-if="activeTab === 'servizi'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ servizi.length }} servizi disponibili
          </h2>
        </div>

        <!-- Grid Servizi -->
        <div v-if="servizi.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div 
            v-for="servizio in servizi" 
            :key="servizio.id"
            class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
            @click="goToServizio(servizio)"
          >
            <!-- Header con gradiente -->
            <div class="h-24 bg-gradient-to-r from-[#90c149] to-[#7ba83a] flex items-center justify-center">
              <span class="text-white font-bold text-lg">{{ servizio.categoria }}</span>
            </div>
            
            <!-- Contenuto -->
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-bold text-lg text-gray-900 group-hover:text-[#90c149] transition-colors">
                  {{ servizio.nome }}
                </h3>
                <div class="text-2xl">{{ servizio.icona }}</div>
              </div>
              
              <p v-if="servizio.descrizione_breve" class="text-gray-600 text-sm mb-4">
                {{ servizio.descrizione_breve }}
              </p>
              
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
              
              <button class="w-full bg-[#90c149] text-white py-3 px-4 rounded-lg hover:bg-[#7ba83a] transition-colors font-medium">
                Vedi Dettagli
              </button>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Nessun servizio disponibile</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import HeaderMenu from "@/components/HeaderMenu.vue"
import MotoFilters from "@/components/MotoFilters.vue"

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const concessionario = ref<any>(null)
const motosNuove = ref<any[]>([])
const motoUsate = ref<any[]>([])
const servizi = ref<any[]>([])
const activeTab = ref('motos')

// Filters
const filters = ref({
  categoria: '',
  cilindrata: '',
  marca: '',
  modello: '',
  allestimento: '',
  citta: '' // Disabilitato perché già filtrato per concessionario
})

// Stats per filtri (solo dati del concessionario)
const statsMotos = ref({
  categorie: [],
  cilindrate: [],
  marche: [],
  modelli: [],
  allestimenti: [],
  citta: []
})

// Pagination
const currentPageMotos = ref(1)
const itemsPerPage = 12
const sortBy = ref('marca')

// Computed
const filteredMotosNuove = computed(() => {
  let filtered = [...motosNuove.value]
  
  if (filters.value.categoria) {
    filtered = filtered.filter(m => m.categoria === filters.value.categoria)
  }
  if (filters.value.cilindrata) {
    filtered = filtered.filter(m => {
      const cilindrataNormalizzata = normalizeCilindrata(m.cilindrata, m.modello)
      return cilindrataNormalizzata === parseInt(filters.value.cilindrata)
    })
  }
  if (filters.value.marca) {
    filtered = filtered.filter(m => m.marca === filters.value.marca)
  }
  if (filters.value.modello) {
    filtered = filtered.filter(m => m.modello === filters.value.modello)
  }
  if (filters.value.allestimento) {
    filtered = filtered.filter(m => m.allestimento === filters.value.allestimento)
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

const filteredMotoUsate = computed(() => {
  return motoUsate.value // Per ora senza filtri, si possono aggiungere dopo
})

const totalPagesMotos = computed(() => {
  return Math.ceil(filteredMotosNuove.value.length / itemsPerPage)
})

const paginatedMotosNuove = computed(() => {
  const start = (currentPageMotos.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredMotosNuove.value.slice(start, end)
})

// Methods
const normalizeCilindrata = (cilindrata: number, modello: string = '') => {
  if (!cilindrata && !modello) return null
  
  if (modello) {
    const modelloStr = modello.toString()
    const numeroNelModello = modelloStr.match(/\d+/)
    if (numeroNelModello) {
      const numero = parseInt(numeroNelModello[0])
      if (numero >= 50 && numero <= 2000) {
        return numero
      }
    }
  }
  
  const cc = parseInt(cilindrata?.toString() || '0')
  if (!cc) return null
  
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
  const categories: Record<string, number> = {}
  const cilindrate: Record<string, number> = {}
  const marche: Record<string, number> = {}
  const modelli: Record<string, number> = {}
  const allestimenti: Record<string, number> = {}
  
  motosNuove.value.forEach(moto => {
    if (moto.categoria) {
      categories[moto.categoria] = (categories[moto.categoria] || 0) + 1
    }
    
    const cilindrataNormalizzata = normalizeCilindrata(moto.cilindrata, moto.modello)
    if (cilindrataNormalizzata) {
      cilindrate[cilindrataNormalizzata] = (cilindrate[cilindrataNormalizzata] || 0) + 1
    }
    
    if (moto.marca) {
      marche[moto.marca] = (marche[moto.marca] || 0) + 1
    }
    
    if (moto.modello) {
      modelli[moto.modello] = (modelli[moto.modello] || 0) + 1
    }
    
    if (moto.allestimento) {
      allestimenti[moto.allestimento] = (allestimenti[moto.allestimento] || 0) + 1
    }
  })
  
  statsMotos.value = {
    categorie: Object.entries(categories).map(([name, count]) => ({ name, count })),
    cilindrate: Object.entries(cilindrate).map(([value, count]) => ({ value: parseInt(value), count })),
    marche: Object.entries(marche).map(([name, count]) => ({ name, count })),
    modelli: Object.entries(modelli).map(([name, count]) => ({ name, count })),
    allestimenti: Object.entries(allestimenti).map(([name, count]) => ({ name, count })),
    citta: [] // Non necessario per questa pagina
  }
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
  currentPageMotos.value = 1
}

const goToMoto = (moto: any) => {
  const categoria = moto.categoria?.toLowerCase().replace(/\s+/g, '-') || 'moto'
  const marca = moto.marca?.toLowerCase().replace(/\s+/g, '-') || ''
  const modello = moto.modello?.toLowerCase().replace(/\s+/g, '-') || ''
  const slug = `${marca}-${modello}`
  navigateTo(`/${categoria}/${slug}`)
}

const viewMotoUsata = (moto: any) => {
  navigateTo(`/moto-usate/${moto.id}`)
}

const goToServizio = (servizio: any) => {
  navigateTo(`/servizi/${servizio.slug}`)
}

// Load data
onMounted(async () => {
  try {
    const concessionarioId = route.params.id as string
    
    // Carica info concessionario
    const concessionarioData = await $fetch(`/api/concessionario/${concessionarioId}`)
    concessionario.value = concessionarioData
    
    // Popola i dati del concessionario nelle moto
    const motosData = await $fetch(`/api/concessionario/${concessionarioId}/motos`)
    motosNuove.value = motosData.map((m: any) => ({
      ...m,
      concessionari: [{
        id: concessionarioId,
        _id: concessionarioId,
        nome: concessionarioData.nome,
        citta: concessionarioData.citta,
        provincia: concessionarioData.provincia
      }]
    }))
    
    // Carica moto usate
    try {
      const motoUsateData = await $fetch(`/api/concessionario/${concessionarioId}/moto-usate`)
      motoUsate.value = motoUsateData || []
    } catch (e) {
      console.warn('Nessuna moto usata trovata:', e)
      motoUsate.value = []
    }
    
    // Carica servizi
    try {
      const serviziData = await $fetch(`/api/concessionario/${concessionarioId}/servizi`)
      servizi.value = serviziData || []
    } catch (e) {
      console.warn('Nessun servizio trovato:', e)
      servizi.value = []
    }
    
    calculateStats()
    
  } catch (e: any) {
    console.error('Errore caricamento dati:', e)
    error.value = e.statusMessage || 'Errore nel caricamento dei dati'
  } finally {
    loading.value = false
  }
})

// Watch filters
watch(filters, () => {
  currentPageMotos.value = 1
  calculateStats()
}, { deep: true })
</script>

