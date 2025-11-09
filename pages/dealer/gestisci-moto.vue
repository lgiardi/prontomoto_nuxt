<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <DealerHeader />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Le Tue Moto in Vendita</h1>
        <p class="text-gray-600 mt-2">Gestisci le moto che hai aggiunto al catalogo.</p>
      </div>

      <div v-if="loading" class="text-center py-10">
        <svg class="animate-spin h-8 w-8 text-[#90c149] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-3 text-gray-600">Caricamento moto...</p>
      </div>

      <div v-else-if="dealerMotos.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Nessuna moto in vendita</h3>
        <p class="text-gray-600 mb-6">Sembra che tu non abbia ancora aggiunto nessuna moto al tuo inventario.</p>
        <NuxtLink to="/dealer/aggiungi-moto" class="bg-[#90c149] text-white px-6 py-3 rounded-md hover:bg-[#7ba83a] transition-colors inline-block">
          Aggiungi la tua prima moto
        </NuxtLink>
      </div>

      <div v-else class="space-y-6">
        <div v-for="moto in dealerMotos" :key="moto.id" class="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <img 
            :src="moto.immagineUrl || 'https://via.placeholder.com/120x90'" 
            :alt="moto.marca + ' ' + moto.modello"
            class="w-32 h-24 object-cover rounded-lg flex-shrink-0"
          />
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-900">{{ moto.marca }} {{ moto.modello }} <span v-if="moto.allestimento" class="font-normal text-gray-600 text-base">({{ moto.allestimento }})</span></h3>
            <p class="text-gray-600 mt-1">{{ moto.categoria }} • {{ moto.cilindrata }}cc</p>
            <!-- Prezzi -->
            <div class="mt-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center text-gray-700">
                  <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-sm text-gray-600">Prezzo di Listino:</span>
                  <span class="font-semibold ml-2 text-gray-800">€{{ moto.prezzo?.toLocaleString() || 'N/A' }}</span>
                </div>
                <div class="flex items-center text-gray-700">
                  <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span class="text-sm text-gray-600">Il Tuo Prezzo:</span>
                  <span class="font-bold ml-2 text-[#90c149] text-lg">€{{ (moto.prezzo_speciale || moto.prezzo)?.toLocaleString() || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Dettagli del Concessionario -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div class="flex items-center text-gray-700">
                <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7V4c0-1.105 3.582-2 8-2s8 .895 8 2v3M12 20v-9"></path>
                </svg>
                <span class="text-gray-600">Quantità:</span>
                <span class="font-semibold ml-1 text-gray-800">{{ moto.quantita || 1 }}</span>
              </div>
              
              <div class="flex items-center text-gray-700">
                <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                </svg>
                <span class="text-gray-600">Colore:</span>
                <span class="font-semibold ml-1 text-gray-800">{{ moto.colore || 'Non specificato' }}</span>
              </div>
              
              <div class="flex items-center text-gray-700">
                <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <span class="text-gray-600">Promozioni:</span>
                <span class="font-semibold ml-1 text-[#90c149]">{{ getActivePromotionsCount(moto.promozioni) }} attive</span>
              </div>
              
              <div v-if="moto.note" class="flex items-center text-gray-700">
                <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                <span class="text-gray-600">Note:</span>
                <span class="font-semibold ml-1 text-gray-800">Presenti</span>
              </div>
            </div>

            <!-- Promozioni Attive -->
            <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 class="text-sm font-semibold text-green-800 mb-2">Promozioni Attive:</h4>
              <div class="flex flex-wrap gap-2">
                <template v-if="getActivePromotions(moto.promozioni).length > 0">
                  <span 
                    v-for="promo in getActivePromotions(moto.promozioni)" 
                    :key="promo"
                    class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {{ promo }}
                  </span>
                </template>
                <span v-else class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Nessuna promozione attiva
                </span>
              </div>
            </div>

            <!-- Note (se presenti) -->
            <div v-if="moto.note" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 class="text-sm font-semibold text-blue-800 mb-2">Note:</h4>
              <p class="text-sm text-blue-700">{{ moto.note }}</p>
            </div>
          </div>
          <div class="flex space-x-3 mt-4 md:mt-0 flex-shrink-0">
            <button @click="editMoto(moto.moto_id)" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm">
              Modifica
            </button>
            <button @click="confirmDelete(moto.motoConcessionariId)" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm">
              Elimina
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'dealer',
  layout: false
})

const supabase = useSupabaseClient()
const dealerData = ref(null)
const dealerMotos = ref([])
const loading = ref(true)
const user = ref(null)

// Funzione per caricare i dati del concessionario
const loadDealerData = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('concessionari')
      .select('nome')
      .eq('user_id', user.value.id)
      .single()

    if (error) throw error
    dealerData.value = data
  } catch (error) {
    console.error('Errore nel caricamento dati concessionario:', error)
  }
}

