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

      <!-- Form -->
      <form @submit.prevent="submitForm" class="p-6 space-y-4">
        <!-- Info Box (Moto/Servizio) -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 class="font-semibold text-gray-900 mb-2">{{ itemTitle }}</h3>
          <div v-if="itemDetails" class="text-sm text-gray-600 mb-2">
            {{ itemDetails }}
          </div>
          <p v-if="itemPrice" class="text-lg font-bold text-gray-900">
            {{ itemPrice }}
          </p>
          <p class="text-sm text-gray-600 mt-2">
            <span class="font-semibold">{{ concessionario.nome }}</span>
            <span v-if="concessionario.citta"> · {{ concessionario.citta }}</span>
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
        
        <!-- Cognome -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
          <input 
            v-model="form.cognome"
            type="text" 
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="Il tuo cognome"
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

        <!-- Telefono (opzionale per uso interno) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
          <input 
            v-model="form.telefono"
            type="tel" 
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="+39 123 456 7890 (opzionale)"
          />
        </div>
            
        <!-- Slot Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data e Orario Appuntamento *</label>
          <SlotSelector
            :concessionario-id="concessionarioId"
            @slot-selected="handleSlotSelected"
          />
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
            :disabled="loading || !form.dataAppuntamento || !form.orarioAppuntamento"
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import SlotSelector from './SlotSelector.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  // Concessionario/Venditore
  concessionario: {
    type: Object,
    required: true
  },
  // Tipo: 'moto_nuova' | 'moto_usata' | 'servizio'
  tipo: {
    type: String,
    required: true,
    validator: (value) => ['moto_nuova', 'moto_usata', 'servizio'].includes(value)
  },
  // Per moto nuove
  moto: {
    type: Object,
    default: null
  },
  // Per moto usate
  motoUsata: {
    type: Object,
    default: null
  },
  // Per servizi
  servizio: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'booked'])

// Supabase
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive data
const loading = ref(false)
const form = ref({
  nome: '',
  cognome: '',
  email: '',
  telefono: '',
  dataAppuntamento: '',
  orarioAppuntamento: '',
  note: ''
})

// Carica i dati dell'utente quando il modal si apre
const loadUserData = async () => {
  console.log('👤 UnifiedAppointmentModal - Caricamento dati utente...', {
    hasUser: !!user.value,
    userId: user.value?.id,
    userEmail: user.value?.email
  })
  
  if (user.value) {
    try {
      // Recupera i dati dell'utente dalla tabella utenti
      const { data: utenteData, error } = await supabase
        .from('utenti')
        .select('nome, email, telefono')
        .eq('id', user.value.id)
        .maybeSingle()
      
      console.log('👤 Dati recuperati da utenti:', { utenteData, error })
      
      if (!error && utenteData) {
        // Precompila con i dati dal database
        const nomeCompleto = utenteData.nome || ''
        const partiNome = nomeCompleto.split(' ')
        form.value.nome = partiNome[0] || ''
        form.value.cognome = partiNome.slice(1).join(' ') || ''
        form.value.email = utenteData.email || user.value.email || ''
        form.value.telefono = utenteData.telefono || ''
        console.log('✅ Form precompilato con dati da database:', form.value)
      } else {
        // Fallback: usa i dati dall'utente autenticato
        const nomeCompleto = user.value.user_metadata?.nome || user.value.user_metadata?.full_name || ''
        const partiNome = nomeCompleto.split(' ')
        form.value.nome = partiNome[0] || ''
        form.value.cognome = partiNome.slice(1).join(' ') || ''
        form.value.email = user.value.email || ''
        form.value.telefono = user.value.user_metadata?.telefono || ''
        console.log('✅ Form precompilato con dati da user metadata:', form.value)
      }
    } catch (error) {
      console.error('❌ Errore caricamento dati utente:', error)
      // Fallback: usa i dati dall'utente autenticato
      const nomeCompleto = user.value?.user_metadata?.nome || user.value?.user_metadata?.full_name || ''
      const partiNome = nomeCompleto.split(' ')
      form.value.nome = partiNome[0] || ''
      form.value.cognome = partiNome.slice(1).join(' ') || ''
      form.value.email = user.value?.email || ''
      console.log('✅ Form precompilato con fallback:', form.value)
    }
  } else {
    console.log('⚠️ Nessun utente loggato')
  }
}

