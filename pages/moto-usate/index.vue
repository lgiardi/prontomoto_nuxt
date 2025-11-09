<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <HeaderMenu />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Moto Usate</h1>
        <p class="text-xl text-gray-600">Trova la moto usata perfetta per te</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Filtri</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          <!-- Marca -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Marca</label>
            <select 
              v-model="filters.marca" 
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
            >
              <option value="">Tutte le marche</option>
              <option v-for="marca in marche" :key="marca" :value="marca">{{ marca }}</option>
            </select>
          </div>

          <!-- Categoria -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select 
              v-model="filters.categoria" 
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
            >
              <option value="">Tutte le categorie</option>
              <option value="sportive">Sportive</option>
              <option value="naked">Naked</option>
              <option value="enduro-stradale">Enduro Stradale</option>
              <option value="turismo">Turismo</option>
              <option value="scooter-ruote-alte">Scooter Ruote Alte</option>
              <option value="scooter-ruote-basse">Scooter Ruote Basse</option>
            </select>
          </div>

          <!-- Città -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Città</label>
            <select 
              v-model="filters.citta" 
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
            >
              <option value="">Tutte le città</option>
              <option v-for="citta in cittaDisponibili" :key="citta" :value="citta">{{ citta }}</option>
            </select>
          </div>

          <!-- Prezzo Max -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prezzo Max (€)</label>
            <input 
              v-model="filters.prezzoMax" 
              @input="applyFilters"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="Es: 10000"
            />
          </div>

          <!-- Anno Min -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Anno Min</label>
            <input 
              v-model="filters.annoMin" 
              @input="applyFilters"
              type="number"
              :min="1900"
              :max="new Date().getFullYear()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="Es: 2015"
            />
          </div>
        </div>

        <!-- Reset Filters -->
        <div class="mt-4">
          <button
            @click="resetFilters"
            class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset Filtri
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto"></div>
        <p class="mt-4 text-gray-600">Caricamento moto usate...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-red-800 mb-2">Errore</h2>
        <p class="text-red-700">{{ error }}</p>
        <button 
          @click="loadMotoUsate"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Riprova
        </button>
      </div>

      <!-- Results -->
      <div v-else>
        <!-- Results Count -->
        <div class="mb-6">
          <p class="text-gray-600">
            Trovate <span class="font-semibold">{{ filteredMotoUsate.length }}</span> moto usate
          </p>
        </div>

        <!-- No Results -->
        <div v-if="filteredMotoUsate.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Nessuna moto trovata</h3>
          <p class="text-gray-500">Prova a modificare i filtri di ricerca</p>
        </div>

        <!-- Moto Usate Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="moto in filteredMotoUsate" 
            :key="moto.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewMotoDetail(moto)"
          >
            <!-- Immagine -->
            <div class="h-48 bg-gray-200 relative">
              <img 
                :src="moto.immagine_copertina || 'https://via.placeholder.com/300x200?text=' + moto.marca + '+' + moto.modello" 
                :alt="moto.marca + ' ' + moto.modello"
                class="w-full h-full object-cover"
              />
              <!-- Venditore Badge - Solo concessionari possono pubblicare -->
              <div class="absolute top-2 left-2">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                >
                  Concessionario
                </span>
              </div>
            </div>

            <!-- Contenuto -->
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                {{ moto.marca }} {{ moto.modello }}
              </h3>
              
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span>Anno:</span>
                  <span class="font-medium">{{ moto.anno }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Km:</span>
                  <span class="font-medium">{{ moto.km?.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Condizione:</span>
                  <span class="font-medium capitalize">{{ moto.condizione }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Prezzo:</span>
                  <span class="font-bold text-[#90c149] text-lg">€{{ moto.prezzo?.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Descrizione -->
              <div v-if="moto.descrizione" class="mt-3">
                <p class="text-sm text-gray-600 line-clamp-2">{{ moto.descrizione }}</p>
              </div>

              <!-- Azioni -->
              <div class="mt-4 flex space-x-2">
                <button
                  @click.stop="contactSeller(moto)"
                  class="flex-1 px-3 py-2 text-sm bg-[#90c149] text-white rounded-md hover:bg-[#7ba83a] transition-colors"
                >
                  Contatta
                </button>
                <button
                  @click.stop="viewMotoDetail(moto)"
                  class="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Dettagli
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
const motoUsate = ref([])
const filteredMotoUsate = ref([])
const marche = ref([])
const cittaDisponibili = ref([])
const loading = ref(true)
const error = ref(null)

// Filtri
const filters = ref({
  marca: '',
  categoria: '',
  citta: '',
  prezzoMax: '',
  annoMin: ''
})

// Carica le moto usate
const loadMotoUsate = async () => {
  try {
    loading.value = true
    error.value = null

    // Carica solo le moto approvate con informazioni venditore
    const { data } = await $fetch('/api/moto-usate?approved_only=true')
    motoUsate.value = data || []
    filteredMotoUsate.value = data || []

    // Estrai le marche uniche
    const marcheUniche = [...new Set(data?.map(moto => moto.marca).filter(Boolean) || [])]
    marche.value = marcheUniche.sort()

    // Estrai le città uniche dalle moto (dal concessionario o privato)
    // Le città vengono recuperate dall'API che le prende dai concessionari o dai venditori privati
    console.log('🔍 Debug - Analisi dati moto per città:')
    console.log('   Totale moto ricevute:', data?.length || 0)
    
    const tutteLeCitta = data?.map(moto => {
      // La città viene dal campo venditore_citta che viene popolato dai concessionari o privati
      const citta = moto.venditore_citta || moto.citta
      if (!citta) {
        console.warn(`   ⚠️ Moto ${moto.id} (${moto.marca} ${moto.modello}) senza città:`, {
          venditore_type: moto.venditore_type,
          venditore_id: moto.venditore_id,
          venditore_citta: moto.venditore_citta,
          citta: moto.citta,
          hasVenditore: !!moto.venditore
        })
      }
      return citta
      }).filter(Boolean) || []
    
    console.log('   Città estratte (con duplicati):', tutteLeCitta)
    
    const cittaUniche = [...new Set(tutteLeCitta)]
    cittaDisponibili.value = cittaUniche.sort()
    
    console.log('🏙️ Città disponibili per filtri:', cittaDisponibili.value)
    console.log('📊 Totale moto:', data?.length || 0, '| Totale città uniche:', cittaUniche.length)
    
    if (cittaUniche.length === 0) {
      console.error('❌ Nessuna città trovata nelle moto usate!')
      console.log('🔍 Esempio dati moto complete:', data?.slice(0, 2).map(m => ({
        id: m.id,
        marca: m.marca,
        modello: m.modello,
        venditore_type: m.venditore_type,
        venditore_id: m.venditore_id,
        venditore_citta: m.venditore_citta,
        citta: m.citta,
        allKeys: Object.keys(m)
      })))
    } else {
      console.log('✅ Città trovate e aggiunte al filtro:', cittaUniche)
    }

  } catch (err) {
    console.error('Errore nel caricamento moto usate:', err)
    error.value = 'Errore nel caricamento delle moto usate'
  } finally {
    loading.value = false
  }
}

// Applica filtri
const applyFilters = () => {
  let filtered = [...motoUsate.value]

  if (filters.value.marca) {
    filtered = filtered.filter(moto => moto.marca === filters.value.marca)
  }

  if (filters.value.categoria) {
    filtered = filtered.filter(moto => moto.categoria === filters.value.categoria)
  }

  if (filters.value.citta) {
    filtered = filtered.filter(moto => {
      // La città viene sempre da concessionari.citta (popolata nell'API)
      const motoCitta = moto.venditore_citta || moto.citta
      return motoCitta?.toLowerCase() === filters.value.citta.toLowerCase()
    })
  }

  if (filters.value.prezzoMax) {
    filtered = filtered.filter(moto => moto.prezzo <= parseFloat(filters.value.prezzoMax))
  }

  if (filters.value.annoMin) {
    filtered = filtered.filter(moto => moto.anno >= parseInt(filters.value.annoMin))
  }

  filteredMotoUsate.value = filtered
}

// Reset filtri
const resetFilters = () => {
  filters.value = {
    marca: '',
    categoria: '',
    citta: '',
    prezzoMax: '',
    annoMin: ''
  }
  filteredMotoUsate.value = motoUsate.value
}

// Funzione per creare slug da marca e modello (formato marca/modello)
// DEVE essere identica alla normalizzazione nel backend
function normalizeSlug(str) {
  if (!str) return ''
  return str.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')  // Spazi diventano trattini
    .replace(/[^a-z0-9-]/g, '')  // Rimuovi tutto tranne lettere, numeri e trattini
    .replace(/-+/g, '-')  // Sostituisci più trattini con uno solo
    .replace(/^-|-$/g, '')  // Rimuovi trattini all'inizio e alla fine
}

function createMarcaSlug(marca) {
  return normalizeSlug(marca)
}

function createModelloSlug(modello) {
  return normalizeSlug(modello)
}

// Azioni
const viewMotoDetail = (moto) => {
  console.log('🔍 Apertura dettaglio moto:', {
    id: moto.id,
    marca: moto.marca,
    modello: moto.modello
  })
  const marcaSlug = createMarcaSlug(moto.marca)
  const modelloSlug = createModelloSlug(moto.modello)
  const url = `/moto-usate/${marcaSlug}/${modelloSlug}`
  console.log('📍 Navigazione a:', url)
  navigateTo(url).then(() => {
    console.log('✅ Navigazione completata')
  }).catch(err => {
    console.error('❌ Errore navigazione:', err)
  })
}

const contactSeller = (moto) => {
  // Naviga alla pagina dettaglio dove si può contattare usando marca/modello
  const marcaSlug = createMarcaSlug(moto.marca)
  const modelloSlug = createModelloSlug(moto.modello)
  navigateTo(`/moto-usate/${marcaSlug}/${modelloSlug}`)
}

// Carica i dati al mount
onMounted(() => {
  loadMotoUsate()
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
