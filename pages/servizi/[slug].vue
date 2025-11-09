<template>
  <div class="min-h-screen w-full bg-white font-sans text-black">
    <HeaderMenu />

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
      <div class="text-lg text-gray-600">Caricamento servizio...</div>
    </div>

    <div v-else-if="servizio" class="w-full">
      <!-- Servizio Header -->
      <div class="w-full bg-white px-4 py-6">
        <div class="text-center mb-6">
          <div class="flex items-center justify-center gap-3 mb-4">
            <span class="text-5xl">{{ servizio.servizi_catalogo.icona }}</span>
            <div>
              <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
                {{ servizio.servizi_catalogo.nome }}
              </h1>
              <span class="bg-[#90c149] text-white px-3 py-1 rounded-full text-sm font-medium">
                {{ servizio.servizi_catalogo.categoria }}
              </span>
            </div>
          </div>
          
          <!-- Prezzo Range -->
          <div class="text-3xl md:text-4xl font-bold text-[#90c149] mb-4">
            €{{ servizio.prezzo_da }}
            <span v-if="servizio.prezzo_a" class="text-xl text-gray-500">
              - €{{ servizio.prezzo_a }}
            </span>
          </div>
          
          <div v-if="servizio.durata_minuti" class="text-lg text-gray-600 mb-4">
            Durata: {{ servizio.durata_minuti }} minuti
          </div>
        </div>

        <!-- Filtro Città - DROPDOWN (come moto nuove) -->
        <div class="mb-6">
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Seleziona città
            </h3>
            
            <div class="mb-3">
              <select 
                v-model="cittaSelezionata"
                @change="onCityChange"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
              >
                <option value="">Tutte le città</option>
                <option 
                  v-for="cittaData in tutteLeCitta" 
                  :key="cittaData.citta" 
                  :value="cittaData.citta"
                >
                  {{ cittaData.citta }} ({{ cittaData.count }})
                </option>
              </select>
            </div>
            
            <div v-if="cittaSelezionata" class="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-800">
                <span class="font-semibold">Hai selezionato i concessionari nella città {{ cittaSelezionata }}</span> che offrono {{ servizio.servizi_catalogo.nome }}
              </p>
              <p class="text-xs text-green-600 mt-1">
                {{ concessionariFiltrati.length }} concessionari disponibili
              </p>
            </div>
          </div>
        </div>

        <!-- Descrizione -->
        <div v-if="servizio.descrizione" class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Descrizione del Servizio</h2>
          <div class="bg-gray-50 rounded-xl p-6">
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">
              {{ servizio.descrizione }}
            </p>
          </div>
        </div>

        <!-- Cosa Include -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Cosa Include</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-gray-700">Diagnosi completa</span>
            </div>
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-gray-700">Materiali di qualità</span>
            </div>
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-gray-700">Garanzia sul lavoro</span>
            </div>
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-gray-700">Certificato di conformità</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sezione Concessionari (come moto nuove) -->
      <div class="w-full bg-gray-50 py-8 md:py-16">
        <div class="max-w-7xl mx-auto px-4 md:px-6">
          <div class="text-center mb-8 md:mb-12">
            <h2 class="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
              <svg class="w-6 h-6 md:w-10 md:h-10 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <span>I Tuoi Concessionari di Fiducia</span>
            </h2>
            <p class="text-base md:text-xl text-gray-600">Concessionari autorizzati che offrono questo servizio</p>
          </div>

          <!-- Lista Concessionari -->
          <div v-if="concessionariFiltrati && concessionariFiltrati.length > 0" class="space-y-8">
            <div 
              v-for="(concessionario, index) in concessionariFiltrati" 
              :key="concessionario.id"
              class="bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-2xl overflow-hidden hover:shadow-xl md:hover:shadow-3xl transition-all duration-500 mb-6"
            >
              <!-- Header Concessionario -->
              <div class="bg-gradient-to-r from-[#90c149] to-[#7aa83f] p-4 md:p-8 text-white">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 md:gap-6">
                    <div class="w-12 h-12 md:w-20 md:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span class="text-lg md:text-3xl">🏪</span>
                    </div>
                    <div>
                      <h3 class="text-lg md:text-3xl font-bold mb-1 md:mb-2">{{ concessionario.nome }}</h3>
                      <p class="text-sm md:text-xl opacity-90">{{ concessionario.citta }}, {{ concessionario.provincia }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg md:text-2xl font-bold mb-1">⭐ 4.8</div>
                    <div class="text-xs md:text-sm opacity-90">Rating</div>
                  </div>
                </div>
              </div>
              
              <!-- Contenuto Principale -->
              <div class="p-4 md:p-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                  
                  <!-- Colonna Sinistra - Info Principali -->
                  <div class="lg:col-span-2 space-y-4 md:space-y-6">
                    
                    <!-- Status e Prezzo -->
                    <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <span class="text-2xl text-white">✅</span>
                        </div>
                        <div>
                          <h4 class="text-xl font-bold text-green-800">{{ servizio.servizi_catalogo.nome }} - Disponibile</h4>
                          <p class="text-green-600">Servizio disponibile presso questo concessionario</p>
                        </div>
                      </div>
                      
                      <!-- Prezzo del Concessionario -->
                      <div class="bg-gradient-to-r from-[#90c149] to-[#7aa83f] rounded-xl p-4 text-white mb-4">
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="text-sm opacity-90">Prezzo del Concessionario</div>
                            <div class="text-2xl font-bold">
                              €{{ concessionario.prezzo_da }}
                              <span v-if="concessionario.prezzo_a" class="text-lg">
                                - €{{ concessionario.prezzo_a }}
                              </span>
                            </div>
                          </div>
                          <div v-if="concessionario.durata_minuti" class="text-right">
                            <div class="text-lg font-bold">{{ concessionario.durata_minuti }} min</div>
                            <div class="text-sm opacity-90">Durata</div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Info Servizio -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white rounded-xl p-4 border border-green-200">
                          <div class="text-sm text-gray-600 mb-1">Categoria</div>
                          <div class="font-semibold text-gray-900">{{ servizio.servizi_catalogo.categoria }}</div>
                        </div>
                        <div class="bg-white rounded-xl p-4 border border-green-200">
                          <div class="text-sm text-gray-600 mb-1">Disponibilità</div>
                          <div class="font-semibold text-green-600">✅ Disponibile</div>
                        </div>
                      </div>
                    </div>

                    <!-- Info Concessionario -->
                    <div class="bg-gray-50 rounded-xl p-6">
                      <h5 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        Informazioni Concessionario
                      </h5>
                      <div class="space-y-3">
                        <div v-if="concessionario.via" class="flex items-center gap-3">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span class="text-gray-700">{{ concessionario.via }}, {{ concessionario.citta }}</span>
                        </div>
                        <div v-if="concessionario.telefono" class="flex items-center gap-3">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          <span class="text-gray-700">{{ concessionario.telefono }}</span>
                        </div>
                        <div v-if="concessionario.email" class="flex items-center gap-3">
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          <span class="text-gray-700">{{ concessionario.email }}</span>
                        </div>
                        <div v-if="concessionario.descrizione" class="mt-4">
                          <p class="text-gray-700 text-sm">{{ concessionario.descrizione }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Colonna Destra - CTA e Azioni -->
                  <div class="space-y-6">
                    
                    <!-- CTA Principali -->
                    <div class="space-y-4">
                      <button 
                        @click="contattaConcessionario(concessionario)"
                        class="w-full bg-[#90c149] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#7aa83f] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                      >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        Contatta il Concessionario
                      </button>
                      <button 
                        @click="fissaAppuntamento(concessionario)"
                        class="w-full bg-white text-[#90c149] border-2 border-[#90c149] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-3"
                      >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Prenota Appuntamento
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Nessun Concessionario -->
          <div v-else class="text-center py-12">
            <div class="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Nessun concessionario trovato</h3>
            <p class="text-gray-600">Prova a selezionare una città diversa</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="!loading" class="text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">🔧</div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">Servizio non trovato</h3>
      <p class="text-gray-600 mb-4">Il servizio che stai cercando non esiste o è stato rimosso</p>
      <NuxtLink 
        to="/servizi"
        class="bg-[#90c149] text-white px-6 py-3 rounded-lg hover:bg-[#7ba83a] transition-colors font-medium"
      >
        Torna ai Servizi
      </NuxtLink>
    </div>

    <!-- Contact Modal Unificato -->
    <UnifiedContactModal 
      v-if="showContactModal && selectedConcessionario && servizio"
      :is-open="showContactModal"
      :concessionario="selectedConcessionario"
      tipo="servizio"
      :servizio="servizioConcessionario"
      @close="showContactModal = false"
      @sent="onContactSent"
    />

    <!-- Appointment Modal Unificato -->
    <UnifiedAppointmentModal 
      v-if="showAppointmentModal && selectedConcessionario && servizio"
      :is-open="showAppointmentModal"
      :concessionario="selectedConcessionario"
      tipo="servizio"
      :servizio="servizioConcessionario"
      @close="showAppointmentModal = false"
      @booked="onAppointmentBooked"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import HeaderMenu from "@/components/HeaderMenu.vue"
import UnifiedContactModal from "@/components/UnifiedContactModal.vue"
import UnifiedAppointmentModal from "@/components/UnifiedAppointmentModal.vue"

// Route params
const route = useRoute()
const servizioSlug = route.params.slug

// Reactive data
const loading = ref(true)
const servizio = ref(null)
const cittaSelezionata = ref(null)
const showContactModal = ref(false)
const showAppointmentModal = ref(false)
const selectedConcessionario = ref(null)

// Computed: crea oggetto servizio per il concessionario selezionato
const servizioConcessionario = computed(() => {
  if (!servizio.value || !selectedConcessionario.value) return null
  
  return {
    id: servizio.value.id,
    servizi_catalogo: servizio.value.servizi_catalogo,
    prezzo_da: selectedConcessionario.value.prezzo_da,
    prezzo_a: selectedConcessionario.value.prezzo_a,
    durata_minuti: selectedConcessionario.value.durata_minuti,
    descrizione: selectedConcessionario.value.descrizione_servizio_concessionario || servizio.value.descrizione
  }
})

// Computed
const cittaDisponibili = computed(() => {
  if (!servizio.value?.concessionari) return []
  const citta = servizio.value.concessionari.map(c => c.citta)
  const cittaUniche = [...new Set(citta)]
  
  // Se c'è una città selezionata, mettila in cima
  if (cittaSelezionata.value && cittaUniche.includes(cittaSelezionata.value)) {
    const cittaSelezionataIndex = cittaUniche.indexOf(cittaSelezionata.value)
    const cittaSelezionataValue = cittaUniche.splice(cittaSelezionataIndex, 1)[0]
    return [cittaSelezionataValue, ...cittaUniche.sort()]
  }
  
  return cittaUniche.sort()
})

// Lista delle città dal database con conteggi
const tutteLeCitta = computed(() => {
  if (!servizio.value?.concessionari) return []
  
  // Conta i concessionari per città
  const cittaCounts = {}
  servizio.value.concessionari.forEach(concessionario => {
    const citta = concessionario.citta
    cittaCounts[citta] = (cittaCounts[citta] || 0) + 1
  })
  
  // Crea array di oggetti con città e conteggio
  const cittaConConteggi = Object.entries(cittaCounts).map(([citta, count]) => ({
    citta,
    count
  }))
  
  // Se c'è una città selezionata, mettila in cima
  if (cittaSelezionata.value) {
    const cittaSelezionataIndex = cittaConConteggi.findIndex(c => c.citta === cittaSelezionata.value)
    if (cittaSelezionataIndex !== -1) {
      const cittaSelezionataValue = cittaConConteggi.splice(cittaSelezionataIndex, 1)[0]
      return [cittaSelezionataValue, ...cittaConConteggi.sort((a, b) => a.citta.localeCompare(b.citta))]
    }
  }
  
  return cittaConConteggi.sort((a, b) => a.citta.localeCompare(b.citta))
})

// Funzione per gestire il cambio città
const onCityChange = () => {
  // Salva la città nel localStorage
  if (cittaSelezionata.value) {
    localStorage.setItem('selectedCity', cittaSelezionata.value)
    console.log('✅ Città salvata nel localStorage:', cittaSelezionata.value)
  } else {
    localStorage.removeItem('selectedCity')
    console.log('❌ Città rimossa dal localStorage')
  }
}

const concessionariFiltrati = computed(() => {
  if (!servizio.value?.concessionari) return []
  if (!cittaSelezionata.value) return servizio.value.concessionari
  return servizio.value.concessionari.filter(c => c.citta === cittaSelezionata.value)
})

// Methods
const loadServizio = async () => {
  try {
    loading.value = true
    
    // Leggi la città dal localStorage
    const cittaFromStorage = localStorage.getItem('selectedCity')
    console.log('Città dal localStorage:', cittaFromStorage)
    
    const response = await $fetch('/api/servizi/by-slug', {
      method: 'POST',
      body: { slug: servizioSlug, citta: cittaFromStorage }
    })
    
    console.log('✅ Risposta API servizio:', response)
    
    servizio.value = response
    
    // Imposta la città selezionata dal localStorage dopo che i dati sono caricati
    if (cittaFromStorage) {
      await nextTick()
      cittaSelezionata.value = cittaFromStorage
      console.log('✅ Città impostata dal localStorage:', cittaFromStorage)
    }
  } catch (error) {
    console.error('Errore caricamento servizio:', error)
    servizio.value = null
  } finally {
    loading.value = false
  }
}

const contattaConcessionario = (concessionario) => {
  selectedConcessionario.value = concessionario
  showContactModal.value = true
}

const fissaAppuntamento = (concessionario) => {
  selectedConcessionario.value = concessionario
  showAppointmentModal.value = true
}

const onContactSent = () => {
  showContactModal.value = false
  alert('Richiesta inviata con successo! Il concessionario ti contatterà presto.')
}

const onAppointmentBooked = () => {
  showAppointmentModal.value = false
  alert('Appuntamento richiesto con successo! Il concessionario ti contatterà per confermare.')
}

// Lifecycle
onMounted(() => {
  loadServizio()
})

// Watch per ricaricare quando cambia lo slug
watch(() => route.params.slug, () => {
  loadServizio()
})

// SEO
useHead({
  title: computed(() => servizio.value ? `${servizio.value.servizi_catalogo.nome} - Servizi` : 'Servizio'),
  meta: [
    {
      name: 'description',
      content: computed(() => servizio.value ? servizio.value.descrizione?.substring(0, 160) : '')
    }
  ]
})
</script>

