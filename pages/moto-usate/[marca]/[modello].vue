<template>
  <div class="min-h-screen w-full bg-white">
    <HeaderMenu />
    
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
      <div class="text-lg text-gray-600">Caricamento moto...</div>
    </div>
    
    <div v-else-if="!moto" class="text-center py-12">
      <div class="text-6xl mb-4">😕</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Moto non trovata</h2>
      <p class="text-gray-600 mb-6">La moto che stai cercando non è disponibile o non esiste.</p>
      <NuxtLink to="/moto-usate" class="inline-block px-6 py-3 bg-[#90c149] text-white rounded-lg hover:bg-[#7ba83a] transition-colors">
        Torna alle moto usate
      </NuxtLink>
    </div>
    
    <div v-else-if="moto" class="w-full">
      <!-- Hero Gallery -->
      <div 
        v-if="moto.foto && moto.foto.length > 0" 
        class="relative overflow-hidden w-full"
        @mouseenter="stopAutoScroll"
        @mouseleave="startAutoScroll"
      >
        <div class="flex transition-transform duration-500 ease-in-out" :style="{ transform: `translateX(-${currentImageIndex * 33.33}%)` }">
          <div 
            v-for="(immagine, index) in moto.foto" 
            :key="index"
            class="w-full md:w-1/3 flex-shrink-0 h-96 bg-gray-100"
          >
            <img 
              :src="immagine" 
              :alt="`${moto.marca} ${moto.modello} - Immagine ${index + 1}`"
              class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              @click="openImageModal(immagine)"
            />
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button 
          v-if="moto.foto.length > getVisibleImages()"
          @click="previousImage"
          class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button 
          v-if="moto.foto.length > getVisibleImages()"
          @click="nextImage"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <!-- Dots Indicator -->
        <div v-if="moto.foto.length > getVisibleImages()" class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
          <button 
            v-for="(_, index) in getMaxIndex() + 1" 
            :key="index"
            @click="currentImageIndex = index"
            :class="[
              'w-2 h-2 rounded-full transition-all',
              currentImageIndex === index 
                ? 'bg-white' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            ]"
          ></button>
        </div>
      </div>

      <!-- Fallback Image -->
      <div v-else class="bg-gray-200 flex items-center justify-center h-96">
        <div class="text-center">
          <div class="text-6xl mb-4">🏍️</div>
          <p class="text-gray-600">Nessuna immagine disponibile</p>
        </div>
      </div>

      <!-- Info Principali -->
      <div class="w-full bg-white px-4 py-6">
        <div class="text-center mb-6">
          <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-2">{{ moto.marca }} {{ moto.modello }}</h1>
          <p v-if="moto.categoria" class="text-lg md:text-xl text-gray-600 mb-4">{{ moto.categoria }}</p>
          
          <!-- Prezzo -->
          <div class="text-3xl md:text-4xl font-bold text-[#90c149] mb-4">
            € {{ moto.prezzo?.toLocaleString('it-IT') }}
          </div>
          
          <!-- Info Moto -->
          <div class="bg-gray-50 rounded-xl p-4 mb-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div class="text-sm text-gray-600 mb-1">Anno</div>
                <div class="text-lg font-bold text-gray-900">{{ moto.anno }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600 mb-1">Chilometri</div>
                <div class="text-lg font-bold text-gray-900">{{ moto.km?.toLocaleString('it-IT') }} km</div>
              </div>
              <div>
                <div class="text-sm text-gray-600 mb-1">Condizione</div>
                <div class="text-lg font-bold text-gray-900">{{ getCondizioneText(moto.condizione) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600 mb-1">Tipo</div>
                <div class="text-lg font-bold text-gray-900">Concessionario</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Contatta Venditore - Sistema Contatto Globale -->
        <div class="flex flex-col gap-3 mb-6">
          <button 
            @click="showContactModal = true"
            class="w-full bg-[#90c149] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#7aa83f] transition-colors flex items-center justify-center gap-3"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            Contatta il Venditore
          </button>
          <button 
            @click="showAppointmentModal = true"
            class="w-full bg-white text-[#90c149] border-2 border-[#90c149] py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-3"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Prenota Appuntamento
          </button>
          <button 
            @click="showPhoneNumber = !showPhoneNumber"
            class="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <span v-if="!showPhoneNumber">Mostra Numero</span>
            <span v-else class="font-mono">{{ moto?.venditore?.telefono || 'Non disponibile' }}</span>
          </button>
        </div>

        <!-- Descrizione -->
        <div v-if="moto.descrizione" class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Descrizione</h2>
          <div class="bg-gray-50 rounded-xl p-6">
            <p class="text-gray-700 whitespace-pre-line">{{ moto.descrizione }}</p>
          </div>
        </div>

        <!-- Info Venditore -->
        <div v-if="moto.venditore" class="bg-gray-50 rounded-xl p-6 mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Informazioni Venditore</h2>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-[#90c149] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {{ moto.venditore.nome?.charAt(0).toUpperCase() || 'V' }}
              </div>
              <div>
                <div class="font-semibold text-gray-900">{{ moto.venditore.nome }}</div>
                <div class="text-sm text-gray-600">
                  Concessionario
                  <span v-if="moto.venditore.citta"> · {{ moto.venditore.citta }}</span>
                  <span v-if="moto.venditore.provincia"> ({{ moto.venditore.provincia }})</span>
                </div>
              </div>
            </div>
            <div v-if="moto.venditore.email" class="text-sm text-gray-600">
              📧 {{ moto.venditore.email }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Immagine -->
    <div 
      v-if="showImageModal" 
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      @click="closeImageModal"
    >
      <button 
        @click="previousModalImage"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all z-10"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <button 
        @click="nextModalImage"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all z-10"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      <button 
        @click="closeImageModal"
        class="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all z-10"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <img 
        :src="modalImages[modalImageIndex]" 
        :alt="`${moto?.marca} ${moto?.modello} - Immagine ${modalImageIndex + 1}`"
        class="max-w-full max-h-full object-contain rounded-lg mx-auto"
        @click.stop
      />
      
      <!-- Dots Indicator per modal -->
      <div v-if="modalImages.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        <button 
          v-for="(_, index) in modalImages.length" 
          :key="index"
          @click="modalImageIndex = index"
          :class="[
            'w-2 h-2 rounded-full transition-all',
            modalImageIndex === index 
              ? 'bg-white' 
              : 'bg-white bg-opacity-50 hover:bg-opacity-75'
          ]"
        ></button>
      </div>
    </div>

    <!-- Modal Contatto Unificato -->
    <UnifiedContactModal 
      v-if="moto && moto.venditore"
      :is-open="showContactModal"
      :concessionario="moto.venditore"
      tipo="moto_usata"
      :moto-usata="moto"
      @close="showContactModal = false"
      @sent="handleContactSent"
    />

    <!-- Modal Appuntamento Unificato -->
    <UnifiedAppointmentModal 
      v-if="moto && moto.venditore"
      :is-open="showAppointmentModal"
      :concessionario="moto.venditore"
      tipo="moto_usata"
      :moto-usata="moto"
      @close="showAppointmentModal = false"
      @booked="handleAppointmentBooked"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import HeaderMenu from "@/components/HeaderMenu.vue"
import UnifiedContactModal from "@/components/UnifiedContactModal.vue"
import UnifiedAppointmentModal from "@/components/UnifiedAppointmentModal.vue"

// Types
interface MotoUsata {
  id: string
  marca: string
  modello: string
  categoria?: string
  anno: number
  km: number
  condizione: string
  prezzo: number
  descrizione?: string
  foto: string[]
  venditore?: {
    id: string
    nome: string
    email?: string
    telefono?: string
    citta?: string
    provincia?: string
    tipo: 'concessionario' | 'privato'
  }
}

// State
const route = useRoute()
const loading = ref(true)
const moto = ref<MotoUsata | null>(null)
const currentImageIndex = ref(0)
const showImageModal = ref(false)
const modalImageIndex = ref(0)
const showContactModal = ref(false)
const showAppointmentModal = ref(false)
const showPhoneNumber = ref(false)

// Computed
const modalImages = computed(() => {
  if (!moto.value?.foto) return []
  return moto.value.foto
})

// Auto scroll
let autoScrollInterval = null

const getVisibleImages = () => {
  return 3
}

const getMaxIndex = () => {
  if (!moto.value?.foto) return 0
  const visible = getVisibleImages()
  return Math.max(0, moto.value.foto.length - visible)
}

const startAutoScroll = () => {
  if (moto.value?.foto && moto.value.foto.length > getVisibleImages()) {
    autoScrollInterval = setInterval(() => {
      const maxIndex = getMaxIndex()
      currentImageIndex.value = (currentImageIndex.value + 1) % (maxIndex + 1)
    }, 3000)
  }
}

const stopAutoScroll = () => {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval)
    autoScrollInterval = null
  }
}

// Navigation functions
const previousImage = () => {
  if (moto.value?.foto && moto.value.foto.length > getVisibleImages()) {
    const maxIndex = getMaxIndex()
    currentImageIndex.value = currentImageIndex.value > 0 ? currentImageIndex.value - 1 : maxIndex
  }
}

const nextImage = () => {
  if (moto.value?.foto && moto.value.foto.length > getVisibleImages()) {
    const maxIndex = getMaxIndex()
    currentImageIndex.value = (currentImageIndex.value + 1) % (maxIndex + 1)
  }
}

// Modal functions
const openImageModal = (image) => {
  const index = modalImages.value.indexOf(image)
  if (index !== -1) {
    modalImageIndex.value = index
    showImageModal.value = true
  }
}

const closeImageModal = () => {
  showImageModal.value = false
}

const previousModalImage = () => {
  if (modalImageIndex.value > 0) {
    modalImageIndex.value--
  }
}

const nextModalImage = () => {
  if (modalImageIndex.value < modalImages.value.length - 1) {
    modalImageIndex.value++
  }
}

// Handlers
const getCondizioneText = (condizione) => {
  const condizioni = {
    'ottima': 'Ottima',
    'buona': 'Buona',
    'discreta': 'Discreta',
    'da-ristrutturare': 'Da ristrutturare'
  }
  return condizioni[condizione] || condizione
}

const handleContactSent = (data) => {
  console.log('Richiesta inviata:', data)
  alert('Richiesta inviata con successo! Il venditore ti contatterà presto.')
  showContactModal.value = false
}

const handleAppointmentBooked = (data) => {
  console.log('Appuntamento prenotato:', data)
  alert('Appuntamento prenotato con successo! Il venditore ti contatterà per confermare.')
  showAppointmentModal.value = false
}

// Funzione per normalizzare slug (deve essere identica a quella nel backend e nella lista)
function normalizeSlug(str: string): string {
  if (!str) return ''
  return str.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')  // Spazi diventano trattini
    .replace(/[^a-z0-9-]/g, '')  // Rimuovi tutto tranne lettere, numeri e trattini
    .replace(/-+/g, '-')  // Sostituisci più trattini con uno solo
    .replace(/^-|-$/g, '')  // Rimuovi trattini all'inizio e alla fine
}

// Carica i dati della moto usando marca/modello
onMounted(async () => {
    const marcaSlug = route.params.marca as string
    const modelloSlug = route.params.modello as string
    
  if (!marcaSlug || !modelloSlug) {
    loading.value = false
    return
  }
  
  loading.value = true
  
  try {
    console.log('🔍 Caricamento moto usata con marca:', marcaSlug, 'modello:', modelloSlug)
    
    const response = await $fetch('/api/moto-usate/by-marca-modello', {
      method: 'POST',
      body: { marca: marcaSlug, modello: modelloSlug }
    })
    
    console.log('✅ Risposta API ricevuta:', response)
    
    if (response && response.id) {
      moto.value = {
        id: response.id,
        marca: response.marca,
        modello: response.modello,
        categoria: response.categoria,
        anno: response.anno,
        km: response.km,
        condizione: response.condizione,
        prezzo: response.prezzo,
        descrizione: response.descrizione,
        foto: response.foto || [],
        venditore: response.venditore || (response.concessionari && response.concessionari.length > 0 ? {
          id: response.concessionari[0].id,
          nome: response.concessionari[0].nome,
          email: response.concessionari[0].email,
          telefono: response.concessionari[0].telefono,
          citta: response.concessionari[0].citta,
          provincia: response.concessionari[0].provincia,
          tipo: response.concessionari[0].tipo || response.venditore_type
        } : null)
      }
      
      if (moto.value.foto && moto.value.foto.length > getVisibleImages()) {
        startAutoScroll()
      }
    } else {
      moto.value = null
    }
  } catch (error: any) {
    console.error('❌ Errore nel caricamento della moto usata:', error)
    moto.value = null
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  stopAutoScroll()
})
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>


