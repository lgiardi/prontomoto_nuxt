<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/conversazioni" class="text-gray-600 hover:text-gray-900">
              ← Tutte le conversazioni
            </NuxtLink>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Conversazione</h1>
              <p v-if="conversazione" class="text-sm text-gray-500">
                {{ conversazione.moto_marca }} {{ conversazione.moto_modello }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto"></div>
        <p class="mt-3 text-gray-600">Caricamento conversazione...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800">{{ error }}</p>
        <NuxtLink to="/conversazioni" class="mt-4 inline-block text-blue-600 hover:text-blue-800">
          Torna alle conversazioni
        </NuxtLink>
      </div>

      <!-- Conversazione -->
      <div v-else-if="conversazione" class="bg-white rounded-lg shadow-sm border">
        <!-- Header conversazione -->
        <div class="p-4 border-b bg-gray-50">
          <div class="flex items-center space-x-3">
            <img 
              :src="conversazione.moto_immagine || '/placeholder-moto.jpg'" 
              :alt="`${conversazione.moto_marca} ${conversazione.moto_modello}`"
              class="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 class="font-semibold text-gray-900">
                {{ conversazione.concessionari?.nome || 'Concessionario' }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ conversazione.moto_marca }} {{ conversazione.moto_modello }}
              </p>
            </div>
          </div>
        </div>

        <!-- Messaggi -->
        <div class="p-4 space-y-4 max-h-96 overflow-y-auto" ref="messaggiContainer">
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
                messaggio.mittente_tipo === 'cliente' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div 
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  messaggio.mittente_tipo === 'cliente' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-900'
                ]"
              >
                <p class="text-sm font-medium mb-1">{{ messaggio.mittente_nome }}</p>
                <p class="text-sm">{{ messaggio.messaggio }}</p>
                <p 
                  :class="[
                    'text-xs mt-1',
                    messaggio.mittente_tipo === 'cliente' ? 'text-blue-100' : 'text-gray-500'
                  ]"
                >
                  {{ formatTimeAgo(messaggio.created_at) }}
                </p>
              </div>
            </div>
          </div>
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
</template>

<script setup>
// Protezione della pagina
definePageMeta({
  middleware: 'auth',
  layout: false
})

const route = useRoute()
const { user } = useSupabaseUser()

const loading = ref(true)
const messaggiLoading = ref(false)
const inviandoMessaggio = ref(false)
const conversazione = ref(null)
const messaggi = ref([])
const nuovoMessaggio = ref('')
const error = ref(null)
const messaggiContainer = ref(null)

// Carica conversazione e messaggi
const caricaConversazione = async () => {
  const conversazioneId = route.params.id

  if (!conversazioneId) {
    error.value = 'ID conversazione non valido'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null

    // Carica conversazione
    const response = await $fetch(`/api/conversazioni/${conversazioneId}/messaggi`)

    if (response.success) {
      conversazione.value = response.conversazione
      messaggi.value = response.messaggi || []
      
      // Scroll to bottom
      await nextTick()
      if (messaggiContainer.value) {
        messaggiContainer.value.scrollTop = messaggiContainer.value.scrollHeight
      }
    } else {
      error.value = 'Conversazione non trovata'
    }
  } catch (err) {
    console.error('❌ Errore caricamento conversazione:', err)
    console.error('❌ Dettagli errore completo:', {
      message: err.message,
      statusCode: err.statusCode,
      statusMessage: err.statusMessage,
      data: err.data,
      response: err.response
    })
    
    // Gestisci diversi tipi di errore
    if (err.statusCode === 404) {
      error.value = 'Conversazione non trovata'
    } else if (err.statusCode === 500) {
      error.value = 'Errore del server. Riprova più tardi.'
    } else if (err.message?.includes('database') || err.message?.includes('connessione')) {
      error.value = 'Errore di connessione. Verifica la tua connessione internet e riprova.'
    } else {
      error.value = err.statusMessage || err.message || 'Errore nel caricamento della conversazione'
    }
  } finally {
    loading.value = false
  }
}

// Invia messaggio
const inviaMessaggio = async () => {
  if (!nuovoMessaggio.value.trim() || !conversazione.value || !user.value) return

  try {
    inviandoMessaggio.value = true

    const response = await $fetch(`/api/conversazioni/${conversazione.value.id}/messaggi`, {
      method: 'POST',
      body: {
        messaggio: nuovoMessaggio.value,
        mittenteTipo: 'cliente',
        mittenteId: user.value.id,
        mittenteNome: user.value.user_metadata?.nome || user.value.email?.split('@')[0] || 'Cliente'
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
    }
  } catch (err) {
    console.error('❌ Errore invio messaggio:', err)
    alert('Errore nell\'invio del messaggio')
  } finally {
    inviandoMessaggio.value = false
  }
}

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

// Carica al mount
onMounted(() => {
  if (!user.value) {
    navigateTo('/auth/login')
    return
  }
  caricaConversazione()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>

