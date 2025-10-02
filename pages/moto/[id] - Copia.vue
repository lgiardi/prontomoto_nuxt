<template>
  <div class="min-h-screen w-full bg-white">
    <HeaderMenu />
    
      <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
      <div class="text-lg text-gray-600">Caricamento moto...</div>
      </div>
      
    <div v-else-if="moto" class="w-full">
      <!-- Hero Gallery - Attaccato direttamente all'header -->
      <div 
        v-if="moto.immaginiGallery && moto.immaginiGallery.length > 0" 
        class="relative overflow-hidden w-full"
        @mouseenter="stopAutoScroll"
        @mouseleave="startAutoScroll"
      >
        <div class="flex transition-transform duration-500 ease-in-out" :style="{ transform: `translateX(-${currentImageIndex * 33.33}%)` }">
            <div 
              v-for="(immagine, index) in moto.immaginiGallery" 
              :key="index"
            class="w-1/3 flex-shrink-0"
            >
              <img 
                :src="immagine" 
                :alt="`${moto.marca} ${moto.modello} - Immagine ${index + 1}`"
              class="w-full object-contain bg-gray-50"
              />
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button 
          v-if="moto.immaginiGallery.length > 3"
          @click="previousImage"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button 
          v-if="moto.immaginiGallery.length > 3"
          @click="nextImage"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        <!-- Image Counter -->
        <div v-if="moto.immaginiGallery.length > 3" class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
          {{ currentImageIndex + 1 }} / {{ Math.max(1, moto.immaginiGallery.length - 2) }}
          </div>

          <!-- Dots Indicator -->
          <div v-if="moto.immaginiGallery.length > 3" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            <button 
              v-for="(_, index) in Math.max(1, moto.immaginiGallery.length - 2)" 
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
      <div v-else class="bg-gray-200 flex items-center justify-center">
        <div class="text-center">
          <div class="text-6xl mb-4">🏍️</div>
          <p class="text-gray-500">Immagine non disponibile</p>
            </div>
          </div>

      <!-- Info Principali -->
      <div class="w-full bg-white">
        <div class="w-full px-6 py-12">
          <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-5xl font-bold text-gray-900 mb-4">{{ moto.marca }} {{ moto.modello }}</h1>
            <p v-if="moto.allestimento" class="text-2xl text-gray-600 mb-8">{{ moto.allestimento }}</p>
            
            <div class="flex flex-wrap justify-center gap-6 mb-8">
              <span v-if="moto.categoria" class="bg-[#90c149] text-white px-6 py-3 rounded-full text-lg font-medium">
                {{ moto.categoria }}
              </span>
              <span v-if="moto.cilindrata" class="bg-gray-100 text-gray-700 px-6 py-3 rounded-full text-lg font-medium">
                {{ moto.cilindrata }} cc
              </span>
              <span v-if="moto.pesoASecco" class="bg-gray-100 text-gray-700 px-6 py-3 rounded-full text-lg font-medium">
                {{ moto.pesoASecco }} kg
              </span>
          </div>

            <div v-if="moto.prezzo" class="text-4xl font-bold text-[#90c149] mb-12">
              € {{ moto.prezzo.toLocaleString() }}
          </div>

            <!-- CTA Principale -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <button 
                @click="scrollToConcessionari"
                class="bg-[#90c149] text-white px-12 py-4 rounded-full font-semibold hover:bg-[#7aa83f] transition-colors flex items-center justify-center gap-3 text-lg"
              >
                🏪 Trova Concessionari
              </button>
              <button 
                @click="scrollToSpecifiche"
                class="bg-gray-100 text-gray-700 px-12 py-4 rounded-full font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 text-lg"
              >
                📋 Specifiche Tecniche
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sezione Concessionari -->
      <div id="concessionari" class="w-full bg-gray-50 py-16">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">🏪 I Tuoi Concessionari di Fiducia</h2>
            <p class="text-xl text-gray-600">Concessionari autorizzati con moto in pronta consegna</p>
        </div>

          <!-- Lista Concessionari -->
          <div v-if="moto.concessionari && moto.concessionari.length > 0" class="space-y-8">
            <div 
              v-for="(concessionario, index) in moto.concessionari" 
              :key="concessionario._id"
              class="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500"
            >
              <!-- Header Concessionario -->
              <div class="bg-gradient-to-r from-[#90c149] to-[#7aa83f] p-8 text-white">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-6">
                    <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span class="text-3xl">🏪</span>
          </div>
              <div>
                      <h3 class="text-3xl font-bold mb-2">{{ concessionario.nome }}</h3>
                      <p class="text-xl opacity-90">{{ concessionario.citta }}, {{ concessionario.provincia }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold mb-1">⭐ 4.8</div>
                    <div class="text-sm opacity-90">Rating medio</div>
                  </div>
                </div>
              </div>
              
              <!-- Contenuto Principale -->
              <div class="p-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  <!-- Colonna Sinistra - Info Principali -->
                  <div class="lg:col-span-2 space-y-6">
                    
                    <!-- Status e Disponibilità -->
                    <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <span class="text-2xl text-white">✅</span>
                        </div>
                        <div>
                          <h4 class="text-xl font-bold text-green-800">Disponibile in Pronta Consegna</h4>
                          <p class="text-green-600">Moto immediatamente disponibile</p>
                        </div>
                      </div>
                      
                      <!-- Info Moto -->
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white rounded-xl p-4 border border-green-200">
                          <div class="text-sm text-gray-600 mb-1">Colore Disponibile</div>
                          <div class="font-semibold text-gray-900">Rosso, Nero, Bianco</div>
                        </div>
                        <div class="bg-white rounded-xl p-4 border border-green-200">
                          <div class="text-sm text-gray-600 mb-1">Stato</div>
                          <div class="font-semibold text-green-600">✅ Pronta Consegna</div>
                        </div>
                        <div class="bg-white rounded-xl p-4 border border-green-200">
                          <div class="text-sm text-gray-600 mb-1">Tempi</div>
                          <div class="font-semibold text-gray-900">Immediato</div>
                        </div>
                      </div>
                    </div>

                    <!-- Info Concessionario -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-4">
                        <h5 class="text-lg font-semibold text-gray-900">📞 Contatti</h5>
                        <div v-if="concessionario.telefono" class="flex items-center gap-3">
                          <span class="text-2xl">📞</span>
                          <a :href="`tel:${concessionario.telefono}`" class="text-lg font-medium text-[#90c149] hover:text-[#7aa83f] transition-colors">
                            {{ concessionario.telefono }}
                  </a>
                </div>
                        <div v-if="concessionario.email" class="flex items-center gap-3">
                          <span class="text-2xl">✉️</span>
                          <a :href="`mailto:${concessionario.email}`" class="text-lg font-medium text-[#90c149] hover:text-[#7aa83f] transition-colors">
                            {{ concessionario.email }}
                          </a>
                        </div>
                      </div>
                      
                      <div class="space-y-4">
                        <h5 class="text-lg font-semibold text-gray-900">🏢 Showroom</h5>
                        <div class="space-y-2">
                          <div class="flex justify-between">
                            <span class="text-gray-600">Dipendenti:</span>
                            <span class="font-semibold">12</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-600">Metri quadri:</span>
                            <span class="font-semibold">450 m²</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-600">Anni attività:</span>
                            <span class="font-semibold">15+</span>
                          </div>
                        </div>
                </div>
              </div>
            </div>
            
                  <!-- Colonna Destra - CTA e Azioni -->
                  <div class="space-y-6">
                    
                    <!-- CTA Principali -->
                    <div class="space-y-4">
              <button 
                        @click="contattaConcessionario(concessionario)"
                        class="w-full bg-[#90c149] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#7aa83f] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                📞 Contatta Ora
              </button>
              <button 
                        @click="fissaAppuntamento(concessionario)"
                        class="w-full bg-white text-[#90c149] border-2 border-[#90c149] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-3"
              >
                📅 Fissa Appuntamento
              </button>
            </div>
          </div>
        </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">❌</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Moto non trovata</h2>
      <p class="text-gray-600 mb-6">La moto che stai cercando non è disponibile</p>
      <NuxtLink to="/" class="bg-[#90c149] text-white px-6 py-3 rounded-lg hover:bg-[#7aa83f] transition-colors">
        ← Torna all'elenco
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import HeaderMenu from "@/components/HeaderMenu.vue"

// Types
interface Concessionario {
  _id: string
  nome: string
  citta: string
  provincia: string
  telefono?: string
  email?: string
}

interface Moto {
  _id: string
  marca: string
  modello: string
  allestimento?: string
  categoria?: string
  prezzo?: number
  cilindrata?: number
  pesoASecco?: number
  immagineCopertina?: string
  immaginiGallery?: string[]
  concessionari?: Concessionario[]
}

const route = useRoute()
const moto = ref<Moto | null>(null)
const loading = ref(true)

// Gallery state
const currentImageIndex = ref(0)
const autoScrollInterval = ref<NodeJS.Timeout | null>(null)

// Methods
const nextImage = () => {
  if (!moto.value?.immaginiGallery) return
  const maxIndex = Math.max(0, moto.value.immaginiGallery.length - 3)
  if (currentImageIndex.value < maxIndex) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

const previousImage = () => {
  if (!moto.value?.immaginiGallery) return
  const maxIndex = Math.max(0, moto.value.immaginiGallery.length - 3)
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = maxIndex
  }
}

const startAutoScroll = () => {
  if (!moto.value?.immaginiGallery || moto.value.immaginiGallery.length <= 3) return
  autoScrollInterval.value = setInterval(() => {
    nextImage()
  }, 4000)
}

const stopAutoScroll = () => {
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
    autoScrollInterval.value = null
  }
}

const scrollToConcessionari = () => {
  document.getElementById('concessionari')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToSpecifiche = () => {
  document.getElementById('specifiche')?.scrollIntoView({ behavior: 'smooth' })
}

const contattaConcessionario = (concessionario: Concessionario) => {
  if (concessionario.telefono) {
    window.open(`tel:${concessionario.telefono}`, '_self')
  } else if (concessionario.email) {
    window.open(`mailto:${concessionario.email}`, '_self')
  }
}

const fissaAppuntamento = (concessionario: Concessionario) => {
  console.log('Fissa appuntamento con:', concessionario)
  alert(`Appuntamento fissato con ${concessionario.nome} a ${concessionario.citta}`)
}

// Fetch moto da API
onMounted(async () => {
  try {
    const motoId = route.params.id
    console.log('Caricamento moto con ID:', motoId)
    
    const motoFetched = await $fetch(`/api/motos/${motoId}`)
    console.log('Moto caricata:', motoFetched)
    moto.value = motoFetched
    
    currentImageIndex.value = 0
    
    if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > 4) {
      startAutoScroll()
    }
  } catch (error) {
    console.error('Errore nel caricamento della moto:', error)
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