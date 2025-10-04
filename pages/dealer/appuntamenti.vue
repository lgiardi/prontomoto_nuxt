<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center">
              <img 
                src="https://prontomoto.it/wp-content/uploads/2025/06/Risorsa-12.svg" 
                alt="ProntoMoto Logo" 
                class="h-8 w-auto"
              />
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <div class="flex items-center space-x-4">
            <NuxtLink to="/dealer/dashboard" class="text-gray-500 hover:text-gray-700 text-sm">
              ← Torna alla Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestione Appuntamenti</h1>
        <p class="text-gray-600 mt-2">Configura i tuoi orari di lavoro e gestisci gli appuntamenti</p>
      </div>

      <!-- Tabs -->
      <div class="mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button 
              @click="activeTab = 'orari'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'orari' 
                  ? 'border-[#90c149] text-[#90c149]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Configura Orari
            </button>
            <button 
              @click="activeTab = 'appuntamenti'"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'appuntamenti' 
                  ? 'border-[#90c149] text-[#90c149]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Appuntamenti ({{ appointments.length }})
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab: Configura Orari -->
      <div v-if="activeTab === 'orari'" class="space-y-8">
        <!-- Orari Lavorativi -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Orari Lavorativi</h2>
          
          <div class="space-y-6">
            <div v-for="giorno in giorniSettimana" :key="giorno.value" class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ giorno.nome }}</h3>
                <label class="flex items-center">
                  <input 
                    v-model="giorno.attivo"
                    type="checkbox" 
                    class="h-4 w-4 text-[#90c149] focus:ring-[#90c149] border-gray-300 rounded"
                  >
                  <span class="ml-2 text-sm text-gray-600">Aperto</span>
                </label>
              </div>
              
              <div v-if="giorno.attivo" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Orario Inizio</label>
                  <input 
                    v-model="giorno.orario_inizio"
                    type="time" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Orario Fine</label>
                  <input 
                    v-model="giorno.orario_fine"
                    type="time" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  >
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Durata Slot (minuti)</label>
                  <select 
                    v-model="giorno.slot_durata"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  >
                    <option value="30">30 minuti</option>
                    <option value="60">1 ora</option>
                    <option value="90">1 ora e 30 minuti</option>
                    <option value="120">2 ore</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button 
              @click="salvaOrari"
              :disabled="loading"
              class="bg-[#90c149] text-white px-6 py-2 rounded-lg hover:bg-[#7ba83a] disabled:opacity-50 transition-colors"
            >
              <span v-if="loading">Salvando...</span>
              <span v-else>Salva Orari</span>
            </button>
          </div>
        </div>

        <!-- Eccezioni -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Giorni di Chiusura</h2>
          
          <div class="space-y-4">
            <div v-for="(eccezione, index) in eccezioni" :key="index" class="flex items-center space-x-4 p-4 border rounded-lg">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Data Inizio</label>
                  <input 
                    v-model="eccezione.data_inizio"
                    type="date" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Data Fine</label>
                  <input 
                    v-model="eccezione.data_fine"
                    type="date" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
                  <input 
                    v-model="eccezione.motivo"
                    type="text" 
                    placeholder="es. Ferie, Chiusura straordinaria"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
                  >
                </div>
              </div>
              <button 
                @click="rimuoviEccezione(index)"
                class="text-red-600 hover:text-red-800 p-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="mt-4">
            <button 
              @click="aggiungiEccezione"
              class="text-[#90c149] hover:text-[#7ba83a] text-sm font-medium"
            >
              + Aggiungi Giorno di Chiusura
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: Appuntamenti -->
      <div v-if="activeTab === 'appuntamenti'" class="space-y-6">
        <!-- Filtri -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stato</label>
              <select v-model="filtroStato" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20">
                <option value="">Tutti</option>
                <option value="pending">In Attesa</option>
                <option value="confirmed">Confermato</option>
                <option value="completed">Completato</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Da</label>
              <input 
                v-model="filtroDataDa"
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data A</label>
              <input 
                v-model="filtroDataA"
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20"
              >
            </div>
          </div>
        </div>

        <!-- Lista Appuntamenti -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Appuntamenti</h2>
          </div>
          
          <div v-if="appointments.length === 0" class="text-center py-12 text-gray-500">
            <p>Nessun appuntamento trovato</p>
          </div>
          
          <div v-else class="divide-y divide-gray-200">
            <div v-for="appointment in appointments" :key="appointment.id" class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-[#90c149] rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">{{ appointment.nome.charAt(0) }}</span>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">{{ appointment.nome }} {{ appointment.cognome }}</h3>
                    <p class="text-sm text-gray-500">{{ appointment.servizio }}</p>
                    <p class="text-xs text-gray-400">{{ formatDate(appointment.data_appuntamento) }} alle {{ appointment.orario_appuntamento }}</p>
                    <p v-if="appointment.telefono" class="text-xs text-gray-400">📞 {{ appointment.telefono }}</p>
                    <p v-if="appointment.note" class="text-xs text-gray-400 mt-1">{{ appointment.note }}</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-4">
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    appointment.stato === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.stato === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.stato === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  ]">
                    {{ getStatusLabel(appointment.stato) }}
                  </span>
                  
                  <div class="flex space-x-2">
                    <button 
                      v-if="appointment.stato === 'pending'"
                      @click="confermaAppuntamento(appointment.id)"
                      class="text-green-600 hover:text-green-800 text-sm"
                    >
                      Conferma
                    </button>
                    <button 
                      v-if="appointment.stato === 'confirmed'"
                      @click="completaAppuntamento(appointment.id)"
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Completa
                    </button>
                    <button 
                      @click="annullaAppuntamento(appointment.id)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Questo middleware protegge la pagina - solo concessionari autenticati possono accedere
