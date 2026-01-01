<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
        <h2 class="text-xl font-semibold text-gray-900">Prenota Appuntamento</h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        <!-- Info Conversazione -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-2">{{ conversazioneTitle }}</h3>
          <p class="text-sm text-gray-600">
            <span class="font-semibold">{{ conversazione.cliente_nome }}</span>
            <span v-if="conversazione.cliente_email"> · {{ conversazione.cliente_email }}</span>
          </p>
        </div>

        <!-- Slot Selector -->
        <SlotSelector
          :concessionario-id="concessionarioId"
          @slot-selected="handleSlotSelected"
        />

        <!-- Note -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Note (opzionale)</label>
          <textarea
            v-model="note"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="Aggiungi note per l'appuntamento..."
          ></textarea>
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            @click="prenotaAppuntamento"
            :disabled="loading || !selectedSlot"
            class="px-6 py-2 bg-[#90c149] text-white rounded-lg hover:bg-[#7ba83a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Prenotazione...
            </span>
            <span v-else>Prenota Appuntamento</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SlotSelector from './SlotSelector.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  conversazione: {
    type: Object,
    required: true
  },
  concessionarioId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'appointment-created'])

const loading = ref(false)
const error = ref('')
const note = ref('')
const selectedSlot = ref(null)

const conversazioneTitle = computed(() => {
  if (props.conversazione.moto_marca && props.conversazione.moto_modello) {
    return `${props.conversazione.moto_marca} ${props.conversazione.moto_modello}`
  } else if (props.conversazione.servizi_catalogo?.nome) {
    return props.conversazione.servizi_catalogo.nome
  }
  return 'Richiesta informazioni'
})

const handleSlotSelected = (slot) => {
  selectedSlot.value = slot
  error.value = ''
}

const prenotaAppuntamento = async () => {
  if (!selectedSlot.value) {
    error.value = 'Seleziona data e orario'
    return
  }

  try {
    loading.value = true
    error.value = ''

    const response = await $fetch('/api/appointments/from-conversation', {
      method: 'POST',
      body: {
        conversazione_id: props.conversazione.id,
        data_appuntamento: selectedSlot.value.data,
        orario_appuntamento: selectedSlot.value.orario,
        note: note.value || null
      }
    })

    if (response.success) {
      emit('appointment-created', response.data)
      // Reset
      selectedSlot.value = null
      note.value = ''
      emit('close')
    } else {
      throw new Error(response.error || 'Errore nella prenotazione')
    }
  } catch (err) {
    console.error('Errore prenotazione appuntamento:', err)
    error.value = err.message || err.data?.message || 'Errore nella prenotazione dell\'appuntamento'
  } finally {
    loading.value = false
  }
}
</script>





