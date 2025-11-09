<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <DealerHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Moto Usate</h1>
        <p class="text-gray-600">Gestisci le tue moto usate in vendita</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto"></div>
        <p class="mt-4 text-gray-600">Caricamento...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-red-800 mb-2">Errore</h2>
        <p class="text-red-700">{{ error }}</p>
        <button @click="loadMotoUsate" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
          Riprova
        </button>
      </div>

      <div v-else>
        <div class="mb-6 flex justify-between items-center">
          <button @click="showAddForm = true" class="px-4 py-2 bg-[#90c149] text-white rounded-md hover:bg-[#7ba83a] transition-colors">
              + Aggiungi Moto Usata
            </button>
          
          <select v-model="statusFilter" @change="loadMotoUsate" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]">
              <option value="">Tutti gli status</option>
              <option value="pending">In attesa</option>
              <option value="approved">Approvate</option>
              <option value="rejected">Rifiutate</option>
            </select>
        </div>

        <div v-if="motoUsate.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Nessuna moto usata</h3>
          <p class="text-gray-500 mb-4">Inizia aggiungendo la tua prima moto usata</p>
          <button @click="showAddForm = true" class="px-4 py-2 bg-[#90c149] text-white rounded-md hover:bg-[#7ba83a] transition-colors">
            Aggiungi Moto Usata
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="moto in motoUsate" :key="moto.id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
            <div class="h-48 bg-gray-200 relative">
              <img :src="moto.immagine_copertina || getFirstPhoto(moto.foto) || 'https://via.placeholder.com/300x200?text=' + moto.marca + '+' + moto.modello" :alt="moto.marca + ' ' + moto.modello" class="w-full h-full object-cover" />
              <div class="absolute top-2 right-2">
                <span :class="{'bg-yellow-100 text-yellow-800': moto.status === 'pending', 'bg-green-100 text-green-800': moto.status === 'approved', 'bg-red-100 text-red-800': moto.status === 'rejected'}" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusText(moto.status) }}
                </span>
              </div>
            </div>

            <div class="p-4 flex flex-col flex-grow">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ moto.marca }} {{ moto.modello }}</h3>
              
              <div class="space-y-2 text-sm text-gray-600 flex-grow">
                <div class="flex justify-between">
                  <span>Anno:</span>
                  <span class="font-medium">{{ moto.anno }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Km:</span>
                  <span class="font-medium">{{ moto.km?.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Condizione:</span>
                  <span class="font-medium capitalize">{{ moto.condizione }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Prezzo:</span>
                  <span class="font-bold text-[#90c149]">€{{ moto.prezzo?.toLocaleString() }}</span>
                </div>
              </div>

              <div v-if="moto.descrizione" class="mt-3">
                <p class="text-sm text-gray-600 line-clamp-2">{{ moto.descrizione }}</p>
              </div>

              <div class="mt-4 flex space-x-2">
                <button @click="editMoto(moto)" class="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Modifica
                </button>
                <button @click="deleteMoto(moto)" class="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddForm || editingMoto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <MotoUsataForm :moto="editingMoto" :catalogo="catalogo" @close="closeForm" @saved="onMotoSaved" />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'dealer',
  layout: false
})

const user = ref(null)
const motoUsate = ref([])
const catalogo = ref([])
const loading = ref(true)
const error = ref(null)
const showAddForm = ref(false)
const editingMoto = ref(null)
const statusFilter = ref('')

const supabase = useSupabaseClient()

const getFirstPhoto = (fotoArray) => {
  if (!fotoArray || !Array.isArray(fotoArray) || fotoArray.length === 0) return null
  if (typeof fotoArray === 'string') {
    try {
      const parsed = JSON.parse(fotoArray)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null
    } catch { return null }
  }
  return fotoArray[0] || null
}

const loadMotoUsate = async () => {
  try {
    loading.value = true
    error.value = null

    while (!user.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const { data: catalogoData } = await $fetch('/api/moto-usate-catalogo')
    catalogo.value = catalogoData || []

    const params = new URLSearchParams()
    params.append('venditore_type', 'concessionario')
    if (statusFilter.value) {
      params.append('status', statusFilter.value)
    }

    const { data: motoData } = await $fetch(`/api/moto-usate?${params.toString()}`)
    motoUsate.value = motoData || []

  } catch (err) {
    console.error('Errore nel caricamento moto usate:', err)
    error.value = 'Errore nel caricamento delle moto usate'
  } finally {
    loading.value = false
  }
}

const editMoto = (moto) => {
  editingMoto.value = moto
  showAddForm.value = false
}

const closeForm = () => {
  showAddForm.value = false
  editingMoto.value = null
}

const onMotoSaved = () => {
  closeForm()
  loadMotoUsate()
}

const deleteMoto = async (moto) => {
  if (!confirm(`Sei sicuro di voler eliminare ${moto.marca} ${moto.modello}?`)) return

  try {
    // Ottieni token di autenticazione
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Sessione non valida')
    }

    await $fetch(`/api/moto-usate/${moto.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    alert('Moto eliminata con successo!')
    loadMotoUsate()
  } catch (err) {
    console.error('Errore nell\'eliminazione:', err)
    alert('Errore nell\'eliminazione della moto')
  }
}

const getStatusText = (status) => {
  const statusMap = { pending: 'In attesa', approved: 'Approvata', rejected: 'Rifiutata' }
  return statusMap[status] || status
}

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  
  if (!user.value) {
    await navigateTo('/auth/login')
    return
  }
  
  await loadMotoUsate()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