definePageMeta({
  middleware: 'auth',
  layout: false
})

const user = ref(null)
const loading = ref(false)
const activeTab = ref('orari')

// Giorni della settimana
const giorniSettimana = ref([
  { value: 1, nome: 'Lunedì', attivo: true, orario_inizio: '09:00', orario_fine: '18:00', slot_durata: 60 },
  { value: 2, nome: 'Martedì', attivo: true, orario_inizio: '09:00', orario_fine: '18:00', slot_durata: 60 },
  { value: 3, nome: 'Mercoledì', attivo: true, orario_inizio: '09:00', orario_fine: '18:00', slot_durata: 60 },
  { value: 4, nome: 'Giovedì', attivo: true, orario_inizio: '09:00', orario_fine: '18:00', slot_durata: 60 },
  { value: 5, nome: 'Venerdì', attivo: true, orario_inizio: '09:00', orario_fine: '18:00', slot_durata: 60 },
  { value: 6, nome: 'Sabato', attivo: false, orario_inizio: '09:00', orario_fine: '13:00', slot_durata: 60 },
  { value: 0, nome: 'Domenica', attivo: false, orario_inizio: '09:00', orario_fine: '13:00', slot_durata: 60 }
])

// Eccezioni
const eccezioni = ref([])

// Appuntamenti
const appointments = ref([])
const filtroStato = ref('')
const filtroDataDa = ref('')
const filtroDataA = ref('')

// Supabase
const supabase = useSupabaseClient()

// Carica gli orari esistenti
const loadOrari = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('slot_disponibili')
      .select('*')
      .eq('concessionario_id', user.value.id)

    if (error) throw error

    // Aggiorna i giorni con i dati dal database
    if (data && data.length > 0) {
      giorniSettimana.value.forEach(giorno => {
        const slot = data.find(s => s.giorno_settimana === giorno.value)
        if (slot) {
          giorno.attivo = slot.attivo
          giorno.orario_inizio = slot.orario_inizio
          giorno.orario_fine = slot.orario_fine
          giorno.slot_durata = slot.slot_durata
        }
      })
    }
  } catch (error) {
    console.error('Errore nel caricamento orari:', error)
  }
}

