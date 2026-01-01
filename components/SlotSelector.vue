<template>
  <div class="space-y-4">
    <!-- Selezione Data -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Seleziona Data *</label>
      <input
        v-model="selectedDate"
        type="date"
        :min="minDate"
        :max="maxDate"
        required
        @change="loadSlots"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
      />
    </div>

    <!-- Loading Slots -->
    <div v-if="loadingSlots" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#90c149] mx-auto"></div>
      <p class="text-sm text-gray-500 mt-2">Caricamento orari disponibili...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Slots Disponibili -->
    <div v-else-if="selectedDate && availableSlots.length > 0">
      <label class="block text-sm font-medium text-gray-700 mb-2">Seleziona Orario *</label>
      <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        <button
          v-for="slot in availableSlots"
          :key="slot"
          @click="selectSlot(slot)"
          :class="[
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedTime === slot
              ? 'bg-[#90c149] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ slot }}
        </button>
      </div>
    </div>

    <!-- Nessuno Slot Disponibile -->
    <div v-else-if="selectedDate && availableSlots.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p class="text-sm text-yellow-600">Nessun orario disponibile per questa data. Seleziona un'altra data.</p>
    </div>

    <!-- Istruzioni -->
    <div v-if="!selectedDate" class="text-sm text-gray-500">
      Seleziona una data per vedere gli orari disponibili
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  concessionarioId: {
    type: String,
    required: true
  },
  minDate: {
    type: String,
    default: () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    }
  },
  maxDate: {
    type: String,
    default: () => {
      const max = new Date()
      max.setDate(max.getDate() + 30)
      return max.toISOString().split('T')[0]
    }
  }
})

const emit = defineEmits(['slot-selected'])

const selectedDate = ref('')
const selectedTime = ref('')
const availableSlots = ref([])
const loadingSlots = ref(false)
const error = ref('')

// Load slots quando cambia la data
const loadSlots = async () => {
  if (!selectedDate.value || !props.concessionarioId) {
    availableSlots.value = []
    return
  }

  try {
    loadingSlots.value = true
    error.value = ''
    selectedTime.value = ''

    const response = await $fetch('/api/appointments/slots', {
      method: 'GET',
      query: {
        concessionario_id: props.concessionarioId,
        data: selectedDate.value
      }
    })

    if (response.success && response.data?.slot_disponibili) {
      availableSlots.value = response.data.slot_disponibili
    } else {
      availableSlots.value = []
      error.value = response.error || 'Nessun orario disponibile per questa data'
    }
  } catch (err) {
    console.error('Errore caricamento slot:', err)
    const errorMessage = err.data?.message || err.message || err.statusMessage || 'Errore nel caricamento degli orari disponibili'
    error.value = errorMessage
    
    // Se è un errore 404 (concessionario non trovato) o 500, mostra messaggio più specifico
    if (err.statusCode === 404) {
      error.value = 'Concessionario non trovato. Verifica i dati.'
    } else if (err.statusCode === 500) {
      error.value = 'Errore del server. Riprova più tardi.'
    }
    
    availableSlots.value = []
  } finally {
    loadingSlots.value = false
  }
}

const selectSlot = (time) => {
  selectedTime.value = time
  emit('slot-selected', {
    data: selectedDate.value,
    orario: time
  })
}

// Reset quando cambia concessionario
watch(() => props.concessionarioId, () => {
  selectedDate.value = ''
  selectedTime.value = ''
  availableSlots.value = []
  error.value = ''
})
</script>

