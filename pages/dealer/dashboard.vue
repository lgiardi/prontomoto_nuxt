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

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-600">
              Benvenuto, <span class="font-medium">{{ dealerData?.nome }}</span>
            </div>
            <button 
              @click="handleLogout"
              class="text-gray-500 hover:text-gray-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Concessionario</h1>
        <p class="text-gray-600 mt-2">Gestisci la tua concessionaria e le tue moto</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Moto in Vendita -->
        <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-sm font-medium">🏍️</span>
              </div>
          </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Moto in Vendita</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.motoInVendita }}</p>
          </div>
        </div>
      </div>

        <!-- Contatti Ricevuti -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 text-sm font-medium">📞</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Contatti Ricevuti</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.contattiRicevuti }}</p>
            </div>
          </div>
        </div>

        <!-- Appuntamenti -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span class="text-yellow-600 text-sm font-medium">📅</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Appuntamenti</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.appuntamenti }}</p>
            </div>
          </div>
        </div>

        <!-- Visualizzazioni -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span class="text-purple-600 text-sm font-medium">👁️</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Visualizzazioni</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.visualizzazioni }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex space-x-4">
            <NuxtLink to="/dealer/aggiungi-moto" class="bg-[#90c149] text-white px-6 py-3 rounded-md hover:bg-[#7ba83a] transition-colors inline-block text-center">
              Aggiungi Moto
            </NuxtLink>
            <NuxtLink to="/dealer/gestisci-moto" class="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors inline-block text-center">
              Gestisci Moto
            </NuxtLink>
          </div>
          <button class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            Gestisci Lead
          </button>
          <button class="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors">
            Modifica Profilo
          </button>
        </div>
      </div>

      <!-- Top Moto -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Le Tue Moto Più Visualizzate</h2>
        <div v-if="topMoto.length > 0" class="space-y-4">
          <div v-for="moto in topMoto" :key="moto.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-4">
              <img :src="moto.immagine" :alt="moto.marca + ' ' + moto.modello" class="w-16 h-16 object-cover rounded">
              <div>
                <h3 class="font-medium text-gray-900">{{ moto.marca }} {{ moto.modello }}</h3>
                <p class="text-sm text-gray-500">{{ moto.anno }} • {{ moto.km }} km</p>
              </div>
        </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Visualizzazioni</p>
              <p class="font-semibold text-gray-900">{{ moto.visualizzazioni }}</p>
          </div>
                </div>
              </div>
        <div v-else class="text-center py-8 text-gray-500">
          <p>Nessuna moto ancora visualizzata</p>
        </div>
              </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Attività Recente</h2>
        <div v-if="recentActivity.length > 0" class="space-y-4">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center space-x-4 p-4 border rounded-lg">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span class="text-gray-600 text-sm">📊</span>
              </div>
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-900">{{ activity.description }}</p>
              <p class="text-xs text-gray-500">{{ activity.timestamp }}</p>
          </div>
        </div>
      </div>
        <div v-else class="text-center py-8 text-gray-500">
          <p>Nessuna attività recente</p>
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
const dealerData = ref(null)
const loading = ref(true)

// Inizializza Supabase
const supabase = useSupabaseClient()

// Stats
const stats = ref({
  motoInVendita: 0,
  contattiRicevuti: 0,
  appuntamenti: 0,
  visualizzazioni: 0
})

// Top moto
const topMoto = ref([])

// Recent activity
const recentActivity = ref([])

// Carica i dati del concessionario
const loadDealerData = async () => {
  console.log('🔍 loadDealerData chiamata, user.value:', user.value)
  
  if (!user.value) {
    console.log('❌ User non disponibile in loadDealerData')
    return
  }

  try {
    console.log('📊 Caricamento dati concessionario per user ID:', user.value.id)
    const { data, error } = await supabase
      .from('concessionari')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) {
      console.error('❌ Errore Supabase in loadDealerData:', error)
      
      // Se l'utente non esiste nella tabella concessionari, crealo
      if (error.code === 'PGRST116') {
        console.log('🔄 Utente non trovato nella tabella concessionari, creazione...')
        const { data: newDealer, error: insertError } = await supabase
          .from('concessionari')
          .insert({
            id: user.value.id,
            nome: user.value.user_metadata?.nome || user.value.email?.split('@')[0] || 'Concessionario',
            email: user.value.email,
            telefono: user.value.user_metadata?.telefono || null,
            citta: user.value.user_metadata?.citta || 'Milano',
            provincia: user.value.user_metadata?.provincia || 'MI',
            indirizzo: user.value.user_metadata?.indirizzo || null,
            cap: user.value.user_metadata?.cap || null,
            tipo: 'concessionario'
          })
          .select()
          .single()

        if (insertError) {
          console.error('❌ Errore nella creazione del concessionario:', insertError)
          throw insertError
        }
        
        console.log('✅ Concessionario creato:', newDealer)
        dealerData.value = newDealer
        return
      }
      
      throw error
    }
    
    console.log('✅ Dati concessionario caricati:', data)
    dealerData.value = data
  } catch (error) {
    console.error('❌ Errore nel caricamento dati concessionario:', error)
    console.error('❌ Stack trace:', error.stack)
  }
}

