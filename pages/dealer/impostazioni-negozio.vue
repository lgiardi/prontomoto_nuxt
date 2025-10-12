<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <DealerHeader />

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Impostazioni Negozio</h1>
        <p class="text-gray-600 mt-2">Gestisci le informazioni pubbliche del tuo negozio</p>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Informazioni Negozio</h2>
          <p class="mt-1 text-sm text-gray-500">Modifica i dettagli del tuo concessionario</p>
      </div>

        <form @submit.prevent="updateDealerData" class="p-6 space-y-6">
          <!-- Informazioni Base -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="nome" class="block text-sm font-medium text-gray-700">Nome Negozio *</label>
              <input
                id="nome"
                v-model="form.nome"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email Pubblica</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              />
            </div>

            <div>
              <label for="telefono" class="block text-sm font-medium text-gray-700">Telefono</label>
              <input
                id="telefono"
                v-model="form.telefono"
                type="tel"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              />
            </div>

            <div>
              <label for="partita_iva" class="block text-sm font-medium text-gray-700">Partita IVA</label>
              <input
                id="partita_iva"
                v-model="form.partita_iva"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              />
            </div>
          </div>

          <!-- Indirizzo -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="via" class="block text-sm font-medium text-gray-700">Via/Indirizzo</label>
              <input
                id="via"
                v-model="form.via"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              />
            </div>

            <div>
              <label for="citta" class="block text-sm font-medium text-gray-700">Città</label>
              <input
                id="citta"
                v-model="form.citta"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              />
            </div>

            <div>
              <label for="provincia" class="block text-sm font-medium text-gray-700">Provincia</label>
              <input
                id="provincia"
                v-model="form.provincia"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="regione" class="block text-sm font-medium text-gray-700">Regione</label>
            <input
              id="regione"
              v-model="form.regione"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
            />
          </div>

          <!-- Informazioni Aggiuntive -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="pec" class="block text-sm font-medium text-gray-700">PEC</label>
              <input
                id="pec"
                v-model="form.pec"
                type="email"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              />
            </div>

            <div>
              <label for="anno_fondazione" class="block text-sm font-medium text-gray-700">Anno Fondazione</label>
              <input
                id="anno_fondazione"
                v-model="form.anno_fondazione"
                type="number"
                min="1900"
                :max="new Date().getFullYear()"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              />
            </div>

            <div>
              <label for="dimensione" class="block text-sm font-medium text-gray-700">Dimensione</label>
              <select
                id="dimensione"
                v-model="form.dimensione"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              >
                <option value="">Seleziona dimensione</option>
                <option value="piccolo">Piccolo (1-5 dipendenti)</option>
                <option value="medio">Medio (6-20 dipendenti)</option>
                <option value="grande">Grande (20+ dipendenti)</option>
              </select>
            </div>

              <div>
              <label for="tipo_concessionario" class="block text-sm font-medium text-gray-700">Tipo Concessionario</label>
              <select
                id="tipo_concessionario"
                v-model="form.tipo_concessionario"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              >
                <option value="">Seleziona tipo</option>
                <option value="ufficiale">Ufficiale</option>
                <option value="autorizzato">Autorizzato</option>
                <option value="multimarca">Multimarca</option>
                <option value="usato">Specializzato Usato</option>
              </select>
                </div>
              </div>

          <div>
            <label for="specializzazione" class="block text-sm font-medium text-gray-700">Specializzazione</label>
            <input
              id="specializzazione"
              v-model="form.specializzazione"
              type="text"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              placeholder="es. Moto da corsa, Enduro, Scooter..."
            />
          </div>

          <!-- Descrizione -->
          <div>
            <label for="descrizione" class="block text-sm font-medium text-gray-700">Descrizione</label>
            <textarea
              id="descrizione"
              v-model="form.descrizione"
              rows="4"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              placeholder="Descrivi il tuo negozio, i servizi offerti, la tua esperienza..."
            ></textarea>
          </div>

          <!-- Social Media -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label for="facebook" class="block text-sm font-medium text-gray-700">Facebook</label>
              <input
                id="facebook"
                v-model="form.facebook"
                type="url"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
                placeholder="https://facebook.com/tuonegozio"
              />
            </div>

              <div>
              <label for="instagram" class="block text-sm font-medium text-gray-700">Instagram</label>
              <input
                id="instagram"
                v-model="form.instagram"
                type="url"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
                placeholder="https://instagram.com/tuonegozio"
              />
                </div>

            <div>
              <label for="youtube" class="block text-sm font-medium text-gray-700">YouTube</label>
              <input
                id="youtube"
                v-model="form.youtube"
                type="url"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
                placeholder="https://youtube.com/tuonegozio"
              />
              </div>
            </div>
            
          <!-- Video Presentazione -->
          <div>
            <label for="video_presentazione" class="block text-sm font-medium text-gray-700">Video Presentazione</label>
            <input
              id="video_presentazione"
              v-model="form.video_presentazione"
              type="url"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#90c149] focus:border-[#90c149] sm:text-sm"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <!-- Marchi Trattati -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Marchi Trattati</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label v-for="marchio in marchiDisponibili" :key="marchio" class="flex items-center">
                <input
                  v-model="form.marchi_trattati"
                  :value="marchio"
                  type="checkbox"
                  class="h-4 w-4 text-[#90c149] focus:ring-[#90c149] border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">{{ marchio }}</span>
              </label>
            </div>
          </div>

          <!-- Servizi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Servizi Offerti</label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label v-for="servizio in serviziDisponibili" :key="servizio" class="flex items-center">
                <input
                  v-model="form.servizi"
                  :value="servizio"
                  type="checkbox"
                  class="h-4 w-4 text-[#90c149] focus:ring-[#90c149] border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">{{ servizio }}</span>
              </label>
            </div>
          </div>

          <!-- Informazioni Abbonamento (Read Only) -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Piano Abbonamento</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Piano Attuale</label>
                <div class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900">
                  {{ getPlanLabel(form.subscription_plan) }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Stato</label>
                <div class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900">
                  {{ getStatusLabel(form.subscription_status) }}
                </div>
              </div>
          </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="mt-4">
        <div :class="[
          'p-4 rounded-md',
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        ]">
          {{ message.text }}
        </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-[#90c149] text-white rounded-md hover:bg-[#7ba83a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Salvataggio...' : 'Salva Modifiche' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
// Protezione della pagina
definePageMeta({
  middleware: 'dealer',
  layout: false
})

const user = ref(null)
const dealerData = ref(null)
const loading = ref(false)
const message = ref(null)

// Form data
const form = ref({
  nome: '',
  email: '',
  telefono: '',
  via: '',
  citta: '',
  provincia: '',
  regione: '',
  partita_iva: '',
  pec: '',
  descrizione: '',
  anno_fondazione: '',
  dimensione: '',
  tipo_concessionario: '',
  specializzazione: '',
  facebook: '',
  instagram: '',
  youtube: '',
  video_presentazione: '',
  marchi_trattati: [],
  servizi: [],
  subscription_plan: 'basic',
  subscription_status: 'inactive'
})

// Opzioni disponibili
const marchiDisponibili = [
  'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Ducati', 'BMW', 'KTM', 'Aprilia',
  'Triumph', 'Harley-Davidson', 'MV Agusta', 'Moto Guzzi', 'Benelli', 'CFMoto',
  'GasGas', 'Husqvarna', 'Beta', 'Sherco', 'TM Racing', 'Piaggio', 'Vespa',
  'Gilera', 'Derbi', 'Aprilia', 'Moto Morini', 'Cagiva', 'Bimota'
]

const serviziDisponibili = [
  'Vendita Nuovo', 'Vendita Usato', 'Ricambi Originali', 'Ricambi Aftermarket',
  'Assistenza Tecnica', 'Revisioni', 'Tagliandi', 'Riparazioni',
  'Assicurazioni', 'Finanziamenti', 'Permute', 'Consegna a Domicilio',
  'Test Drive', 'Garanzia Estesa', 'Servizio Post-Vendita', 'Corsi di Guida'
]

// Inizializza Supabase
const supabase = useSupabaseClient()

// Carica i dati del concessionario
const loadDealerData = async () => {
  try {
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !currentUser) {
      await navigateTo('/auth/login')
      return
    }
    
    user.value = currentUser
    
    // Carica i dati del concessionario
    const { data, error } = await supabase
      .from('concessionari')
      .select('*')
      .eq('user_id', currentUser.id)
      .single()

    if (error) {
      console.error('Errore nel caricamento dati concessionario:', error)
      message.value = {
        type: 'error',
        text: 'Errore nel caricamento dei dati del concessionario'
      }
      return
    }
    
    dealerData.value = data
    
    // Popola il form
    form.value = {
      nome: data.nome || '',
      email: data.email || '',
      telefono: data.telefono || '',
      via: data.via || '',
      citta: data.citta || '',
      provincia: data.provincia || '',
      regione: data.regione || '',
      partita_iva: data.partita_iva || '',
      pec: data.pec || '',
      descrizione: data.descrizione || '',
      anno_fondazione: data.anno_fondazione || '',
      dimensione: data.dimensione || '',
      tipo_concessionario: data.tipo_concessionario || '',
      specializzazione: data.specializzazione || '',
      facebook: data.facebook || '',
      instagram: data.instagram || '',
      youtube: data.youtube || '',
      video_presentazione: data.video_presentazione || '',
      marchi_trattati: Array.isArray(data.marchi_trattati) ? data.marchi_trattati : [],
      servizi: Array.isArray(data.servizi) ? data.servizi : [],
      subscription_plan: data.subscription_plan || 'basic',
      subscription_status: data.subscription_status || 'inactive'
    }
    
  } catch (error) {
    console.error('Errore nel caricamento dati:', error)
    message.value = {
      type: 'error',
      text: 'Errore nel caricamento dei dati'
    }
  }
}

