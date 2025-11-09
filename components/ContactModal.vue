<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-900">Richiedi Informazioni</h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" class="p-6 space-y-4">
        <!-- Servizio Info -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 class="font-semibold text-gray-900 mb-2">{{ servizio.servizi_catalogo.nome }}</h3>
          <p class="text-sm text-gray-600">{{ servizio.concessionari.nome }} - {{ servizio.concessionari.citta }}</p>
          <p class="text-lg font-bold text-gray-900 mt-2">
            €{{ servizio.prezzo_da }}
            <span v-if="servizio.prezzo_a" class="text-sm text-gray-500">
              - €{{ servizio.prezzo_a }}
            </span>
          </p>
        </div>

        <!-- Nome -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            v-model="form.nome"
            type="text"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="Il tuo nome"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="la.tua@email.com"
          />
        </div>

        <!-- Telefono -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
          <input
            v-model="form.telefono"
            type="tel"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="+39 123 456 7890"
          />
        </div>

        <!-- Messaggio -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Messaggio *</label>
          <textarea
            v-model="form.messaggio"
            rows="4"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="Descrivi la tua richiesta o le tue domande..."
          ></textarea>
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
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-[#90c149] text-white rounded-lg hover:bg-[#7ba83a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Invio...
            </span>
            <span v-else>Invia Richiesta</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  concessionario: {
    type: Object,
    required: true
  },
  servizio: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'sent'])

// Reactive data
const loading = ref(false)
const form = ref({
  nome: '',
  email: '',
  telefono: '',
  messaggio: ''
})

// Methods
const submitForm = async () => {
  try {
    loading.value = true

    // Crea conversazione per servizio
    const response = await $fetch('/api/conversazioni/create', {
      method: 'POST',
      body: {
        servizioId: props.servizio.id,
        concessionarioId: props.concessionario.id,
        servizioNome: props.servizio.servizi_catalogo.nome,
        clienteNome: form.value.nome,
        clienteEmail: form.value.email,
        clienteTelefono: form.value.telefono,
        messaggioIniziale: form.value.messaggio
      }
    })

    if (response.success) {
      emit('sent', response.data)
    } else {
      throw new Error(response.error || 'Errore nell\'invio della richiesta')
    }

  } catch (error) {
    console.error('Errore invio richiesta:', error)
    alert(error.message || 'Errore nell\'invio della richiesta')
  } finally {
    loading.value = false
  }
}
</script>
