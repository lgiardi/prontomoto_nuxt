<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/dealer/gestisci-moto" class="flex items-center text-gray-700 hover:text-[#90c149]">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span class="font-medium">Torna a Gestisci Moto</span>
            </NuxtLink>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-600">
              Benvenuto, <span class="font-medium">{{ dealerData?.nome }}</span>
            </div>
            <button 
              @click="handleLogout"
              class="text-gray-500 hover:text-gray-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Modifica Moto</h1>
        <p class="text-gray-600 mt-2">Modifica i dettagli della moto in vendita</p>
      </div>

      <div v-if="loading" class="text-center py-10">
        <svg class="animate-spin h-8 w-8 text-[#90c149] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-3 text-gray-600">Caricamento moto...</p>
      </div>

      <div v-else-if="motoData" class="bg-white rounded-lg shadow p-8">
        <!-- Moto Info -->
        <div class="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="text-xl font-bold text-blue-800 mb-4">Moto da Modificare</h3>
          <div class="flex items-start space-x-6">
            <img 
              :src="motoData.immagineUrl || 'https://via.placeholder.com/120x90'" 
              :alt="motoData.marca + ' ' + motoData.modello"
              class="w-32 h-24 object-cover rounded-lg"
            />
            <div class="flex-1">
              <h4 class="text-2xl font-bold text-blue-900 mb-2">
                {{ motoData.marca }} {{ motoData.modello }}
              </h4>
              <p v-if="motoData.allestimento" class="text-lg text-blue-700 mb-2">
                {{ motoData.allestimento }}
              </p>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-blue-800">Categoria:</span>
                  <span class="text-blue-700 ml-2">{{ motoData.categoria }}</span>
                </div>
                <div>
                  <span class="font-medium text-blue-800">Cilindrata:</span>
                  <span class="text-blue-700 ml-2">{{ motoData.cilindrata }}cc</span>
                </div>
                <div>
                  <span class="font-medium text-blue-800">Prezzo Listino:</span>
                  <span class="text-blue-700 ml-2">€{{ motoData.prezzo?.toLocaleString() || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="updateMoto" class="space-y-8">
          <!-- Dati del Concessionario -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Dati del Concessionario</h2>
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
                <p class="text-xs text-gray-500 mt-1">Prezzo di listino: €{{ motoData.prezzo?.toLocaleString() || 'N/A' }}</p>
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

              <!-- Foto del Concessionario (Opzionali) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Foto Principale (URL)</label>
                <input 
                  v-model="formData.fotoPrincipale" 
                  type="url"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                  placeholder="https://esempio.com/foto.jpg"
                />
              </div>

              <!-- Note -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Note Aggiuntive</label>
                <textarea 
                  v-model="formData.note"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent resize-none"
                  placeholder="Note aggiuntive sulla moto..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-4">
            <NuxtLink to="/dealer/gestisci-moto" class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Annulla
            </NuxtLink>
            <button 
              type="submit"
              :disabled="loading"
              class="px-6 py-3 bg-[#90c149] text-white rounded-lg hover:bg-[#7ba83a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Salvando...' : 'Salva Modifiche' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else class="bg-white rounded-lg shadow p-8 text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Moto non trovata</h3>
        <p class="text-gray-600 mb-6">La moto che stai cercando di modificare non esiste o non hai i permessi per modificarla.</p>
        <NuxtLink to="/dealer/gestisci-moto" class="bg-[#90c149] text-white px-6 py-3 rounded-md hover:bg-[#7ba83a] transition-colors inline-block">
          Torna a Gestisci Moto
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: false
})

// Inizializza Supabase
const supabase = useSupabaseClient()
const route = useRoute()
const dealerData = ref(null)
const motoData = ref(null)
const loading = ref(true)
const user = ref(null)

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
  note: ''
})

// Carica i dati del concessionario
const loadDealerData = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('concessionari')
      .select('nome')
      .eq('id', user.value.id)
      .single()

    if (error) throw error
    dealerData.value = data
  } catch (error) {
    console.error('Errore nel caricamento dati concessionario:', error)
  }
}

