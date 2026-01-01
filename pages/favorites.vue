<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <NuxtLink to="/dashboard" class="text-2xl font-bold text-gray-900">
              ← Dashboard
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Le Mie Moto Preferite</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto"></div>
        <p class="mt-3 text-gray-600">Caricamento preferiti...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="preferiti.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <div class="text-6xl mb-4">❤️</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Nessuna moto nei preferiti</h3>
        <p class="text-gray-600 mb-6">Inizia ad aggiungere moto ai tuoi preferiti per tenerle sempre a portata di mano!</p>
        <NuxtLink 
          to="/" 
          class="inline-block bg-[#90c149] text-white px-6 py-3 rounded-md hover:bg-[#7ba83a] transition-colors"
        >
          Cerca Moto
        </NuxtLink>
      </div>

      <!-- Preferiti Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="moto in preferiti" 
          :key="moto.preferito_id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          <!-- Immagine -->
          <div class="relative h-48 bg-gray-200">
            <img 
              v-if="moto.foto && moto.foto.length > 0"
              :src="moto.foto[0]" 
              :alt="`${moto.marca} ${moto.modello}`"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <span class="text-4xl">🏍️</span>
            </div>
            
            <!-- Badge Tipo -->
            <div class="absolute top-2 right-2">
              <span 
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  moto.tipo === 'nuova' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                ]"
              >
                {{ moto.tipo === 'nuova' ? 'Nuova' : 'Usata' }}
              </span>
            </div>

            <!-- Pulsante Rimuovi -->
            <button
              @click="rimuoviPreferito(moto)"
              class="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              title="Rimuovi dai preferiti"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Dettagli -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-1">
              {{ moto.marca }} {{ moto.modello }}
            </h3>
            
            <div v-if="moto.tipo === 'usata'" class="text-sm text-gray-600 mb-2">
              <p>{{ moto.anno }} · {{ moto.km?.toLocaleString('it-IT') }} km</p>
              <p class="capitalize">{{ moto.condizione }}</p>
            </div>

            <div class="flex items-center justify-between mt-3">
              <p class="text-lg font-bold text-[#90c149]">
                € {{ moto.prezzo?.toLocaleString('it-IT') || 'N/A' }}
              </p>
              
              <NuxtLink 
                :to="moto.tipo === 'nuova' ? `/${moto.slug}` : `/moto-usate/${moto.marca}/${moto.modello}`"
                class="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Vedi dettagli →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Protezione della pagina
definePageMeta({
  middleware: 'auth',
  layout: false
})

const supabase = useSupabaseClient()
const { user } = useSupabaseUser()

const loading = ref(true)
const preferiti = ref([])

// Carica i preferiti
const caricaPreferiti = async () => {
  if (!user.value) {
    await navigateTo('/auth/login')
    return
  }

  try {
    loading.value = true

    // Recupera l'ID utente dalla tabella utenti
    const { data: utenteData, error: utenteError } = await supabase
      .from('utenti')
      .select('id')
      .eq('id', user.value.id)
      .maybeSingle()

    if (utenteError) {
      console.error('❌ Errore recupero utente:', utenteError)
      // Usa comunque l'ID dell'utente autenticato
    }

    const utenteId = utenteData?.id || user.value.id

    const response = await $fetch('/api/preferiti', {
      query: {
        utenteId: utenteId
      }
    })

    if (response.success) {
      preferiti.value = response.preferiti || []
      console.log('✅ Preferiti caricati:', preferiti.value.length)
    } else {
      console.error('❌ Risposta API non valida:', response)
      preferiti.value = []
    }
  } catch (error) {
    console.error('❌ Errore caricamento preferiti:', error)
    preferiti.value = []
  } finally {
    loading.value = false
  }
}

// Rimuovi preferito
const rimuoviPreferito = async (moto) => {
  if (!user.value) return

  try {
    // Recupera l'ID utente dalla tabella utenti
    const { data: utenteData } = await supabase
      .from('utenti')
      .select('id')
      .eq('id', user.value.id)
      .maybeSingle()

    const utenteId = utenteData?.id || user.value.id

    const response = await $fetch('/api/preferiti/toggle', {
      method: 'POST',
      body: {
        utenteId: utenteId,
        motoId: moto.id
      }
    })

    if (response.success && response.action === 'removed') {
      // Rimuovi dalla lista locale
      preferiti.value = preferiti.value.filter(p => p.preferito_id !== moto.preferito_id)
      console.log('✅ Preferito rimosso')
    }
  } catch (error) {
    console.error('❌ Errore rimozione preferito:', error)
    alert('Errore nella rimozione del preferito')
  }
}

// Carica i preferiti al mount
onMounted(() => {
  caricaPreferiti()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>