// Carica i dati quando il modal si apre
watch(() => props.isOpen, async (isOpen) => {
  console.log('👁️ Watch isOpen cambiato:', isOpen, 'User:', !!user.value)
  if (isOpen) {
    // Aspetta un attimo per assicurarsi che il modal sia completamente aperto
    await nextTick()
    if (user.value) {
      await loadUserData()
    } else {
      // Prova a recuperare l'utente se non è ancora disponibile
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        user.value = currentUser
        await loadUserData()
      }
    }
  }
}, { immediate: true })

// Carica anche al mount se l'utente è già loggato
onMounted(async () => {
  console.log('🔧 onMounted - isOpen:', props.isOpen, 'User:', !!user.value)
  if (props.isOpen) {
    await nextTick()
    if (user.value) {
      await loadUserData()
    } else {
      // Prova a recuperare l'utente
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        user.value = currentUser
        await loadUserData()
      }
    }
  }
})

// Computed per concessionarioId
const concessionarioId = computed(() => {
  return props.concessionario.id || props.concessionario._id
})

// Computed
const itemTitle = computed(() => {
  if (props.tipo === 'moto_nuova' && props.moto) {
    return `${props.moto.marca} ${props.moto.modello}`
  } else if (props.tipo === 'moto_usata' && props.motoUsata) {
    return `${props.motoUsata.marca} ${props.motoUsata.modello}`
  } else if (props.tipo === 'servizio' && props.servizio) {
    return props.servizio.servizi_catalogo?.nome || props.servizio.nome || 'Servizio'
  }
  return 'Prodotto'
})

const itemDetails = computed(() => {
  if (props.tipo === 'moto_nuova' && props.moto) {
    return `${props.moto.categoria || ''} · ${props.moto.cilindrata || ''} cc`.trim()
  } else if (props.tipo === 'moto_usata' && props.motoUsata) {
    const condizione = getCondizioneText(props.motoUsata.condizione)
    return `${props.motoUsata.anno} · ${props.motoUsata.km?.toLocaleString('it-IT')} km · ${condizione}`
  } else if (props.tipo === 'servizio' && props.servizio) {
    return props.servizio.servizi_catalogo?.categoria || ''
  }
  return ''
})

const itemPrice = computed(() => {
  if (props.tipo === 'moto_nuova' && props.moto) {
    return props.moto.prezzo ? `€ ${props.moto.prezzo.toLocaleString('it-IT')}` : null
  } else if (props.tipo === 'moto_usata' && props.motoUsata) {
    return props.motoUsata.prezzo ? `€ ${props.motoUsata.prezzo.toLocaleString('it-IT')}` : null
  } else if (props.tipo === 'servizio' && props.servizio) {
    const prezzoDa = props.servizio.prezzo_da || props.servizio.prezzo
    if (prezzoDa) {
      const prezzoA = props.servizio.prezzo_a
      return prezzoA ? `€${prezzoDa} - €${prezzoA}` : `€${prezzoDa}`
    }
  }
  return null
})

// Methods
const getCondizioneText = (condizione) => {
  const condizioni = {
    'ottima': 'Ottima',
    'buona': 'Buona',
    'discreta': 'Discreta',
    'da-ristrutturare': 'Da ristrutturare'
  }
  return condizioni[condizione] || condizione
}

const handleSlotSelected = (slot) => {
  form.value.dataAppuntamento = slot.data
  form.value.orarioAppuntamento = slot.orario
}

