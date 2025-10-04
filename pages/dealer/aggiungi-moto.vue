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

              <!-- Moto Selezionata -->
              <div v-if="selectedMoto" class="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 class="text-xl font-bold text-green-800 mb-4">Moto Selezionata</h3>
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
                <select 
                  v-model="formData.colore" 
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                >
                  <option value="">Seleziona un colore</option>
                  <option value="Nero">Nero</option>
                  <option value="Bianco">Bianco</option>
                  <option value="Rosso">Rosso</option>
                  <option value="Blu">Blu</option>
                  <option value="Verde">Verde</option>
                  <option value="Giallo">Giallo</option>
                  <option value="Arancione">Arancione</option>
                  <option value="Grigio">Grigio</option>
                  <option value="Argento">Argento</option>
                  <option value="Oro">Oro</option>
                </select>
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

const loading = ref(false)
const user = ref(null)

// Inizializza Supabase
const supabase = useSupabaseClient()

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
  note: '',
  // Offerte di finanziamento
  tassoInteresse: null,
  durataMesi: null,
  anticipoPercentuale: null,
  offerteFinanziamento: {
    tassoZero: false,
    anticipoRidotto: false,
    estinzioneAnticipata: false,
    primaRataDifferita: false
  }
})

// Load motos from API
const loadMotos = async () => {
  try {
    console.log('🚀 Caricamento moto...')
    const data = await $fetch('/api/motos')
    console.log('✅ Moto caricate:', data)
    console.log('📊 Numero moto:', data.length)
    motos.value = data
    filteredMotos.value = data
    console.log('✅ Moto salvate in motos.value:', motos.value.length)
  } catch (error) {
    console.error('❌ Errore nel caricamento delle moto:', error)
    alert('Errore nel caricamento delle moto. Ricarica la pagina.')
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
  console.log('🚀 Submit form chiamato!')
  console.log('User:', user.value)
  console.log('Selected moto:', selectedMoto.value)
  
  if (!user.value) {
    console.log('❌ User non loggato! Devi fare login prima.')
    alert('❌ Devi essere loggato per aggiungere moto!')
    await navigateTo('/')
    return
  }
  
  if (!selectedMoto.value) {
    console.log('❌ Nessuna moto selezionata!')
    alert('❌ Seleziona una moto dal catalogo!')
    return
  }
  
  console.log('✅ Inizio inserimento nel database...')
  loading.value = true
  
  try {
    // Prima controlla se l'utente esiste nella tabella concessionari
    const { data: dealerCheck, error: dealerError } = await supabase
      .from('concessionari')
      .select('id')
      .eq('id', user.value.id)
      .single()

    if (dealerError && dealerError.code === 'PGRST116') {
      console.log('🔄 Utente non trovato nella tabella concessionari, creazione...')
      const { data: newDealer, error: insertError } = await supabase
        .from('concessionari')
        .insert({
          id: user.value.id,
          nome: user.value.user_metadata?.nome || user.value.email?.split('@')[0] || 'Concessionario',
          email: user.value.email,
          telefono: user.value.user_metadata?.telefono || null,
          citta: user.value.user_metadata?.citta || 'Milano',
          provincia: user.value.user_metadata?.provincia || 'MI',
          indirizzo: user.value.user_metadata?.indirizzo || null,
          cap: user.value.user_metadata?.cap || null,
          tipo: 'concessionario'
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Errore nella creazione del concessionario:', insertError)
        throw insertError
      }
      
      console.log('✅ Concessionario creato:', newDealer)
    }
    
    // Aggiungi la relazione in Supabase - ora con tutti i campi
    const insertData = {
      moto_id: selectedMoto.value._id,
      concessionario_id: user.value.id,
      disponibile: true,
      prezzo_speciale: formData.value.prezzoConcessionario,
      quantita: formData.value.quantita,
      colore: formData.value.colore,
      promozioni: JSON.stringify(formData.value.promozioni),
      foto_principale: formData.value.fotoPrincipale,
      foto_gallery: JSON.stringify(formData.value.fotoGallery.filter(url => url.trim())),
      note: formData.value.note,
      // Offerte di finanziamento
      tasso_interesse: formData.value.tassoInteresse,
      durata_mesi: formData.value.durataMesi,
      anticipo_percentuale: formData.value.anticipoPercentuale,
      offerte_finanziamento: JSON.stringify(formData.value.offerteFinanziamento)
    }
    
    console.log('📝 Dati da inserire:', insertData)
    console.log('📝 Moto ID:', selectedMoto.value._id)
    console.log('📝 User ID:', user.value.id)
    console.log('📝 Prezzo:', formData.value.prezzoConcessionario)
    console.log('📝 Quantità:', formData.value.quantita)
    console.log('📝 Colore:', formData.value.colore)
    console.log('📝 Promozioni:', formData.value.promozioni)
    console.log('📝 Foto principale:', formData.value.fotoPrincipale)
    console.log('📝 Foto gallery:', formData.value.fotoGallery)
    console.log('📝 Note:', formData.value.note)
    
    const { data, error } = await supabase
      .from('moto_concessionari')
      .insert(insertData)
    
    if (error) {
      console.error('❌ Errore Supabase:', error)
      console.error('❌ Error details:', error.details)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error hint:', error.hint)
      throw error
    }
    
    console.log('✅ Inserimento completato con successo!')
    console.log('📊 Data ricevuta:', data)
    
    // Success message
    alert('✅ Moto aggiunta con successo!')
    
    // Redirect to gestisci moto
    console.log('🔄 Redirect a gestisci-moto...')
    await navigateTo('/dealer/gestisci-moto')
    
  } catch (error) {
    console.error('❌ Errore nell\'aggiunta della moto:', error)
    alert('Errore nell\'aggiunta della moto. Riprova.')
  } finally {
    console.log('🏁 Form completato, loading = false')
    loading.value = false
  }
}

// Load user and motos on mount
onMounted(async () => {
  try {
    console.log('🚀 Inizio caricamento pagina...')
    
    // Prova prima con getSession
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('📊 Sessione ricevuta:', session)
    console.log('❌ Errore sessione:', sessionError)
    
    if (session && session.user) {
      user.value = session.user
      console.log('👤 User caricato da sessione:', user.value)
      console.log('✅ User ID:', user.value?.id)
      
      // Carica le moto
      await loadMotos()
      return
    }
    
    // Se non c'è sessione, prova con getUser
    console.log('🔄 Tentativo con getUser...')
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
    console.log('👤 User da getUser:', currentUser)
    console.log('❌ Errore getUser:', userError)
    
    if (userError) {
      console.error('❌ Errore nel caricamento utente:', userError)
      alert('Errore nel caricamento utente. Ricarica la pagina.')
      return
    }
    
    if (!currentUser) {
      console.log('❌ Nessun utente trovato, redirect a login')
      alert('❌ Devi essere loggato per aggiungere moto!')
      await navigateTo('/auth/login')
      return
    }
    
    user.value = currentUser
    console.log('👤 User caricato da getUser:', user.value)
    console.log('✅ User ID:', user.value?.id)
    
    // Carica le moto
    await loadMotos()
  } catch (error) {
    console.error('❌ Errore generale:', error)
    console.error('❌ Stack trace:', error.stack)
    console.error('❌ Error message:', error.message)
    alert('Errore nel caricamento. Ricarica la pagina.')
  }
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
