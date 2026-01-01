<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
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
            :placeholder="messagePlaceholder"
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'

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

const emit = defineEmits(['close', 'sent'])

// Supabase
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive data
const loading = ref(false)
const form = ref({
  nome: '',
  email: '',
  telefono: '',
  messaggio: 'Salve,\n\nsono interessato al veicolo che hai messo in vendita. È ancora disponibile?\n\nCordiali saluti'
})

// Carica i dati dell'utente quando il modal si apre
const loadUserData = async () => {
  console.log('👤 UnifiedContactModal - Caricamento dati utente...', {
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
        form.value.nome = utenteData.nome || ''
        form.value.email = utenteData.email || user.value.email || ''
        form.value.telefono = utenteData.telefono || ''
        console.log('✅ Form precompilato con dati da database:', form.value)
      } else {
        // Fallback: usa i dati dall'utente autenticato
        form.value.email = user.value.email || ''
        form.value.nome = user.value.user_metadata?.nome || user.value.user_metadata?.full_name || ''
        form.value.telefono = user.value.user_metadata?.telefono || ''
        console.log('✅ Form precompilato con dati da user metadata:', form.value)
      }
    } catch (error) {
      console.error('❌ Errore caricamento dati utente:', error)
      // Fallback: usa i dati dall'utente autenticato
      form.value.email = user.value?.email || ''
      form.value.nome = user.value?.user_metadata?.nome || user.value?.user_metadata?.full_name || ''
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

const messagePlaceholder = computed(() => {
  if (props.tipo === 'moto_nuova' || props.tipo === 'moto_usata') {
    return 'Descrivi la tua richiesta o le tue domande sulla moto...'
  } else if (props.tipo === 'servizio') {
    return 'Descrivi la tua richiesta o le tue domande sul servizio...'
  }
  return 'Descrivi la tua richiesta...'
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

const submitForm = async () => {
  try {
    loading.value = true

    // Verifica che il concessionario abbia un ID valido
    // Normalizza: usa id se disponibile, altrimenti _id
    const concessionarioId = props.concessionario.id || props.concessionario._id || props.concessionario.concessionario_id
    if (!concessionarioId) {
      console.error('❌ UnifiedContactModal: concessionarioId mancante', props.concessionario)
      console.error('❌ Struttura oggetto concessionario:', JSON.stringify(props.concessionario, null, 2))
      alert('Errore: dati concessionario non validi')
      return
    }
    
    console.log('📤 UnifiedContactModal - Concessionario ID normalizzato:', {
      id: props.concessionario.id,
      _id: props.concessionario._id,
      concessionario_id: props.concessionario.concessionario_id,
      usato: concessionarioId,
      tipo: typeof concessionarioId
    })

    // Prepara il body in base al tipo
    const body = {
      // Usa sempre id del concessionario (UUID dalla tabella concessionari)
      concessionarioId: concessionarioId,
      clienteNome: form.value.nome,
      clienteEmail: form.value.email,
      clienteTelefono: form.value.telefono || null,
      messaggioIniziale: form.value.messaggio
    }

    // Aggiungi i campi specifici per tipo
    if (props.tipo === 'moto_nuova' && props.moto) {
      body.motoId = props.moto.id
      body.motoMarca = props.moto.marca
      body.motoModello = props.moto.modello
    } else if (props.tipo === 'moto_usata' && props.motoUsata) {
      body.motoUsataId = props.motoUsata.id
      body.motoMarca = props.motoUsata.marca
      body.motoModello = props.motoUsata.modello
    } else if (props.tipo === 'servizio' && props.servizio) {
      body.servizioId = props.servizio.id || props.servizio.servizio_catalogo_id
      body.servizioNome = props.servizio.servizi_catalogo?.nome || props.servizio.nome
    }

    console.log('📤 UnifiedContactModal - Invio dati:', {
      tipo: props.tipo,
      concessionarioId: body.concessionarioId,
      hasMotoId: !!body.motoId,
      hasMotoUsataId: !!body.motoUsataId,
      hasServizioId: !!body.servizioId,
      clienteEmail: body.clienteEmail,
      hasMessaggio: !!body.messaggioIniziale
    })

    // Crea conversazione
    console.log('📤 Invio richiesta a /api/conversazioni/create...')
    const response = await $fetch('/api/conversazioni/create', {
      method: 'POST',
      body: body
    }).catch(error => {
      console.error('❌ Errore fetch:', error)
      throw error
    })

    console.log('✅ Risposta ricevuta:', response)

    if (response && response.success) {
      emit('sent', response)
      // Reset form
      form.value = {
        nome: '',
        email: '',
        telefono: '',
        messaggio: 'Salve,\n\nsono interessato al veicolo che hai messo in vendita. È ancora disponibile?\n\nCordiali saluti'
      }
      // Chiudi il modal dopo il successo
      emit('close')
      alert('✅ Richiesta inviata con successo!\n\n📧 Riceverai un\'email con:\n- I dettagli della conversazione\n- Le credenziali per accedere (se è un nuovo account)\n- Il link per seguire la conversazione\n\n💬 Puoi continuare a chattare con il venditore dalla tua area utente!')
    } else {
      throw new Error(response?.error || response?.statusMessage || 'Errore nell\'invio della richiesta')
    }

  } catch (error) {
    console.error('❌ Errore invio richiesta:', error)
    console.error('❌ Dettagli errore completo:', {
      message: error.message,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: error.data,
      response: error.response
    })
    
    let errorMessage = 'Errore nell\'invio della richiesta'
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.statusMessage) {
      errorMessage = error.statusMessage
    } else if (error.message) {
      errorMessage = error.message
    } else if (error.data?.details) {
      errorMessage = `Errore: ${error.data.details}`
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