// Carica le eccezioni
const loadEccezioni = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('eccezioni_slot')
      .select('*')
      .eq('concessionario_id', user.value.id)
      .eq('attivo', true)

    if (error) throw error
    eccezioni.value = data || []
  } catch (error) {
    console.error('Errore nel caricamento eccezioni:', error)
  }
}

// Carica gli appuntamenti
const loadAppointments = async () => {
  if (!user.value) return

  try {
    let query = supabase
      .from('appuntamenti')
      .select('*')
      .eq('concessionario_id', user.value.id)
      .order('data_appuntamento', { ascending: true })
      .order('orario_appuntamento', { ascending: true })

    if (filtroStato.value) {
      query = query.eq('stato', filtroStato.value)
    }
    if (filtroDataDa.value) {
      query = query.gte('data_appuntamento', filtroDataDa.value)
    }
    if (filtroDataA.value) {
      query = query.lte('data_appuntamento', filtroDataA.value)
    }

    const { data, error } = await query

    if (error) throw error
    appointments.value = data || []
  } catch (error) {
    console.error('Errore nel caricamento appuntamenti:', error)
  }
}

// Salva gli orari
const salvaOrari = async () => {
  if (!user.value) return

  loading.value = true
  try {
    // Rimuovi gli slot esistenti
    await supabase
      .from('slot_disponibili')
      .delete()
      .eq('concessionario_id', user.value.id)

    // Inserisci i nuovi slot
    const slotToInsert = giorniSettimana.value
      .filter(giorno => giorno.attivo)
      .map(giorno => ({
        concessionario_id: user.value.id,
        giorno_settimana: giorno.value,
        orario_inizio: giorno.orario_inizio,
        orario_fine: giorno.orario_fine,
        slot_durata: parseInt(giorno.slot_durata),
        attivo: true
      }))

    if (slotToInsert.length > 0) {
      const { error } = await supabase
        .from('slot_disponibili')
        .insert(slotToInsert)

      if (error) throw error
    }

    alert('Orari salvati con successo!')
  } catch (error) {
    console.error('Errore nel salvataggio orari:', error)
    alert('Errore nel salvataggio. Riprova.')
  } finally {
    loading.value = false
  }
}

// Gestione eccezioni
const aggiungiEccezione = () => {
  eccezioni.value.push({
    data_inizio: '',
    data_fine: '',
    motivo: ''
  })
}

const rimuoviEccezione = (index) => {
  eccezioni.value.splice(index, 1)
}

// Gestione appuntamenti
const confermaAppuntamento = async (id) => {
  try {
    const { error } = await supabase
      .from('appuntamenti')
      .update({ stato: 'confirmed' })
      .eq('id', id)

    if (error) throw error
    await loadAppointments()
  } catch (error) {
    console.error('Errore nella conferma:', error)
  }
}

const completaAppuntamento = async (id) => {
  try {
    const { error } = await supabase
      .from('appuntamenti')
      .update({ stato: 'completed' })
      .eq('id', id)

    if (error) throw error
    await loadAppointments()
  } catch (error) {
    console.error('Errore nel completamento:', error)
  }
}

const annullaAppuntamento = async (id) => {
  try {
    const { error } = await supabase
      .from('appuntamenti')
      .update({ stato: 'cancelled' })
      .eq('id', id)

    if (error) throw error
    await loadAppointments()
  } catch (error) {
    console.error('Errore nell\'annullamento:', error)
  }
}

// Funzioni di utilità
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

// Carica i dati
onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await loadOrari()
      await loadEccezioni()
      await loadAppointments()
    } else {
      await navigateTo('/auth/login')
    }
  } catch (error) {
    console.error('Errore nel caricamento:', error)
  }
})

// Watch per i filtri
watch([filtroStato, filtroDataDa, filtroDataA], () => {
  loadAppointments()
})
</script>
