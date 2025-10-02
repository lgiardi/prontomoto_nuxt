<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/dealer/dashboard" class="flex items-center text-gray-700 hover:text-[#90c149]">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span class="font-medium">Torna alla Dashboard</span>
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
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestisci le Tue Moto</h1>
        <p class="text-gray-600 mt-2">Visualizza e gestisci le moto che hai aggiunto al tuo inventario.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149]"></div>
      </div>

      <!-- Moto List -->
      <div v-else-if="motoConcessionario.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="moto in motoConcessionario" 
          :key="moto.id"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <!-- Moto Image -->
          <div class="aspect-w-16 aspect-h-9">
            <img 
              :src="moto.moto?.immagineUrl || 'https://via.placeholder.com/400x300'" 
              :alt="moto.moto?.marca + ' ' + moto.moto?.modello"
              class="w-full h-48 object-cover rounded-t-lg"
            />
          </div>

          <!-- Moto Info -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ moto.moto?.marca }} {{ moto.moto?.modello }}
            </h3>
            
            <div v-if="moto.moto?.allestimento" class="text-sm text-gray-600 mb-3">
              {{ moto.moto.allestimento }}
            </div>

            <!-- Prezzo -->
            <div class="mb-4">
              <div class="text-2xl font-bold text-gray-900">
                €{{ moto.prezzo_speciale?.toLocaleString() || 'N/A' }}
              </div>
              <div v-if="moto.moto?.prezzo" class="text-sm text-gray-500">
                Prezzo listino: €{{ moto.moto.prezzo.toLocaleString() }}
              </div>
            </div>

            <!-- Dettagli -->
            <div class="space-y-2 mb-4">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Quantità:</span>
                <span class="text-sm font-medium">{{ moto.quantita }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Colore:</span>
                <span class="text-sm font-medium">{{ moto.colore }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Disponibile:</span>
                <span class="text-sm font-medium" :class="moto.disponibile ? 'text-green-600' : 'text-red-600'">
                  {{ moto.disponibile ? 'Sì' : 'No' }}
                </span>
              </div>
            </div>

            <!-- Promozioni -->
            <div v-if="moto.promozioni && Object.values(moto.promozioni).some(p => p)" class="mb-4">
              <div class="text-sm font-medium text-gray-700 mb-2">Promozioni:</div>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-if="moto.promozioni.bollaInclusa" 
                  class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  Bolla inclusa
                </span>
                <span 
                  v-if="moto.promozioni.messaSuStrada" 
                  class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  Messa su strada gratis
                </span>
                <span 
                  v-if="moto.promozioni.garanziaEstesa" 
                  class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  Garanzia estesa
                </span>
                <span 
                  v-if="moto.promozioni.primaRevisione" 
                  class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  Prima revisione gratis
                </span>
                <span 
                  v-if="moto.promozioni.assicurazioneScontata" 
                  class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  Assicurazione scontata
                </span>
              </div>
            </div>

            <!-- Note -->
            <div v-if="moto.note" class="mb-4">
              <div class="text-sm text-gray-600">
                <strong>Note:</strong> {{ moto.note }}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2">
              <button 
                @click="editMoto(moto)"
                class="flex-1 bg-[#90c149] text-white px-4 py-2 rounded-lg hover:bg-[#7ba83a] transition-colors text-sm font-medium"
              >
                Modifica
              </button>
              <button 
                @click="deleteMoto(moto.id)"
                class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nessuna moto aggiunta</h3>
        <p class="mt-1 text-sm text-gray-500">Inizia aggiungendo la tua prima moto.</p>
        <div class="mt-6">
          <NuxtLink 
            to="/dealer/aggiungi-moto"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#90c149] hover:bg-[#7ba83a]"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Aggiungi Prima Moto
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabaseUser, useSupabase } from '#imports'

definePageMeta({
  middleware: 'auth',
  layout: false
})

const { user } = useSupabaseUser()
const supabase = useSupabase()
const loading = ref(true)
const dealerData = ref(null)
const motoConcessionario = ref([])

// Load dealer data
const loadDealerData = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('concessionari')
      .select('nome')
      .eq('id', user.value.id)
      .single()

    if (error) throw error
    dealerData.value = data
  } catch (error) {
    console.error('Errore nel caricamento dati concessionario:', error)
  }
}

// Load moto from concessionario
const loadMotoConcessionario = async () => {
  if (!user.value) return

  try {
    const { data, error } = await supabase
      .from('moto_concessionari')
      .select(`
        *,
        moto:moto_id
      `)
      .eq('concessionario_id', user.value.id)

    if (error) throw error

    // Per ogni moto, carica i dettagli da Sanity
    const motoWithDetails = await Promise.all(
      data.map(async (moto) => {
        try {
          // Carica i dettagli della moto da Sanity
          const motoDetails = await $fetch(`/api/motos/${moto.moto_id}`)
          return {
            ...moto,
            moto: motoDetails,
            promozioni: moto.promozioni ? JSON.parse(moto.promozioni) : {}
          }
        } catch (error) {
          console.error('Errore nel caricamento dettagli moto:', error)
          return {
            ...moto,
            moto: null,
            promozioni: moto.promozioni ? JSON.parse(moto.promozioni) : {}
          }
        }
      })
    )

    motoConcessionario.value = motoWithDetails
  } catch (error) {
    console.error('Errore nel caricamento moto concessionario:', error)
  } finally {
    loading.value = false
  }
}

// Edit moto
const editMoto = (moto) => {
  // TODO: Implementare modifica moto
  alert('Funzione di modifica in sviluppo')
}

// Delete moto
const deleteMoto = async (motoId) => {
  if (!confirm('Sei sicuro di voler eliminare questa moto?')) return

  try {
    const { error } = await supabase
      .from('moto_concessionari')
      .delete()
      .eq('id', motoId)

    if (error) throw error

    alert('Moto eliminata con successo!')
    await loadMotoConcessionario()
  } catch (error) {
    console.error('Errore nell\'eliminazione della moto:', error)
    alert('Errore nell\'eliminazione della moto. Riprova.')
  }
}

// Handle logout
const handleLogout = async () => {
  try {
    const { signOut } = supabase
    await signOut()
    await navigateTo('/')
  } catch (error) {
    console.error('Errore durante il logout:', error)
  }
}

onMounted(async () => {
  await loadDealerData()
  await loadMotoConcessionario()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
