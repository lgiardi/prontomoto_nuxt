<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-lg">
        <div class="flex items-center space-x-3">
          <img 
            v-if="conversazioneData?.moto_immagine"
            :src="conversazioneData.moto_immagine || '/placeholder-moto.jpg'" 
            :alt="`${conversazioneData?.moto_marca} ${conversazioneData?.moto_modello}`"
            class="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h2 class="text-xl font-semibold text-gray-900">
              {{ conversazioneData?.cliente_nome || 'Conversazione' }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ conversazioneData?.moto_marca }} {{ conversazioneData?.moto_modello }}
            </p>
          </div>
        </div>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Messaggi -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref="messaggiContainer">
        <div v-if="messaggiLoading" class="text-center text-gray-500 py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Caricamento messaggi...</p>
        </div>
        
        <div v-else-if="messaggi.length === 0" class="text-center text-gray-500 py-8">
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
              <p class="text-sm font-medium mb-1" v-if="messaggio.mittente_nome && messaggio.mittente_tipo === 'cliente'">
                {{ messaggio.mittente_nome }}
              </p>
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
      <div v-if="conversazioneId && concessionarioId" class="p-4 border-t bg-gray-50">
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
      <div class="p-4 border-t bg-white">
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
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="inviandoMessaggio">...</span>
            <span v-else>Invia</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Modal Prenota Appuntamento -->
    <AppointmentFromConversation
      v-if="conversazioneData && concessionarioId"
      :is-open="showAppointmentModal"
      :conversazione="conversazioneData"
      :concessionario-id="concessionarioId"
      @close="showAppointmentModal = false"
      @appointment-created="handleAppointmentCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import AppointmentFromConversation from '~/components/AppointmentFromConversation.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  conversazioneId: {
    type: String,
    required: true
  },
  concessionarioId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'message-sent'])

// State
const messaggiLoading = ref(false)
const inviandoMessaggio = ref(false)
const conversazioneData = ref(null)
const messaggi = ref([])
const nuovoMessaggio = ref('')
const messaggiContainer = ref(null)
const showAppointmentModal = ref(false)
const appuntamentiCollegati = ref([])

// Methods
const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
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

const formatDate = (dateString) => {
  if (!dateString) return ''
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

const caricaConversazione = async () => {
  if (!props.conversazioneId) return

  try {
    messaggiLoading.value = true
    console.log('💬 ConversationModal - Caricamento conversazione:', props.conversazioneId)

    const response = await $fetch(`/api/conversazioni/${props.conversazioneId}/messaggi`)

    if (response.success) {
      conversazioneData.value = response.conversazione
      messaggi.value = response.messaggi || []
      console.log('✅ ConversationModal - Conversazione caricata:', messaggi.value.length, 'messaggi')
      
      // Scroll to bottom
      await nextTick()
      if (messaggiContainer.value) {
        messaggiContainer.value.scrollTop = messaggiContainer.value.scrollHeight
      }
    } else {
      console.error('❌ ConversationModal - Risposta API non valida:', response)
    }
  } catch (error) {
    console.error('❌ ConversationModal - Errore caricamento conversazione:', error)
  } finally {
    messaggiLoading.value = false
  }
}

const caricaAppuntamenti = async () => {
  if (!props.conversazioneId) return

  try {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('appuntamenti')
      .select('*')
      .eq('conversazione_id', props.conversazioneId)
      .order('data_appuntamento', { ascending: true })
      .order('orario_appuntamento', { ascending: true })

    if (error) throw error
    appuntamentiCollegati.value = data || []
  } catch (error) {
    console.error('❌ ConversationModal - Errore caricamento appuntamenti:', error)
    appuntamentiCollegati.value = []
  }
}

const inviaMessaggio = async () => {
  if (!nuovoMessaggio.value.trim() || !props.conversazioneId) return

  try {
    inviandoMessaggio.value = true
    console.log('💬 ConversationModal - Invio messaggio:', nuovoMessaggio.value)

    const user = useSupabaseUser()
    const response = await $fetch(`/api/conversazioni/${props.conversazioneId}/messaggi`, {
      method: 'POST',
      body: {
        messaggio: nuovoMessaggio.value,
        mittenteTipo: 'concessionario',
        mittenteId: user.value?.id,
        mittenteNome: 'Concessionario'
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
      
      // Emetti evento per aggiornare la lista lead
      emit('message-sent', response.messaggio)
    }
  } catch (error) {
    console.error('❌ ConversationModal - Errore invio messaggio:', error)
    alert('Errore nell\'invio del messaggio')
  } finally {
    inviandoMessaggio.value = false
  }
}

const handleAppointmentCreated = async (appuntamento) => {
  console.log('✅ ConversationModal - Appuntamento creato:', appuntamento)
  await caricaAppuntamenti()
  showAppointmentModal.value = false
}

// Watch per caricare quando il modale si apre
watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.conversazioneId) {
    await caricaConversazione()
    await caricaAppuntamenti()
  } else {
    // Reset quando si chiude
    messaggi.value = []
    conversazioneData.value = null
    nuovoMessaggio.value = ''
    appuntamentiCollegati.value = []
  }
})

// Carica anche al mount se già aperto
onMounted(() => {
  if (props.isOpen && props.conversazioneId) {
    caricaConversazione()
    caricaAppuntamenti()
  }
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>

