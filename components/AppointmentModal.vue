<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">
              Fissa Appuntamento
            </h3>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-6">
          <!-- Info Concessionario -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-r from-[#90c149] to-[#7ba83a] rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-lg">{{ concessionario.nome.charAt(0) }}</span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">{{ concessionario.nome }}</h4>
                <p class="text-sm text-gray-600">{{ concessionario.indirizzo }}</p>
                <div class="flex items-center gap-1 mt-1">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-sm text-gray-600">{{ concessionario.rating }} ({{ concessionario.recensioni }} recensioni)</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Form Prenotazione -->
          <form @submit.prevent="submitAppointment" class="space-y-6">
            <!-- Dati Utente -->
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input 
                  v-model="formData.nome"
                  type="text" 
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  placeholder="Il tuo nome"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Cognome *
                </label>
                <input 
                  v-model="formData.cognome"
                  type="text" 
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  placeholder="Il tuo cognome"
                />
              </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input 
                  v-model="formData.email"
                  type="email" 
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  placeholder="tua@email.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Telefono *
                </label>
                <input 
                  v-model="formData.telefono"
                  type="tel" 
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>
            
            <!-- Selezione Data -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Scegli la Data *
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  v-for="data in dateDisponibili"
                  :key="data.value"
                  type="button"
                  @click="selezionaData(data)"
                  :class="[
                    'p-3 text-sm rounded-lg border transition-colors',
                    selectedData?.value === data.value
                      ? 'border-[#90c149] bg-[#90c149] text-white'
                      : 'border-gray-300 hover:border-[#90c149] hover:bg-gray-50'
                  ]"
                >
                  <div class="font-medium">{{ data.giorno }}</div>
                  <div class="text-xs opacity-75">{{ data.data }}</div>
                </button>
              </div>
            </div>
            
            <!-- Selezione Orario -->
            <div v-if="selectedData">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Scegli l'Orario *
              </label>
              
              <!-- Loading indicator -->
              <div v-if="loadingSlots" class="text-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#90c149] mx-auto mb-2"></div>
                <div class="text-sm text-gray-600">Caricamento orari disponibili...</div>
              </div>
              
              <!-- Orari disponibili -->
              <div v-else-if="orariDisponibili.length > 0" class="grid grid-cols-3 md:grid-cols-4 gap-2">
                <button
                  v-for="orario in orariDisponibili"
                  :key="orario"
                  type="button"
                  @click="selezionaOrario(orario)"
                  :class="[
                    'p-3 text-sm rounded-lg border transition-colors',
                    selectedOrario === orario
                      ? 'border-[#90c149] bg-[#90c149] text-white'
                      : 'border-gray-300 hover:border-[#90c149] hover:bg-gray-50'
                  ]"
                >
                  {{ orario }}
                </button>
              </div>
              
              <!-- Nessun orario disponibile -->
              <div v-else class="text-center py-4 text-gray-500">
                <div class="text-sm">Nessun orario disponibile per questa data</div>
              </div>
            </div>
            
            <!-- Note Aggiuntive -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Note Aggiuntive
              </label>
              <textarea 
                v-model="formData.note"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                placeholder="Descrivi eventuali esigenze particolari..."
              ></textarea>
            </div>
            
            <!-- Riepilogo -->
            <div v-if="selectedData && selectedOrario" class="p-4 bg-[#90c149]/10 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-2">Riepilogo Appuntamento</h4>
              <div class="text-sm text-gray-600 space-y-1">
                <div><strong>Data:</strong> {{ selectedData.giorno }} {{ selectedData.data }}</div>
                <div><strong>Orario:</strong> {{ selectedOrario }}</div>
                <div><strong>Concessionario:</strong> {{ concessionario.nome }}</div>
                <div><strong>Servizio:</strong> {{ servizio }}</div>
              </div>
            </div>
            
            <!-- Pulsanti -->
            <div class="flex gap-3 pt-4">
              <button 
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button 
                type="submit"
                :disabled="!selectedData || !selectedOrario || loading"
                class="flex-1 px-4 py-2 bg-[#90c149] text-white rounded-lg hover:bg-[#7ba83a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="loading">Prenotando...</span>
                <span v-else>Conferma Appuntamento</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  concessionario: {
    type: Object,
    required: true
  },
  servizio: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'submit'])

// Form data
const formData = ref({
  nome: '',
  cognome: '',
  email: '',
  telefono: '',
  note: ''
})

// Selezione data e orario
const selectedData = ref(null)
const selectedOrario = ref(null)
const loading = ref(false)

// Date disponibili (prossimi 7 giorni)
const dateDisponibili = computed(() => {
  const dates = []
  const today = new Date()
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const giorno = date.toLocaleDateString('it-IT', { weekday: 'long' })
    const data = date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    
    dates.push({
      value: date.toISOString().split('T')[0],
      giorno: giorno.charAt(0).toUpperCase() + giorno.slice(1),
      data: data
    })
  }
  
  return dates
})

// Orari disponibili dal backend
const orariDisponibili = ref([])
const loadingSlots = ref(false)

// Carica gli slot disponibili quando si seleziona una data
const loadAvailableSlots = async (data) => {
  if (!data || !props.concessionario.id) return
  
  loadingSlots.value = true
  orariDisponibili.value = []
  
  try {
    const response = await $fetch('/api/appointments/slots', {
      method: 'GET',
      query: {
        concessionario_id: props.concessionario.id,
        data: data.value
      }
    })
    
    if (response.success) {
      orariDisponibili.value = response.data.slot_disponibili
    }
  } catch (error) {
    console.error('Errore nel caricamento slot:', error)
    // Fallback a slot predefiniti
    orariDisponibili.value = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
  } finally {
    loadingSlots.value = false
  }
}

// Metodi
const selezionaData = (data) => {
  selectedData.value = data
  selectedOrario.value = null // Reset orario quando cambia data
  loadAvailableSlots(data) // Carica gli slot disponibili
}

const selezionaOrario = (orario) => {
  selectedOrario.value = orario
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  formData.value = {
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    note: ''
  }
  selectedData.value = null
  selectedOrario.value = null
}

const submitAppointment = async () => {
  loading.value = true
  
  try {
    const appointmentData = {
      nome: formData.value.nome,
      cognome: formData.value.cognome,
      email: formData.value.email,
      telefono: formData.value.telefono,
      note: formData.value.note,
      data_appuntamento: selectedData.value.value,
      orario_appuntamento: selectedOrario.value,
      concessionario_id: props.concessionario.id,
      servizio: props.servizio
    }
    
    // Chiamata API per creare l'appuntamento
    const response = await $fetch('/api/appointments', {
      method: 'POST',
      body: appointmentData
    })
    
    if (response.success) {
      emit('submit', response.data)
      closeModal()
      
      // Mostra conferma
      alert('Appuntamento prenotato con successo!')
    } else {
      throw new Error(response.message || 'Errore nella prenotazione')
    }
    
  } catch (error) {
    console.error('Errore nella prenotazione:', error)
    alert(error.data?.message || 'Errore nella prenotazione. Riprova.')
  } finally {
    loading.value = false
  }
}

// Reset form quando si chiude il modal
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script>