// Carica le statistiche
const loadStats = async () => {
  if (!user.value) return

  try {
    console.log('📊 Caricamento statistiche reali...')
    
    // 1. Conta le moto in vendita
    const { count: motoCount, error: motoError } = await supabase
      .from('moto_concessionari')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', user.value.id)
      .eq('disponibile', true)

    if (motoError) throw motoError

    // 2. Conta i lead ricevuti
    const { count: leadCount, error: leadError } = await supabase
      .from('lead')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', user.value.id)

    if (leadError) throw leadError

    // 3. Conta gli appuntamenti (lead con status 'contacted')
    const { count: appuntamentiCount, error: appuntamentiError } = await supabase
      .from('lead')
      .select('*', { count: 'exact', head: true })
      .eq('concessionario_id', user.value.id)
      .eq('status', 'contacted')

    if (appuntamentiError) throw appuntamentiError

    // 4. Simula le visualizzazioni (per ora)
    const visualizzazioni = Math.floor(Math.random() * 1000) + 100

    stats.value = {
      motoInVendita: motoCount || 0,
      contattiRicevuti: leadCount || 0,
      appuntamenti: appuntamentiCount || 0,
      visualizzazioni: visualizzazioni
    }

    console.log('✅ Statistiche caricate:', stats.value)
  } catch (error) {
    console.error('❌ Errore nel caricamento statistiche:', error)
    // Fallback ai valori di default
    stats.value = {
      motoInVendita: 0,
      contattiRicevuti: 0,
      appuntamenti: 0,
      visualizzazioni: 0
    }
  }
}

// Carica le top moto
const loadTopMoto = async () => {
  if (!user.value) return

  try {
    console.log('📊 Caricamento top moto...')
    
    // Recupera le moto del concessionario con i dettagli
    const { data: motoConcessionari, error: mcError } = await supabase
      .from('moto_concessionari')
      .select('*')
      .eq('concessionario_id', user.value.id)
      .eq('disponibile', true)
      .limit(5)

    if (mcError) throw mcError

    if (motoConcessionari.length === 0) {
      topMoto.value = []
      return
    }

    // Recupera i dettagli delle moto da Sanity
    const motoIds = motoConcessionari.map(mc => mc.moto_id)
    const motosFromSanity = await $fetch('/api/motos', {
      method: 'GET',
      query: { 
        ids: motoIds.join(',')
      }
    })

    // Combina i dati e simula visualizzazioni/contatti
    topMoto.value = motoConcessionari.map(mc => {
      const sanityMoto = motosFromSanity.find(sm => sm._id === mc.moto_id)
      return {
        id: mc.id,
        marca: sanityMoto?.marca || 'Sconosciuta',
        modello: sanityMoto?.modello || 'Sconosciuto',
        anno: 2024,
        km: '0',
        immagine: sanityMoto?.immagineUrl || 'https://via.placeholder.com/150',
        visualizzazioni: Math.floor(Math.random() * 200) + 50
      }
    })

    console.log('✅ Top moto caricate:', topMoto.value)
  } catch (error) {
    console.error('❌ Errore nel caricamento top moto:', error)
    topMoto.value = []
  }
}

// Carica l'attività recente
const loadRecentActivity = async () => {
  // Simula il caricamento dell'attività recente
  recentActivity.value = [
    {
      id: 1,
      description: 'Nuova moto aggiunta: Honda CBR 600RR',
      timestamp: '2 ore fa'
    },
    {
      id: 2,
      description: 'Contatto ricevuto per Yamaha R1',
      timestamp: '4 ore fa'
    },
    {
      id: 3,
      description: 'Appuntamento fissato per domani',
      timestamp: '1 giorno fa'
    }
  ]
}

// Logout
const handleLogout = async () => {
  try {
    const { signOut } = useSupabase()
    await signOut()
    await navigateTo('/')
  } catch (error) {
    console.error('Errore durante il logout:', error)
  }
}

// Carica tutti i dati
onMounted(async () => {
  try {
    console.log('🚀 Inizio caricamento dashboard...')
    
    // Prova prima con getSession
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('📊 Sessione ricevuta:', session)
    console.log('❌ Errore sessione:', sessionError)
    
    if (session && session.user) {
      user.value = session.user
      console.log('👤 User caricato da sessione:', user.value)
      console.log('✅ User ID:', user.value?.id)
      
      await loadDealerData()
      await loadStats()
      await loadTopMoto()
      await loadRecentActivity()
      
      loading.value = false
      return
    }
    
    // Se non c'è sessione, prova con getUser
    console.log('🔄 Tentativo con getUser...')
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
    console.log('👤 User da getUser:', currentUser)
    console.log('❌ Errore getUser:', userError)
    
    if (userError) {
      console.error('❌ Errore nel caricamento utente:', userError)
      alert('Errore nel caricamento utente. Ricarica la pagina.')
      return
    }
    
    if (!currentUser) {
      console.log('❌ Nessun utente trovato, redirect a login')
      await navigateTo('/auth/login')
      return
    }
    
    user.value = currentUser
    console.log('👤 User caricato da getUser:', user.value)
    console.log('✅ User ID:', user.value?.id)
    
    await loadDealerData()
    await loadStats()
    await loadTopMoto()
    await loadRecentActivity()
    
    loading.value = false
  } catch (error) {
    console.error('❌ Errore generale in dashboard:', error)
    console.error('❌ Stack trace:', error.stack)
    console.error('❌ Error message:', error.message)
    alert('Errore nel caricamento. Ricarica la pagina.')
  }
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>