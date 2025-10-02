<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/dealer/dashboard" class="flex items-center">
              <img 
                src="https://prontomoto.it/wp-content/uploads/2025/06/Risorsa-12.svg" 
                alt="ProntoMoto Logo" 
                class="h-8 w-auto"
              />
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <div class="flex items-center space-x-4">
            <NuxtLink to="/dealer/dashboard" class="text-gray-600 hover:text-[#90c149] text-sm font-medium">
              ← Torna alla Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Aggiungi Nuova Moto</h1>
        <p class="text-gray-600 mt-2">Inserisci i dettagli della moto che vuoi mettere in vendita</p>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow p-8">
        <form @submit.prevent="submitForm" class="space-y-8">
          
          <!-- Selezione Moto dal Catalogo -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Seleziona Moto dal Catalogo</h2>
            <div class="space-y-4">
              
              <!-- Filtro di ricerca -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cerca Moto</label>
                <input 
                  v-model="searchQuery" 
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                  placeholder="Cerca per marca, modello..."
                  @input="filterMotos"
                />
              </div>

              <!-- Lista Moto -->
              <div v-if="filteredMotos.length > 0" class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <div 
                  v-for="moto in filteredMotos" 
                  :key="moto._id"
                  @click="selectMoto(moto)"
                  :class="[
                    'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
                    selectedMoto?._id === moto._id ? 'bg-[#90c149] bg-opacity-10 border-[#90c149]' : ''
                  ]"
                >
                  <div class="flex items-center space-x-4">
                    <img 
                      :src="moto.immagineUrl || 'https://via.placeholder.com/80x60'" 
                      :alt="moto.marca + ' ' + moto.modello"
                      class="w-16 h-12 object-cover rounded"
                    />
                    <div class="flex-1">
                      <h3 class="font-medium text-gray-900">{{ moto.marca }} {{ moto.modello }}</h3>
                      <p class="text-sm text-gray-500">{{ moto.categoria }} • {{ moto.cilindrata }}cc</p>
                      <p v-if="moto.allestimento" class="text-sm text-gray-500">{{ moto.allestimento }}</p>
                    </div>
                    <div class="text-sm text-gray-500">
                      €{{ moto.prezzo?.toLocaleString() || 'N/A' }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                <p>Nessuna moto trovata</p>
              </div>

            </div>
          </div>

          <!-- Dati del Concessionario -->
          <div v-if="selectedMoto">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">I Tuoi Dati per questa Moto</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Quantità -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantità Disponibile *</label>
                <input 
                  v-model.number="formData.quantita" 
                  type="number" 
                  required
                  min="1"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                  placeholder="es. 2"
                />
              </div>

              <!-- Colore -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Colore *</label>
                <input 
                  v-model="formData.colore" 
                  type="text" 
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                  placeholder="es. Rosso, Nero, Bianco"
                />
              </div>

              <!-- Prezzo del Concessionario -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Il Tuo Prezzo (€) *</label>
                <input 
                  v-model.number="formData.prezzoConcessionario" 
                  type="number" 
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                  placeholder="es. 11500"
                />
                <p class="text-xs text-gray-500 mt-1">Prezzo di listino: €{{ selectedMoto.prezzo?.toLocaleString() || 'N/A' }}</p>
              </div>

              <!-- Promozioni -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Promozioni</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input 
                      v-model="formData.promozioni.bollaInclusa" 
                      type="checkbox"
                      class="rounded border-gray-300 text-[#90c149] focus:ring-[#90c149]"
                    />
                    <span class="ml-2 text-sm text-gray-700">Bolla inclusa</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="formData.promozioni.messaSuStrada" 
                      type="checkbox"
                      class="rounded border-gray-300 text-[#90c149] focus:ring-[#90c149]"
                    />
                    <span class="ml-2 text-sm text-gray-700">Messa su strada gratis</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="formData.promozioni.garanziaEstesa" 
                      type="checkbox"
                      class="rounded border-gray-300 text-[#90c149] focus:ring-[#90c149]"
                    />
                    <span class="ml-2 text-sm text-gray-700">Garanzia estesa 2 anni</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="formData.promozioni.primaRevisione" 
                      type="checkbox"
                      class="rounded border-gray-300 text-[#90c149] focus:ring-[#90c149]"
                    />
                    <span class="ml-2 text-sm text-gray-700">Prima revisione gratis</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="formData.promozioni.assicurazioneScontata" 
                      type="checkbox"
                      class="rounded border-gray-300 text-[#90c149] focus:ring-[#90c149]"
                    />
                    <span class="ml-2 text-sm text-gray-700">Assicurazione scontata</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          <!-- Foto del Concessionario (Opzionali) -->
          <div v-if="selectedMoto">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Le Tue Foto (Opzionali)</h2>
            <div class="space-y-4">
              
              <!-- Foto Principale -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Foto Principale</label>
                <input 
                  v-model="formData.fotoPrincipale" 
                  type="url"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                  placeholder="https://esempio.com/tua-foto.jpg"
                />
                <p class="text-xs text-gray-500 mt-1">Aggiungi la tua foto se vuoi (opzionale)</p>
              </div>

              <!-- Galleria Foto -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Galleria Foto</label>
                <div class="space-y-2">
                  <div v-for="(url, index) in formData.fotoGallery" :key="index" class="flex gap-2">
                    <input 
                      v-model="formData.fotoGallery[index]" 
                      type="url"
                      class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                      :placeholder="`Foto ${index + 1}`"
                    />
                    <button 
                      type="button"
                      @click="removeFoto(index)"
                      class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                  <button 
                    type="button"
                    @click="addFoto"
                    class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#90c149] hover:text-[#90c149]"
                  >
                    + Aggiungi Foto
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Aggiungi le tue foto se vuoi (opzionale)</p>
              </div>

            </div>
          </div>

          <!-- Note -->
          <div v-if="selectedMoto">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Note Aggiuntive</h2>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Note per i Clienti</label>
              <textarea 
                v-model="formData.note" 
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                placeholder="Note aggiuntive, condizioni speciali, etc..."
              ></textarea>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <NuxtLink 
              to="/dealer/dashboard"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </NuxtLink>
            <button 
              type="submit"
              :disabled="loading"
              class="px-6 py-3 bg-[#90c149] text-white rounded-lg hover:bg-[#7ba83a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Salvataggio...</span>
              <span v-else>Aggiungi Moto</span>
            </button>
          </div>

        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
// Questo middleware protegge la pagina - solo concessionari autenticati possono accedere
definePageMeta({
  middleware: 'auth',
  layout: false
})

const { user } = useSupabaseUser()
const loading = ref(false)

// Moto data
const motos = ref([])
const filteredMotos = ref([])
const selectedMoto = ref(null)
const searchQuery = ref('')

// Form data
const formData = ref({
  quantita: 1,
  colore: '',
  prezzoConcessionario: null,
  promozioni: {
    bollaInclusa: false,
    messaSuStrada: false,
    garanziaEstesa: false,
    primaRevisione: false,
    assicurazioneScontata: false
  },
  fotoPrincipale: '',
  fotoGallery: [''],
  note: ''
})

// Load motos from API
const loadMotos = async () => {
  try {
    console.log('Caricamento moto...')
    const data = await $fetch('/api/motos')
    console.log('Moto caricate:', data)
    motos.value = data
    filteredMotos.value = data
  } catch (error) {
    console.error('Errore nel caricamento delle moto:', error)
  }
}

// Filter motos
const filterMotos = () => {
  if (!searchQuery.value) {
    filteredMotos.value = motos.value
    return
  }
  
  const query = searchQuery.value.toLowerCase()
  filteredMotos.value = motos.value.filter(moto => 
    moto.marca.toLowerCase().includes(query) ||
    moto.modello.toLowerCase().includes(query) ||
    moto.categoria.toLowerCase().includes(query)
  )
}

// Select moto
const selectMoto = (moto) => {
  selectedMoto.value = moto
  // Pre-fill some data
  formData.value.prezzoConcessionario = moto.prezzo
}

// Add foto
const addFoto = () => {
  formData.value.fotoGallery.push('')
}

// Remove foto
const removeFoto = (index) => {
  formData.value.fotoGallery.splice(index, 1)
}

// Submit form
const submitForm = async () => {
  if (!user.value || !selectedMoto.value) return
  
  loading.value = true
  
  try {
    // Aggiungi la relazione in Supabase
    const { data, error } = await useSupabase()
      .from('moto_concessionari')
      .insert({
        moto_id: selectedMoto.value._id,
        concessionario_id: user.value.id,
        disponibile: true,
        prezzo_speciale: formData.value.prezzoConcessionario,
        quantita: formData.value.quantita,
        colore: formData.value.colore,
        promozioni: JSON.stringify(formData.value.promozioni),
        foto_principale: formData.value.fotoPrincipale,
        foto_gallery: JSON.stringify(formData.value.fotoGallery.filter(url => url.trim())),
        note: formData.value.note
      })
    
    if (error) throw error
    
    // Success message
    alert('✅ Moto aggiunta con successo!')
    
    // Redirect to gestisci moto
    await navigateTo('/dealer/gestisci-moto')
    
  } catch (error) {
    console.error('Errore nell\'aggiunta della moto:', error)
    alert('Errore nell\'aggiunta della moto. Riprova.')
  } finally {
    loading.value = false
  }
}

// Load motos on mount
onMounted(() => {
  loadMotos()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