// Carica i dati della moto
const loadMotoData = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    const motoId = route.params.id
    
    console.log('🔍 Caricamento moto per modifica:', motoId)
    
    // 1. Recupera la relazione moto_concessionari
    const { data: motoConcessionario, error: mcError } = await supabase
      .from('moto_concessionari')
      .select('*')
      .eq('id', motoId)
      .eq('concessionario_id', user.value.id)
      .single()

    if (mcError) {
      console.error('❌ Errore nel caricamento moto_concessionari:', mcError)
      throw mcError
    }

    console.log('📊 Moto concessionario trovata:', motoConcessionario)

    // 2. Recupera i dettagli della moto da Sanity
    const motosFromSanity = await $fetch('/api/motos', {
      method: 'GET',
      query: { 
        ids: motoConcessionario.moto_id
      }
    })

    console.log('📊 Moto da Sanity:', motosFromSanity)

    if (motosFromSanity.length === 0) {
      throw new Error('Moto non trovata in Sanity')
    }

    // 3. Combina i dati
    motoData.value = {
      ...motosFromSanity[0], // Dati da Sanity
      ...motoConcessionario // Dati specifici del concessionario
    }

    // 4. Popola il form con i dati esistenti
    formData.value = {
      quantita: motoConcessionario.quantita || 1,
      colore: motoConcessionario.colore || '',
      prezzoConcessionario: motoConcessionario.prezzo_speciale || null,
      promozioni: motoConcessionario.promozioni || {
        bollaInclusa: false,
        messaSuStrada: false,
        garanziaEstesa: false,
        primaRevisione: false,
        assicurazioneScontata: false
      },
      fotoPrincipale: motoConcessionario.foto_principale || '',
      note: motoConcessionario.note || ''
    }

    console.log('✅ Moto caricata per modifica:', motoData.value)
    console.log('📝 Form data popolato:', formData.value)

  } catch (error) {
    console.error('❌ Errore nel caricamento della moto:', error)
    alert('Errore nel caricamento della moto. Riprova.')
  } finally {
    loading.value = false
  }
}

// Aggiorna la moto
const updateMoto = async () => {
  try {
    loading.value = true
    console.log('🚀 Aggiornamento moto...')
    
    const { error } = await supabase
      .from('moto_concessionari')
      .update({
        prezzo_speciale: formData.value.prezzoConcessionario,
        quantita: formData.value.quantita,
        colore: formData.value.colore,
        promozioni: JSON.stringify(formData.value.promozioni),
        foto_principale: formData.value.fotoPrincipale,
        note: formData.value.note
      })
      .eq('id', route.params.id)
      .eq('concessionario_id', user.value.id)

    if (error) {
      console.error('❌ Errore nell\'aggiornamento:', error)
      throw error
    }

    console.log('✅ Moto aggiornata con successo!')
    alert('✅ Moto aggiornata con successo!')
    
    // Redirect a gestisci moto
    await navigateTo('/dealer/gestisci-moto')
    
  } catch (error) {
    console.error('❌ Errore nell\'aggiornamento della moto:', error)
    alert('Errore nell\'aggiornamento della moto. Riprova.')
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    await navigateTo('/')
  } catch (error) {
    console.error('Errore durante il logout:', error)
  }
}

onMounted(async () => {
  try {
    console.log('🚀 Inizio caricamento modifica-moto...')
    
    // Carica l'utente
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (session && session.user) {
      user.value = session.user
      console.log('👤 User caricato da sessione:', user.value)
      
      await loadDealerData()
      await loadMotoData()
      return
    }
    
    // Se non c'è sessione, prova con getUser
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Errore nel caricamento utente:', userError)
      alert('Errore nel caricamento utente. Ricarica la pagina.')
      return
    }
    
    if (!currentUser) {
      console.log('❌ Nessun utente trovato, redirect a login')
      await navigateTo('/auth/login')
      return
    }
    
    user.value = currentUser
    console.log('👤 User caricato da getUser:', user.value)
    
    await loadDealerData()
    await loadMotoData()
  } catch (error) {
    console.error('❌ Errore generale in modifica-moto:', error)
    alert('Errore nel caricamento. Ricarica la pagina.')
  }
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