// Funzione per caricare le moto del concessionario
const loadDealerMotos = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    console.log('🔍 Caricamento moto del concessionario...')
    
    // Prima ottieni l'ID del concessionario dalla tabella concessionari
    const { data: concessionario, error: dealerError } = await supabase
      .from('concessionari')
      .select('id')
      .eq('user_id', user.value.id)
      .single()
    
    if (dealerError) {
      console.error('❌ Errore nel caricamento concessionario:', dealerError)
      throw dealerError
    }
    
    console.log('🏢 Concessionario ID:', concessionario.id)
    
    // 1. Recupera le relazioni moto_concessionari per questo concessionario
    const { data: motoConcessionari, error: mcError } = await supabase
      .from('moto_concessionari')
      .select('*')
      .eq('concessionario_id', concessionario.id)

    if (mcError) {
      console.error('❌ Errore nel caricamento moto_concessionari:', mcError)
      throw mcError
    }

    console.log('📊 Moto concessionari trovate:', motoConcessionari)

    if (motoConcessionari.length === 0) {
      dealerMotos.value = []
      loading.value = false
      return
    }

    // 2. Recupera i dettagli delle moto da Supabase usando gli ID
    const motoIds = motoConcessionari.map(mc => mc.moto_id)
    console.log('📝 Moto IDs da cercare:', motoIds)
    
    // Recupera le moto da Supabase
    const { data: motosFromSupabase, error: motosError } = await supabase
      .from('moto')
      .select('*')
      .in('id', motoIds)

    if (motosError) {
      console.error('❌ Errore nel caricamento moto da Supabase:', motosError)
      throw motosError
    }

    console.log('📊 Moto da Supabase:', motosFromSupabase)

    // 3. Combina i dati di Supabase con i dati specifici del concessionario
    dealerMotos.value = motoConcessionari.map(mc => {
      const supabaseMoto = motosFromSupabase.find(sm => sm.id === mc.moto_id)
      const combinedMoto = {
        ...supabaseMoto, // Dati da Supabase (marca, modello, allestimento, categoria, cilindrata, immagine_copertina)
        ...mc, // Dati da moto_concessionari (id, prezzo_speciale, quantita, colore, promozioni, note, foto_principale, foto_gallery)
        // Preserva l'ID del record moto_concessionari per l'eliminazione
        motoConcessionariId: mc.id,
        motoId: mc.moto_id,
        immagineUrl: supabaseMoto?.immagine_copertina, // Mappa il campo corretto
        // Assicurati che il prezzo_speciale abbia la precedenza sul prezzo di listino
        prezzo_speciale: mc.prezzo_speciale
      }
      console.log('🔍 Moto combinata:', {
        motoConcessionariId: mc.id,
        motoId: mc.moto_id,
        combinedId: combinedMoto.id,
        marca: combinedMoto.marca,
        modello: combinedMoto.modello,
        prezzoListino: combinedMoto.prezzo,
        prezzoSpeciale: combinedMoto.prezzo_speciale,
        colore: combinedMoto.colore
      })
      console.log('🔍 Record moto_concessionari completo:', mc)
      return combinedMoto
    })
    
    console.log('✅ Moto del concessionario caricate:', dealerMotos.value)

  } catch (error) {
    console.error('❌ Errore nel caricamento delle moto del concessionario:', error)
    alert('Errore nel caricamento delle tue moto. Riprova.')
  } finally {
    loading.value = false
  }
}

// Funzioni per gestire le promozioni
const getActivePromotionsCount = (promozioniJson) => {
  if (!promozioniJson) return 0
  try {
    const promozioni = typeof promozioniJson === 'string' ? JSON.parse(promozioniJson) : promozioniJson
    return Object.values(promozioni).filter(Boolean).length
  } catch (e) {
    return 0
  }
}

const getActivePromotions = (promozioniJson) => {
  if (!promozioniJson) return []
  try {
    const promozioni = typeof promozioniJson === 'string' ? JSON.parse(promozioniJson) : promozioniJson
    const activePromotions = []
    
    if (promozioni.bollaInclusa) activePromotions.push('Bolla inclusa')
    if (promozioni.messaSuStrada) activePromotions.push('Messa su strada gratis')
    if (promozioni.garanziaEstesa) activePromotions.push('Garanzia estesa 2 anni')
    if (promozioni.primaRevisione) activePromotions.push('Prima revisione gratis')
    if (promozioni.assicurazioneScontata) activePromotions.push('Assicurazione scontata')
    
    return activePromotions
  } catch (e) {
    return []
  }
}

const editMoto = (motoId) => {
  console.log('Modifica moto:', motoId)
  navigateTo('/dealer/modifica-moto/' + motoId)
}

const confirmDelete = async (motoId) => {
  console.log('🔍 ID ricevuto per eliminazione:', motoId)
  console.log('🔍 Tipo ID:', typeof motoId)
  if (confirm('Sei sicuro di voler eliminare questa moto dal tuo inventario?')) {
    await deleteMoto(motoId)
  }
}

const deleteMoto = async (motoId) => {
  try {
    console.log('🗑️ Eliminazione moto con ID:', motoId)
    console.log('👤 User ID:', user.value?.id)
    
    // Usa l'endpoint API server-side per bypassare RLS
    const response = await $fetch('/api/dealer/delete-moto', {
      method: 'POST',
      body: {
        motoId: motoId,
        userId: user.value.id
      }
    })

    console.log('✅ Risposta API eliminazione:', response)
    alert('Moto eliminata con successo!')
    await loadDealerMotos() // Ricarica la lista delle moto

  } catch (error) {
    console.error('❌ Errore nell\'eliminazione della moto:', error)
    alert('Errore nell\'eliminazione della moto: ' + error.message)
  }
}


onMounted(async () => {
  try {
    console.log('🚀 Inizio caricamento gestisci-moto...')
    
    // Carica l'utente usando il session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('📊 Sessione ricevuta:', session)
    console.log('❌ Errore sessione:', sessionError)
    
    if (session && session.user) {
      user.value = session.user
      console.log('👤 User caricato da sessione:', user.value)
      console.log('✅ User ID:', user.value?.id)
      
      await loadDealerData()
      await loadDealerMotos()
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
    await loadDealerMotos()
  } catch (error) {
    console.error('❌ Errore generale in gestisci-moto:', error)
    alert('Errore nel caricamento. Ricarica la pagina.')
  }
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>