const submitForm = async () => {
  try {
    loading.value = true

    // Validazione
    if (!form.value.nome || !form.value.cognome || !form.value.email) {
      alert('Compila tutti i campi obbligatori')
      loading.value = false
      return
    }

    if (!form.value.dataAppuntamento || !form.value.orarioAppuntamento) {
      alert('Seleziona data e orario per l\'appuntamento')
      loading.value = false
      return
    }

    if (!concessionarioId.value) {
      console.error('❌ UnifiedAppointmentModal: concessionarioId mancante', props.concessionario)
      alert('Errore: dati concessionario non validi')
      loading.value = false
      return
    }

    console.log('📤 UnifiedAppointmentModal - Invio dati appuntamento:', {
      tipo: props.tipo,
      concessionarioId: concessionarioId.value,
      data: form.value.dataAppuntamento,
      orario: form.value.orarioAppuntamento,
      clienteEmail: form.value.email
    })

    // Prepara il body per l'API appuntamenti
    const body = {
      nome: form.value.nome,
      cognome: form.value.cognome,
      email: form.value.email,
      telefono: form.value.telefono || null,
      note: form.value.note || null,
      data_appuntamento: form.value.dataAppuntamento,
      orario_appuntamento: form.value.orarioAppuntamento,
      concessionario_id: concessionarioId.value
    }

    // Aggiungi i campi specifici per tipo
    if (props.tipo === 'moto_nuova' && props.moto) {
      body.moto_id = props.moto.id
      body.servizio = `${props.moto.marca} ${props.moto.modello}`
    } else if (props.tipo === 'moto_usata' && props.motoUsata) {
      body.servizio = `${props.motoUsata.marca} ${props.motoUsata.modello} (Usata)`
    } else if (props.tipo === 'servizio' && props.servizio) {
      body.servizio = props.servizio.servizi_catalogo?.nome || props.servizio.nome
    }

    // Crea appuntamento
    const response = await $fetch('/api/appointments', {
      method: 'POST',
      body: body
    })

    if (response.success) {
      // Crea anche un lead/conversazione per tracciare la richiesta
      try {
        const leadBody = {
          concessionarioId: concessionarioId.value,
          clienteNome: form.value.nome,
          clienteEmail: form.value.email,
          clienteTelefono: form.value.telefono,
          messaggioIniziale: `Appuntamento prenotato per ${form.value.dataAppuntamento} alle ${form.value.orarioAppuntamento}. ${form.value.note || ''}`,
          tipoRichiesta: 'appuntamento'
        }

        if (props.tipo === 'moto_nuova' && props.moto) {
          leadBody.motoId = props.moto.id
          leadBody.motoMarca = props.moto.marca
          leadBody.motoModello = props.moto.modello
        } else if (props.tipo === 'moto_usata' && props.motoUsata) {
          leadBody.motoUsataId = props.motoUsata.id
          leadBody.motoMarca = props.motoUsata.marca
          leadBody.motoModello = props.motoUsata.modello
        } else if (props.tipo === 'servizio' && props.servizio) {
          leadBody.servizioConcessionarioId = props.servizio.id
          leadBody.servizioNome = props.servizio.servizi_catalogo?.nome || props.servizio.nome
        }

        await $fetch('/api/lead/create', {
          method: 'POST',
          body: leadBody
        })
      } catch (leadError) {
        console.warn('Errore creazione lead (non bloccante):', leadError)
      }

      emit('booked', response.data)
      
      // Reset form
      form.value = {
        nome: '',
        cognome: '',
        email: '',
        telefono: '',
        dataAppuntamento: '',
        orarioAppuntamento: '',
        note: ''
      }
    } else {
      throw new Error(response.error || 'Errore nella prenotazione')
    }
    
  } catch (error) {
    console.error('Errore prenotazione:', error)
    alert(error.message || error.data?.message || 'Errore nella prenotazione')
  } finally {
    loading.value = false
  }
}

// Watch per resettare quando il modal si chiude
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    form.value = {
      nome: '',
      cognome: '',
      email: '',
      telefono: '',
      dataAppuntamento: '',
      orarioAppuntamento: '',
      note: ''
    }
  }
})
</script>

