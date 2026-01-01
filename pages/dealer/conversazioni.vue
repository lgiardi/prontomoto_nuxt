<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Conversazioni</h1>
            <p class="text-sm text-gray-500">Gestisci i messaggi dei clienti</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500">
              {{ unreadCount }} messaggi non letti
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Lista conversazioni -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm border">
            <div class="p-4 border-b">
              <h2 class="text-lg font-semibold">Conversazioni attive</h2>
            </div>
            
            <div v-if="loading" class="p-4">
              <div class="animate-pulse space-y-4">
                <div v-for="i in 3" :key="i" class="flex space-x-3">
                  <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="conversazioni.length === 0" class="p-4 text-center text-gray-500">
              <div class="text-4xl mb-2">💬</div>
              <p>Nessuna conversazione attiva</p>
            </div>

            <div v-else class="divide-y">
              <div 
                v-for="conversazione in conversazioni" 
                :key="conversazione.id"
                @click="selezionaConversazione(conversazione)"
                :class="[
                  'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
                  conversazioneSelezionata?.id === conversazione.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                ]"
              >
                <div class="flex space-x-3">
                  <!-- Foto moto -->
                  <div class="flex-shrink-0">
                    <img 
                      :src="conversazione.moto_immagine || '/placeholder-moto.jpg'" 
                      :alt="`${conversazione.moto_marca} ${conversazione.moto_modello}`"
                      class="w-12 h-12 rounded-lg object-cover"
                    />
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ conversazione.cliente_nome }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ formatTimeAgo(conversazione.ultimo_messaggio_at) }}
                      </p>
                    </div>
                    
                    <p class="text-sm text-gray-600 truncate">
                      {{ conversazione.moto_marca }} {{ conversazione.moto_modello }}
                    </p>
                    
                    <p class="text-xs text-gray-500 truncate">
                      {{ conversazione.ultimo_messaggio_preview }}
                    </p>
                    
                    <!-- Badge non letto -->
                    <div v-if="!conversazione.concessionario_ha_letto" class="flex justify-end mt-1">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Nuovo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat -->
        <div class="lg:col-span-2">
          <div v-if="!conversazioneSelezionata" class="bg-white rounded-lg shadow-sm border h-96 flex items-center justify-center">
            <div class="text-center text-gray-500">
              <div class="text-6xl mb-4">💬</div>
              <p class="text-lg">Seleziona una conversazione</p>
              <p class="text-sm">Scegli una conversazione dalla lista per iniziare a chattare</p>
            </div>
          </div>

          <div v-else class="bg-white rounded-lg shadow-sm border h-96 flex flex-col">
            <!-- Header chat -->
            <div class="p-4 border-b bg-gray-50">
              <div class="flex items-center space-x-3">
                <img 
                  :src="conversazioneSelezionata.moto_immagine || '/placeholder-moto.jpg'" 
                  :alt="`${conversazioneSelezionata.moto_marca} ${conversazioneSelezionata.moto_modello}`"
                  class="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <h3 class="font-semibold text-gray-900">
                    {{ conversazioneSelezionata.cliente_nome }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ conversazioneSelezionata.moto_marca }} {{ conversazioneSelezionata.moto_modello }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Messaggi -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messaggiContainer">
              <div v-if="messaggiLoading" class="text-center text-gray-500">
                Caricamento messaggi...
              </div>
              
              <div v-else-if="messaggi.length === 0" class="text-center text-gray-500">
                <p>Nessun messaggio ancora</p>
              </div>
              
              <div v-else>
                <div 
                  v-for="messaggio in messaggi" 
                  :key="messaggio.id"
                  :class="[
                    'flex',
                    messaggio.mittente_tipo === 'concessionario' ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <div 
                    :class="[
                      'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                      messaggio.mittente_tipo === 'concessionario' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-900'
                    ]"
                  >
                    <p class="text-sm">{{ messaggio.messaggio }}</p>
                    <p 
                      :class="[
                        'text-xs mt-1',
                        messaggio.mittente_tipo === 'concessionario' ? 'text-blue-100' : 'text-gray-500'
                      ]"
                    >
                      {{ formatTimeAgo(messaggio.created_at) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Appuntamenti collegati -->
            <div v-if="appuntamentiCollegati.length > 0" class="p-4 border-t bg-yellow-50">
              <h4 class="text-sm font-semibold text-gray-900 mb-2">Appuntamenti</h4>
              <div class="space-y-2">
                <div 
                  v-for="app in appuntamentiCollegati" 
                  :key="app.id"
                  class="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ formatDate(app.data_appuntamento) }} alle {{ app.orario_appuntamento }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Stato: {{ getStatusLabel(app.stato) }}
                    </p>
                  </div>
                  <span :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    app.stato === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.stato === 'confirmed' ? 'bg-green-100 text-green-800' :
                    app.stato === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  ]">
                    {{ getStatusLabel(app.stato) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Pulsante Prenota Appuntamento -->
            <div class="p-4 border-t bg-gray-50">
              <button
                @click="showAppointmentModal = true"
                class="w-full px-4 py-2 bg-[#90c149] text-white rounded-lg hover:bg-[#7ba83a] transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Prenota Appuntamento
              </button>
            </div>

            <!-- Input messaggio -->
            <div class="p-4 border-t">
              <form @submit.prevent="inviaMessaggio" class="flex space-x-2">
                <input
                  v-model="nuovoMessaggio"
                  type="text"
                  placeholder="Scrivi un messaggio..."
                  class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :disabled="inviandoMessaggio"
                />
                <button
                  type="submit"
                  :disabled="!nuovoMessaggio.trim() || inviandoMessaggio"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="inviandoMessaggio">...</span>
                  <span v-else>Invia</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Prenota Appuntamento -->
    <AppointmentFromConversation
      v-if="conversazioneSelezionata && concessionarioId"
      :is-open="showAppointmentModal"
      :conversazione="conversazioneSelezionata"
      :concessionario-id="concessionarioId"
      @close="showAppointmentModal = false"
      @appointment-created="handleAppointmentCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import AppointmentFromConversation from '~/components/AppointmentFromConversation.vue'

// Meta
definePageMeta({
  middleware: 'auth'
})

// State
const loading = ref(true)
const messaggiLoading = ref(false)
const inviandoMessaggio = ref(false)
const conversazioni = ref([])
const conversazioneSelezionata = ref(null)
const messaggi = ref([])
const nuovoMessaggio = ref('')
const unreadCount = ref(0)
const messaggiContainer = ref(null)
const showAppointmentModal = ref(false)
const appuntamentiCollegati = ref([])

// Supabase
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Computed
const concessionarioId = ref(null)

// Methods
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Ora'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} min fa`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ore fa`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} giorni fa`
  } else {
    return date.toLocaleDateString('it-IT')
  }
}

const caricaConversazioni = async () => {
  if (!concessionarioId.value) return

  try {
    loading.value = true
    console.log('💬 Caricamento conversazioni per concessionario:', concessionarioId.value)

    const response = await $fetch('/api/conversazioni', {
      query: {
        concessionarioId: concessionarioId.value,
        status: 'attiva'
      }
    })

    if (response.success) {
      conversazioni.value = response.conversazioni || []
      unreadCount.value = response.unreadCount || 0
      console.log('✅ Conversazioni caricate:', conversazioni.value.length)
    } else {
      console.error('❌ Risposta API non valida:', response)
      conversazioni.value = []
    }
  } catch (error) {
    console.error('❌ Errore caricamento conversazioni:', error)
    console.error('❌ Dettagli errore:', {
      message: error.message,
      statusCode: error.statusCode,
      data: error.data
    })
    conversazioni.value = []
    // Mostra un messaggio all'utente se possibile
    if (error.statusCode === 400 || error.statusCode === 500) {
      alert('Errore nel caricamento delle conversazioni. Controlla la console per i dettagli.')
    }
  } finally {
    loading.value = false
  }
}

const selezionaConversazione = async (conversazione) => {
  conversazioneSelezionata.value = conversazione
  await caricaMessaggi(conversazione.id)
  await caricaAppuntamenti(conversazione.id)
}

const caricaMessaggi = async (conversazioneId) => {
  try {
    messaggiLoading.value = true
    console.log('💬 Caricamento messaggi per conversazione:', conversazioneId)

    const response = await $fetch(`/api/conversazioni/${conversazioneId}/messaggi`)

    if (response.success) {
      messaggi.value = response.messaggi
      console.log('✅ Messaggi caricati:', messaggi.value.length)
      
      // Scroll to bottom
      await nextTick()
      if (messaggiContainer.value) {
        messaggiContainer.value.scrollTop = messaggiContainer.value.scrollHeight
      }
    }
  } catch (error) {
    console.error('❌ Errore caricamento messaggi:', error)
  } finally {
    messaggiLoading.value = false
  }
}

const inviaMessaggio = async () => {
  if (!nuovoMessaggio.value.trim() || !conversazioneSelezionata.value) return

  try {
    inviandoMessaggio.value = true
    console.log('💬 Invio messaggio:', nuovoMessaggio.value)

    const response = await $fetch(`/api/conversazioni/${conversazioneSelezionata.value.id}/messaggi`, {
      method: 'POST',
      body: {
        messaggio: nuovoMessaggio.value,
        mittenteTipo: 'concessionario',
        mittenteId: user.value.id,
        mittenteNome: 'Concessionario' // TODO: Prendere il nome dal concessionario
      }
    })

    if (response.success) {
      // Aggiungi il messaggio alla lista
      messaggi.value.push(response.messaggio)
      nuovoMessaggio.value = ''
      
      // Scroll to bottom
      await nextTick()
      if (messaggiContainer.value) {
        messaggiContainer.value.scrollTop = messaggiContainer.value.scrollHeight
      }
      
      // Ricarica le conversazioni per aggiornare l'anteprima
      await caricaConversazioni()
    }
  } catch (error) {
    console.error('❌ Errore invio messaggio:', error)
    alert('Errore nell\'invio del messaggio')
  } finally {
    inviandoMessaggio.value = false
  }
}

const caricaAppuntamenti = async (conversazioneId) => {
  try {
    const { data, error } = await supabase
      .from('appuntamenti')
      .select('*')
      .eq('conversazione_id', conversazioneId)
      .order('data_appuntamento', { ascending: true })
      .order('orario_appuntamento', { ascending: true })

    if (error) throw error
    appuntamentiCollegati.value = data || []
  } catch (error) {
    console.error('❌ Errore caricamento appuntamenti:', error)
    appuntamentiCollegati.value = []
  }
}

const handleAppointmentCreated = async (appuntamento) => {
  console.log('✅ Appuntamento creato:', appuntamento)
  await caricaAppuntamenti(conversazioneSelezionata.value.id)
  showAppointmentModal.value = false
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusLabel = (stato) => {
  const labels = {
    'pending': 'In Attesa',
    'confirmed': 'Confermato',
    'completed': 'Completato',
    'cancelled': 'Annullato'
  }
  return labels[stato] || stato
}

// Lifecycle
onMounted(async () => {
  if (!user.value) {
    await navigateTo('/auth/login')
    return
  }

  try {
    // Ottieni l'ID del concessionario
    const { data: concessionario, error: dealerError } = await supabase
      .from('concessionari')
      .select('id, nome')
      .eq('user_id', user.value.id)
      .single()

    if (dealerError) {
      console.error('❌ Errore caricamento concessionario:', dealerError)
      await navigateTo('/dashboard')
      return
    }

    concessionarioId.value = concessionario.id
    console.log('🏢 Concessionario ID:', concessionarioId.value)

    // Carica le conversazioni
    await caricaConversazioni()
  } catch (error) {
    console.error('❌ Errore inizializzazione:', error)
  }
})
</script>






