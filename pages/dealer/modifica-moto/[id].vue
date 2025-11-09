<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <DealerHeader />

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto"></div>
        <p class="mt-4 text-gray-600">Caricamento moto...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-red-800 mb-2">Errore</h2>
        <p class="text-red-700">{{ error }}</p>
        <NuxtLink 
          to="/dealer/gestisci-moto" 
          class="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Torna alla Gestione Moto
        </NuxtLink>
      </div>

      <!-- Form -->
      <div v-else-if="selectedMoto" class="bg-white rounded-lg shadow p-8">
        <form @submit.prevent="submitForm" class="space-y-8">
          
          <!-- Moto Selezionata (FISSA - NON MODIFICABILE) -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Moto Selezionata</h2>
            <div class="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 class="text-xl font-bold text-green-800 mb-4">Moto da Modificare</h3>
          <div class="flex items-start space-x-6">
            <img 
                  :src="selectedMoto.immagineUrl || 'https://via.placeholder.com/120x90'" 
                  :alt="selectedMoto.marca + ' ' + selectedMoto.modello"
              class="w-32 h-24 object-cover rounded-lg"
            />
            <div class="flex-1">
                  <h4 class="text-2xl font-bold text-green-900 mb-2">
                    {{ selectedMoto.marca }} {{ selectedMoto.modello }}
              </h4>
                  <p v-if="selectedMoto.allestimento" class="text-lg text-green-700 mb-2">
                    {{ selectedMoto.allestimento }}
              </p>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                      <span class="font-medium text-green-800">Categoria:</span>
                      <span class="text-green-700 ml-2">{{ selectedMoto.categoria }}</span>
                    </div>
                    <div>
                      <span class="font-medium text-green-800">Cilindrata:</span>
                      <span class="text-green-700 ml-2">{{ selectedMoto.cilindrata }}cc</span>
                </div>
                <div>
                      <span class="font-medium text-green-800">Prezzo Listino:</span>
                      <span class="text-green-700 ml-2">€{{ selectedMoto.prezzo?.toLocaleString() || 'N/A' }}</span>
                </div>
                <div>
                      <span class="font-medium text-green-800">Peso:</span>
                      <span class="text-green-700 ml-2">{{ selectedMoto.pesoASecco || 'N/A' }} kg</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <!-- Dati del Concessionario (MODIFICABILI) -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">I Tuoi Dati per questa Moto</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Quantità -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantità Disponibile *</label>
                <input 
                  v-model="formData.quantita"
                  type="number" 
                  min="1"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
                  placeholder="Es: 1"
                />
              </div>

              <!-- Colore -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Colore *</label>
                <input 
                  v-model="formData.colore" 
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
                  placeholder="Es: Rosso, Nero, Bianco"
                />
              </div>

              <!-- Prezzo Concessionario -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Prezzo di Vendita *</label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500">€</span>
                <input 
                    v-model="formData.prezzoConcessionario"
                  type="number" 
                    min="0"
                    step="0.01"
                  required
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
                    placeholder="0.00"
                />
                </div>
                <p class="text-xs text-gray-500 mt-1">Prezzo listino: €{{ selectedMoto.prezzo?.toLocaleString() || 'N/A' }}</p>
              </div>

              <!-- Promozioni -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Promozioni Attive</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input 
                      v-model="formData.promozioni"
                      type="checkbox"
                      value="Sconto immediato"
                      class="rounded border-gray-300 text-[#90c149] focus:ring-[#90c149]"
                    />
                    <span class="ml-2 text-sm text-gray-700">Sconto immediato</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="formData.promozioni"
                      type="checkbox"
                      value="Finanziamento agevolato"
                      class="rounded border-gray-300 text-[#90c149] focus:ring-[#90c149]"
                    />
                    <span class="ml-2 text-sm text-gray-700">Finanziamento agevolato</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="formData.promozioni"
                      type="checkbox"
                      value="Accessori inclusi"
                      class="rounded border-gray-300 text-[#90c149] focus:ring-[#90c149]"
                    />
                    <span class="ml-2 text-sm text-gray-700">Accessori inclusi</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="formData.promozioni"
                      type="checkbox"
                      value="Garanzia estesa"
                      class="rounded border-gray-300 text-[#90c149] focus:ring-[#90c149]"
                    />
                    <span class="ml-2 text-sm text-gray-700">Garanzia estesa</span>
                  </label>
                </div>
              </div>

              <!-- Foto Principale -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">URL Foto Principale</label>
                <input 
                  v-model="formData.fotoPrincipale" 
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
                  placeholder="https://esempio.com/foto.jpg"
                />
              </div>

              <!-- Note -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Note Aggiuntive</label>
                <textarea 
                  v-model="formData.note"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
                  placeholder="Condizioni particolari, accessori inclusi, storia del veicolo..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-4 pt-6 border-t">
            <NuxtLink 
              to="/dealer/gestisci-moto" 
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </NuxtLink>
            <button 
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-[#90c149] text-white rounded-md hover:bg-[#7ba83a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Aggiornamento...' : 'Aggiorna Moto' }}
            </button>
          </div>
        </form>
      </div>
      </div>
  </div>
</template>

<script setup>
// Protezione della pagina
definePageMeta({
  middleware: 'dealer',
  layout: false
})

const route = useRoute()
const motoId = route.params.id

const user = ref(null)
const selectedMoto = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref(null)

// Form data
const formData = ref({
  quantita: 1,
  colore: '',
  prezzoConcessionario: '',
  promozioni: [],
  fotoPrincipale: '',
  note: ''
})

// Inizializza Supabase
const supabase = useSupabaseClient()

// Carica i dati della moto
const loadMotoData = async () => {
  try {
    loading.value = true
    error.value = null

    // Aspetta che l'utente sia caricato
    while (!user.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('🔍 Caricamento moto per ID:', motoId)
    console.log('🔍 User ID:', user.value.id)

    // Prima trova il concessionario
    const { data: concessionario, error: dealerError } = await supabase
      .from('concessionari')
      .select('id')
      .eq('user_id', user.value.id)
      .single()

    if (dealerError || !concessionario) {
      throw new Error('Concessionario non trovato')
    }

    console.log('🔍 Concessionario trovato:', concessionario.id)

    // Carica i dati della moto dal catalogo
    const { data: motosFromSupabase, error: motosError } = await supabase
      .from('moto')
      .select('*')

    if (motosError) {
      throw new Error('Errore nel caricamento catalogo moto')
    }

    // Carica i dati specifici del concessionario per questa moto
    const { data: motoConcessionario, error: mcError } = await supabase
      .from('moto_concessionari')
      .select('*')
      .eq('moto_id', motoId)
      .eq('concessionario_id', concessionario.id)
      .single()

    if (mcError || !motoConcessionario) {
      throw new Error('Moto non trovata per questo concessionario')
    }

    // Trova la moto nel catalogo
    const supabaseMoto = motosFromSupabase.find(sm => sm.id === motoId)
    if (!supabaseMoto) {
      throw new Error('Moto non trovata nel catalogo')
    }

    // Combina i dati
    selectedMoto.value = {
      ...supabaseMoto,
      ...motoConcessionario,
      immagineUrl: supabaseMoto.immagine_copertina
    }

    // Popola il form con i dati esistenti
    formData.value = {
      quantita: motoConcessionario.quantita || 1,
      colore: motoConcessionario.colore || '',
      prezzoConcessionario: motoConcessionario.prezzo_speciale || '',
      promozioni: motoConcessionario.promozioni ? JSON.parse(motoConcessionario.promozioni) : [],
      fotoPrincipale: motoConcessionario.foto_principale || '',
      note: motoConcessionario.note || ''
    }

    console.log('✅ Moto caricata:', selectedMoto.value)
    console.log('✅ Form data:', formData.value)

  } catch (err) {
    console.error('❌ Errore nel caricamento moto:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Submit form
const submitForm = async () => {
  console.log('🚀 Submit form chiamato!')
  console.log('User:', user.value)
  console.log('Selected moto:', selectedMoto.value)
  
  if (!user.value) {
    console.log('❌ User non loggato! Devi fare login prima.')
    alert('❌ Devi essere loggato per modificare moto!')
    await navigateTo('/')
    return
  }
  
  if (!selectedMoto.value) {
    console.log('❌ Nessuna moto caricata!')
    alert('❌ Errore nel caricamento della moto!')
    return
  }
  
  console.log('✅ Inizio aggiornamento nel database...')
  submitting.value = true
  
  try {
    // Prepara i dati per l'aggiornamento
    const motoData = {
      prezzo_speciale: formData.value.prezzoConcessionario,
      quantita: formData.value.quantita,
      colore: formData.value.colore,
      promozioni: JSON.stringify(formData.value.promozioni),
      foto_principale: formData.value.fotoPrincipale,
      foto_gallery: JSON.stringify([]),
      note: formData.value.note
    }
    
    console.log('📝 Dati da aggiornare:', motoData)
    console.log('📝 Moto ID:', motoId)
    
    // Usa l'endpoint API server-side per bypassare RLS
    const response = await $fetch('/api/dealer/update-moto', {
      method: 'POST',
      body: {
        motoId: motoId,
        userId: user.value.id,
        motoData: motoData
      }
    })

    console.log('✅ Risposta API aggiornamento:', response)

    console.log('✅ Aggiornamento completato con successo!')
    
    // Success message
    alert('✅ Moto aggiornata con successo!')
    
    // Redirect to gestisci moto
    console.log('🔄 Redirect a gestisci-moto...')
    await navigateTo('/dealer/gestisci-moto')
    
  } catch (error) {
    console.error('❌ Errore nell\'aggiornamento della moto:', error)
    alert('Errore nell\'aggiornamento della moto. Riprova.')
  } finally {
    console.log('🏁 Form completato, submitting = false')
    submitting.value = false
  }
}

// Carica i dati al mount
onMounted(async () => {
  // Aspetta che l'utente sia caricato
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  
  if (!user.value) {
      await navigateTo('/auth/login')
      return
    }
    
    await loadMotoData()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
