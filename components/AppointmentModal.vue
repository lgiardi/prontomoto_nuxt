<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b">
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

      <!-- Form -->
      <form @submit.prevent="submitForm" class="p-6 space-y-4">
        <!-- Servizio/Moto Info -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 class="font-semibold text-gray-900 mb-2">{{ servizioNome }}</h3>
          <p class="text-sm text-gray-600">{{ concessionario.nome }} - {{ concessionario.citta }}</p>
          <p v-if="servizioPrezzo" class="text-lg font-bold text-gray-900 mt-2">
            €{{ servizioPrezzo }}
          </p>
          <p v-if="servizioDurata" class="text-sm text-gray-500 mt-1">
            Durata stimata: {{ servizioDurata }} minuti
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                <input 
            v-model="form.telefono"
                  type="tel" 
                  required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                  placeholder="+39 123 456 7890"
                />
            </div>
            
        <!-- Data Preferita -->
            <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Preferita *</label>
          <input
            v-model="form.dataPreferita"
            type="date"
            required
            :min="minDate"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
          />
            </div>
            
        <!-- Orario Preferito -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Orario Preferito</label>
          <select
            v-model="form.orarioPreferito"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
          >
            <option value="">Seleziona orario</option>
            <option value="mattina">Mattina (9:00 - 12:00)</option>
            <option value="pomeriggio">Pomeriggio (14:00 - 18:00)</option>
            <option value="sera">Sera (18:00 - 20:00)</option>
          </select>
              </div>
              
        <!-- Note -->
            <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Note Aggiuntive</label>
              <textarea 
            v-model="form.note"
                rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="Eventuali note o richieste particolari..."
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
              Prenotazione...
            </span>
            <span v-else>Prenota</span>
              </button>
            </div>
          </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  concessionario: {
    type: Object,
    required: true
  },
  servizio: {
    type: [Object, String],
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'booked'])

// Reactive data
const loading = ref(false)
const form = ref({
  nome: '',
  email: '',
  telefono: '',
  dataPreferita: '',
  orarioPreferito: '',
  note: ''
})

// Computed
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Gestisce sia servizio (oggetto) che moto (stringa)
const servizioNome = computed(() => {
  if (typeof props.servizio === 'string') {
    return props.servizio // Per moto, è direttamente la stringa marca+modello
  }
  // Per servizi, usa la struttura oggetto
  return props.servizio?.servizi_catalogo?.nome || props.servizio?.nome || 'Servizio'
})

const servizioPrezzo = computed(() => {
  if (typeof props.servizio === 'string') return null
  return props.servizio?.prezzo_da || props.servizio?.prezzo || null
})

const servizioDurata = computed(() => {
  if (typeof props.servizio === 'string') return null
  return props.servizio?.durata_minuti || null
})

// Methods
const submitForm = async () => {
  try {
  loading.value = true
  
    // Determina se è un servizio o una moto
    const isServizio = typeof props.servizio === 'object' && props.servizio?.servizi_catalogo
    const nomeServizioMoto = servizioNome.value
    
    // Crea messaggio per appuntamento
    const messaggio = `Richiesta appuntamento per ${nomeServizioMoto}:
    
Data preferita: ${form.value.dataPreferita}
Orario preferito: ${form.value.orarioPreferito || 'Nessuna preferenza'}
Note: ${form.value.note || 'Nessuna nota'}`

    // Prepara il body in base al tipo
    const body = {
      concessionarioId: props.concessionario.id || props.concessionario._id,
        clienteNome: form.value.nome,
        clienteEmail: form.value.email,
        clienteTelefono: form.value.telefono,
        messaggioIniziale: messaggio
      }
    
    // Se è un servizio, aggiungi servizioId
    if (isServizio) {
      body.servizioId = props.servizio.id
      body.servizioNome = nomeServizioMoto
    } else {
      // Per moto, dovremmo avere motoId e motoMarca/modello passati separatamente
      // Per ora usiamo solo il nome come titolo
      body.titolo = `Richiesta appuntamento per ${nomeServizioMoto}`
    }

    const response = await $fetch('/api/conversazioni/create', {
      method: 'POST',
      body: body
    })
    
    if (response.success) {
      emit('submit', response)
      emit('booked', response.data)
    } else {
      throw new Error(response.error || 'Errore nella prenotazione')
    }
    
  } catch (error) {
    console.error('Errore prenotazione:', error)
    alert(error.message || 'Errore nella prenotazione')
  } finally {
    loading.value = false
  }
}
</script>