// Aggiorna i dati del concessionario
const updateDealerData = async () => {
  if (!user.value) return
  
  loading.value = true
  message.value = null
  
  try {
    // Pulisce i dati prima del salvataggio
    const cleanData = {
      nome: form.value.nome || null,
      email: form.value.email || null,
      telefono: form.value.telefono || null,
      via: form.value.via || null,
      citta: form.value.citta || null,
      provincia: form.value.provincia || null,
      regione: form.value.regione || null,
      partita_iva: form.value.partita_iva || null,
      pec: form.value.pec || null,
      descrizione: form.value.descrizione || null,
      anno_fondazione: form.value.anno_fondazione ? parseInt(form.value.anno_fondazione) : null,
      dimensione: form.value.dimensione || null,
      tipo_concessionario: form.value.tipo_concessionario || null,
      specializzazione: form.value.specializzazione || null,
      facebook: form.value.facebook || null,
      instagram: form.value.instagram || null,
      youtube: form.value.youtube || null,
      video_presentazione: form.value.video_presentazione || null,
      marchi_trattati: Array.isArray(form.value.marchi_trattati) ? form.value.marchi_trattati : [],
      servizi: Array.isArray(form.value.servizi) ? form.value.servizi : []
    }

    console.log('Dati da salvare:', cleanData)
    console.log('User ID corrente:', user.value.id)

    // Usa l'API endpoint per aggiornare i dati
    const result = await $fetch('/api/dealer/profile', {
      method: 'PUT',
      body: {
        user_id: user.value.id,
        updateData: cleanData
      }
    })

    if (!result.success) {
      throw new Error(result.error || 'Errore nell\'aggiornamento')
    }

    console.log('Aggiornamento completato:', result)
    
    message.value = {
      type: 'success',
      text: 'Impostazioni negozio aggiornate con successo!'
    }
    
    // Ricarica i dati
    await loadDealerData()
    
    // Nasconde il messaggio di successo dopo 5 secondi
    setTimeout(() => {
      message.value = null
    }, 5000)
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento:', error)
    message.value = {
      type: 'error',
      text: error.message || 'Errore nell\'aggiornamento delle impostazioni'
    }
  } finally {
    loading.value = false
  }
}

// Funzioni di utilità
const getPlanLabel = (plan) => {
  const plans = {
    'basic': 'Basic',
    'professional': 'Professional',
    'enterprise': 'Enterprise'
  }
  return plans[plan] || 'Basic'
}

const getStatusLabel = (status) => {
  const statuses = {
    'active': 'Attivo',
    'inactive': 'Inattivo',
    'cancelled': 'Cancellato'
  }
  return statuses[status] || 'Inattivo'
}

// Carica i dati al mount
onMounted(() => {
  loadDealerData()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
