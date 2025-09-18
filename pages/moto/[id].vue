<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header Menu -->
    <HeaderMenu />
    
    <!-- Main Content -->
    <div class="w-full px-4 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="text-lg text-gray-600">Caricamento...</div>
      </div>
      
      <div v-else-if="moto" class="max-w-6xl mx-auto">
        <!-- Breadcrumb -->
        <nav class="mb-6">
          <NuxtLink to="/" class="text-[#90c149] hover:underline">← Torna all'elenco</NuxtLink>
        </nav>

        <!-- Header Moto -->
        <div class="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Immagine -->
            <div class="lg:w-1/2">
              <div v-if="moto.immagineCopertina" class="aspect-square rounded-xl overflow-hidden">
                <img 
                  :src="moto.immagineCopertina" 
                  :alt="`${moto.marca} ${moto.modello}`"
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-else class="aspect-square bg-gray-200 rounded-xl flex items-center justify-center">
                <span class="text-gray-400 text-lg">🏍️</span>
              </div>
            </div>
            
            <!-- Info Principali -->
            <div class="lg:w-1/2">
              <h1 class="text-3xl font-bold text-black mb-2">{{ moto.marca }} {{ moto.modello }}</h1>
              <p v-if="moto.allestimento" class="text-lg text-gray-600 mb-4">{{ moto.allestimento }}</p>
              
              <div class="space-y-3 mb-6">
                <div v-if="moto.prezzo" class="text-2xl font-bold text-black">
                  € {{ moto.prezzo.toLocaleString() }}
                </div>
                <div v-if="moto.categoria" class="text-sm text-gray-600">
                  <span class="font-medium">Categoria:</span> {{ moto.categoria }}
                </div>
                <div v-if="moto.cilindrata" class="text-sm text-gray-600">
                  <span class="font-medium">Cilindrata:</span> {{ moto.cilindrata }} cc
                </div>
              </div>
              
              <!-- CTA Buttons -->
              <div class="flex gap-3">
                <button 
                  @click="apriModalAppuntamento"
                  class="flex-1 bg-[#90c149] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#7aa83f] transition-colors flex items-center justify-center gap-2"
                >
                  📞 Fissa Appuntamento
                </button>
                <button 
                  @click="apriModalConcessionari"
                  class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  🏪 Trova Concessionari
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Gallery Immagini -->
        <div v-if="moto.immaginiGallery && moto.immaginiGallery.length > 0" class="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold text-black mb-4">📸 Gallery</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="(immagine, index) in moto.immaginiGallery" 
              :key="index"
              class="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              @click="apriLightbox(index)"
            >
              <img 
                :src="immagine" 
                :alt="`${moto.marca} ${moto.modello} - Immagine ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Specifiche Tecniche -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Motore -->
          <div class="bg-white rounded-2xl shadow-md p-6">
            <h2 class="text-xl font-bold text-black mb-4">🔧 Motore</h2>
            <div class="space-y-2 text-sm">
              <div v-if="moto.cilindrata"><span class="font-medium">Cilindrata:</span> {{ moto.cilindrata }} cc</div>
              <div v-if="moto.tipoMotore"><span class="font-medium">Tipo motore:</span> {{ moto.tipoMotore }}</div>
              <div v-if="moto.tempi"><span class="font-medium">Tempi:</span> {{ moto.tempi }}</div>
              <div v-if="moto.cilindri"><span class="font-medium">Cilindri:</span> {{ moto.cilindri }}</div>
              <div v-if="moto.configurazioneCilindri"><span class="font-medium">Configurazione:</span> {{ moto.configurazioneCilindri }}</div>
              <div v-if="moto.disposizioneCilindri"><span class="font-medium">Disposizione:</span> {{ moto.disposizioneCilindri }}</div>
              <div v-if="moto.raffreddamento"><span class="font-medium">Raffreddamento:</span> {{ moto.raffreddamento }}</div>
              <div v-if="moto.alimentazione"><span class="font-medium">Alimentazione:</span> {{ moto.alimentazione }}</div>
              <div v-if="moto.alesaggio"><span class="font-medium">Alesaggio:</span> {{ moto.alesaggio }} mm</div>
              <div v-if="moto.corsa"><span class="font-medium">Corsa:</span> {{ moto.corsa }} mm</div>
              <div v-if="moto.potenza"><span class="font-medium">Potenza:</span> {{ moto.potenza }}</div>
              <div v-if="moto.coppia"><span class="font-medium">Coppia:</span> {{ moto.coppia }}</div>
              <div v-if="moto.numeroValvole"><span class="font-medium">Valvole:</span> {{ moto.numeroValvole }}</div>
              <div v-if="moto.distribuzione"><span class="font-medium">Distribuzione:</span> {{ moto.distribuzione }}</div>
            </div>
          </div>

          <!-- Dimensioni -->
          <div class="bg-white rounded-2xl shadow-md p-6">
            <h2 class="text-xl font-bold text-black mb-4">📏 Dimensioni</h2>
            <div class="space-y-2 text-sm">
              <div v-if="moto.lunghezza"><span class="font-medium">Lunghezza:</span> {{ moto.lunghezza }} mm</div>
              <div v-if="moto.larghezza"><span class="font-medium">Larghezza:</span> {{ moto.larghezza }} mm</div>
              <div v-if="moto.altezza"><span class="font-medium">Altezza:</span> {{ moto.altezza }} mm</div>
              <div v-if="moto.interasse"><span class="font-medium">Interasse:</span> {{ moto.interasse }} mm</div>
              <div v-if="moto.altezzaSellaDaTerraMin"><span class="font-medium">Altezza sella min:</span> {{ moto.altezzaSellaDaTerraMin }} mm</div>
              <div v-if="moto.altezzaSellaDaTerraMax"><span class="font-medium">Altezza sella max:</span> {{ moto.altezzaSellaDaTerraMax }} mm</div>
              <div v-if="moto.altezzaMinimaDaTerra"><span class="font-medium">Altezza da terra:</span> {{ moto.altezzaMinimaDaTerra }} mm</div>
              <div v-if="moto.pesoASecco"><span class="font-medium">Peso a secco:</span> {{ moto.pesoASecco }} kg</div>
              <div v-if="moto.pesoInOrdineDiMarcia"><span class="font-medium">Peso in marcia:</span> {{ moto.pesoInOrdineDiMarcia }} kg</div>
            </div>
          </div>

          <!-- Trasmissione -->
          <div class="bg-white rounded-2xl shadow-md p-6">
            <h2 class="text-xl font-bold text-black mb-4">⚙️ Trasmissione</h2>
            <div class="space-y-2 text-sm">
              <div v-if="moto.tipologiaCambio"><span class="font-medium">Cambio:</span> {{ moto.tipologiaCambio }}</div>
              <div v-if="moto.numeroMarce"><span class="font-medium">Marce:</span> {{ moto.numeroMarce }}</div>
              <div v-if="moto.presenzaRetromarcia"><span class="font-medium">Retromarcia:</span> {{ moto.presenzaRetromarcia }}</div>
              <div v-if="moto.frizione"><span class="font-medium">Frizione:</span> {{ moto.frizione }}</div>
              <div v-if="moto.trasmissioneFinale"><span class="font-medium">Trasmissione finale:</span> {{ moto.trasmissioneFinale }}</div>
              <div v-if="moto.consumoMedioVmtc"><span class="font-medium">Consumo medio:</span> {{ moto.consumoMedioVmtc }} km/l</div>
              <div v-if="moto.capacitaSerbatoioCarburante"><span class="font-medium">Serbatoio:</span> {{ moto.capacitaSerbatoioCarburante }} lt</div>
              <div v-if="moto.capacitaRiservaCarburante"><span class="font-medium">Riserva:</span> {{ moto.capacitaRiservaCarburante }} lt</div>
            </div>
          </div>

          <!-- Ciclistica -->
          <div class="bg-white rounded-2xl shadow-md p-6">
            <h2 class="text-xl font-bold text-black mb-4">🚲 Ciclistica</h2>
            <div class="space-y-2 text-sm">
              <div v-if="moto.telaio"><span class="font-medium">Telaio:</span> {{ moto.telaio }}</div>
              <div v-if="moto.sospensioneAnteriore"><span class="font-medium">Sospensione anteriore:</span> {{ moto.sospensioneAnteriore }}</div>
              <div v-if="moto.escursioneAnteriore"><span class="font-medium">Escursione anteriore:</span> {{ moto.escursioneAnteriore }} mm</div>
              <div v-if="moto.sospensionePosteriore"><span class="font-medium">Sospensione posteriore:</span> {{ moto.sospensionePosteriore }}</div>
              <div v-if="moto.escursionePosteriore"><span class="font-medium">Escursione posteriore:</span> {{ moto.escursionePosteriore }} mm</div>
              <div v-if="moto.tipoFrenoAnteriore"><span class="font-medium">Freno anteriore:</span> {{ moto.tipoFrenoAnteriore }}</div>
              <div v-if="moto.misuraFrenoAnteriore"><span class="font-medium">Freno anteriore:</span> {{ moto.misuraFrenoAnteriore }} mm</div>
              <div v-if="moto.tipoFrenoPosteriore"><span class="font-medium">Freno posteriore:</span> {{ moto.tipoFrenoPosteriore }}</div>
              <div v-if="moto.misuraFrenoPosteriore"><span class="font-medium">Freno posteriore:</span> {{ moto.misuraFrenoPosteriore }} mm</div>
              <div v-if="moto.abs"><span class="font-medium">ABS:</span> {{ moto.abs }}</div>
            </div>
          </div>

          <!-- Ruote -->
          <div class="bg-white rounded-2xl shadow-md p-6">
            <h2 class="text-xl font-bold text-black mb-4">🛞 Ruote</h2>
            <div class="space-y-2 text-sm">
              <div v-if="moto.tipoRuote"><span class="font-medium">Tipo ruote:</span> {{ moto.tipoRuote }}</div>
              <div v-if="moto.misuraCerchioAnteriore"><span class="font-medium">Cerchio anteriore:</span> {{ moto.misuraCerchioAnteriore }}"</div>
              <div v-if="moto.pneumaticoAnteriore"><span class="font-medium">Pneumatico anteriore:</span> {{ moto.pneumaticoAnteriore }}</div>
              <div v-if="moto.misuraCerchioPosteriore"><span class="font-medium">Cerchio posteriore:</span> {{ moto.misuraCerchioPosteriore }}"</div>
              <div v-if="moto.pneumaticoPosteriore"><span class="font-medium">Pneumatico posteriore:</span> {{ moto.pneumaticoPosteriore }}</div>
            </div>
          </div>

          <!-- Elettronica -->
          <div class="bg-white rounded-2xl shadow-md p-6">
            <h2 class="text-xl font-bold text-black mb-4">⚡ Elettronica</h2>
            <div class="space-y-2 text-sm">
              <div v-if="moto.rideByWire"><span class="font-medium">Ride by Wire:</span> {{ moto.rideByWire }}</div>
              <div v-if="moto.controlloTrazione"><span class="font-medium">Controllo trazione:</span> {{ moto.controlloTrazione }}</div>
              <div v-if="moto.mappeMotore"><span class="font-medium">Mappe motore:</span> {{ moto.mappeMotore }}</div>
              <div v-if="moto.emissioni"><span class="font-medium">Emissioni:</span> {{ moto.emissioni }}</div>
              <div v-if="moto.depotenziata"><span class="font-medium">Depotenziata:</span> {{ moto.depotenziata }}</div>
              <div v-if="moto.avviamento"><span class="font-medium">Avviamento:</span> {{ moto.avviamento }}</div>
            </div>
          </div>
        </div>

        <!-- Concessionario Selezionato -->
        <div v-if="concessionarioSelezionato" class="bg-white rounded-2xl shadow-md p-6 mt-6 border-l-4 border-[#90c149]">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-black">🏪 Concessionario Selezionato</h2>
            <button 
              @click="rimuoviSelezioneConcessionario"
              class="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕ Rimuovi selezione
            </button>
          </div>
          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 class="text-lg font-semibold text-black">{{ concessionarioSelezionato.nome }}</h3>
                <p class="text-gray-600">{{ concessionarioSelezionato.citta }}, {{ concessionarioSelezionato.provincia }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Disponibile
                  </span>
                  <span class="text-xs text-gray-500">Pronta consegna</span>
                </div>
              </div>
              
              <div class="flex flex-col gap-2">
                <div v-if="concessionarioSelezionato.telefono" class="flex items-center gap-2 text-sm text-gray-600">
                  <span>📞</span>
                  <a :href="`tel:${concessionarioSelezionato.telefono}`" class="hover:text-[#90c149] transition-colors">
                    {{ concessionarioSelezionato.telefono }}
                  </a>
                </div>
                <div v-if="concessionarioSelezionato.email" class="flex items-center gap-2 text-sm text-gray-600">
                  <span>✉️</span>
                  <a :href="`mailto:${concessionarioSelezionato.email}`" class="hover:text-[#90c149] transition-colors">
                    {{ concessionarioSelezionato.email }}
                  </a>
                </div>
              </div>
            </div>
            
            <!-- CTA per il concessionario selezionato -->
            <div class="flex gap-3 mt-4">
              <button 
                @click="contattaConcessionario(concessionarioSelezionato)"
                class="flex-1 bg-[#90c149] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#7aa83f] transition-colors flex items-center justify-center gap-2"
              >
                📞 Contatta Ora
              </button>
              <button 
                @click="apriModalAppuntamento"
                class="flex-1 bg-white text-[#90c149] border border-[#90c149] px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                📅 Fissa Appuntamento
              </button>
            </div>
          </div>
        </div>

        <!-- Informazioni Aggiuntive -->
        <div v-if="moto.garanzia || moto.optional || moto.inizioProduzione || moto.fineProduzione" class="bg-white rounded-2xl shadow-md p-6 mt-6">
          <h2 class="text-xl font-bold text-black mb-4">ℹ️ Informazioni Aggiuntive</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div v-if="moto.garanzia"><span class="font-medium">Garanzia:</span> {{ moto.garanzia }}</div>
            <div v-if="moto.optional"><span class="font-medium">Optional:</span> {{ moto.optional }}</div>
            <div v-if="moto.inizioProduzione"><span class="font-medium">Inizio produzione:</span> {{ moto.inizioProduzione }}</div>
            <div v-if="moto.fineProduzione"><span class="font-medium">Fine produzione:</span> {{ moto.fineProduzione }}</div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-12">
        <div class="text-lg text-gray-600">Moto non trovata</div>
        <NuxtLink to="/" class="text-[#90c149] hover:underline mt-2 inline-block">← Torna all'elenco</NuxtLink>
      </div>
    </div>

    <!-- Modal Fissa Appuntamento -->
    <ModalFissaAppuntamento 
      :is-open="isModalAppuntamentoOpen" 
      :moto="moto"
      @close="chiudiModalAppuntamento"
      @open-detail="vaiAllaScheda"
      @book-appointment="fissaAppuntamento"
    />

    <!-- Modal Concessionari -->
    <ModalConcessionari 
      :is-open="isModalConcessionariOpen" 
      :moto="moto"
      @close="chiudiModalConcessionari"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HeaderMenu from "@/components/HeaderMenu.vue"
import ModalFissaAppuntamento from "@/components/ModalFissaAppuntamento.vue"
import ModalConcessionari from "@/components/ModalConcessionari.vue"

// Types basati sullo schema Sanity
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
  tipoMotore?: string
  tempi?: number
  cilindri?: number
  configurazioneCilindri?: string
  disposizioneCilindri?: string
  raffreddamento?: string
  alimentazione?: string
  alesaggio?: number
  corsa?: number
  potenza?: string
  coppia?: string
  numeroValvole?: number
  distribuzione?: string
  lunghezza?: number
  larghezza?: number
  altezza?: number
  interasse?: number
  altezzaSellaDaTerraMin?: number
  altezzaSellaDaTerraMax?: number
  altezzaMinimaDaTerra?: number
  pesoASecco?: number
  pesoInOrdineDiMarcia?: number
  tipologiaCambio?: string
  numeroMarce?: number
  presenzaRetromarcia?: string
  frizione?: string
  trasmissioneFinale?: string
  consumoMedioVmtc?: number
  capacitaSerbatoioCarburante?: number
  capacitaRiservaCarburante?: number
  telaio?: string
  sospensioneAnteriore?: string
  escursioneAnteriore?: number
  sospensionePosteriore?: string
  escursionePosteriore?: number
  tipoFrenoAnteriore?: string
  misuraFrenoAnteriore?: number
  tipoFrenoPosteriore?: string
  misuraFrenoPosteriore?: number
  abs?: string
  tipoRuote?: string
  misuraCerchioAnteriore?: number
  pneumaticoAnteriore?: string
  misuraCerchioPosteriore?: number
  pneumaticoPosteriore?: string
  rideByWire?: string
  controlloTrazione?: string
  mappeMotore?: string
  emissioni?: string
  depotenziata?: string
  avviamento?: string
  garanzia?: string
  optional?: string
  inizioProduzione?: number
  fineProduzione?: number
  immagineCopertina?: string
  immaginiGallery?: string[]
  link?: string
}

const route = useRoute()
const moto = ref<Moto | null>(null)
const loading = ref(true)

// Modal states
const isModalAppuntamentoOpen = ref(false)
const isModalConcessionariOpen = ref(false)
const concessionarioSelezionato = ref<Concessionario | null>(null)

// Funzioni per i modal
const apriModalAppuntamento = () => {
  isModalAppuntamentoOpen.value = true
}

const chiudiModalAppuntamento = () => {
  isModalAppuntamentoOpen.value = false
}

const apriModalConcessionari = () => {
  isModalConcessionariOpen.value = true
}

const chiudiModalConcessionari = () => {
  isModalConcessionariOpen.value = false
}

const fissaAppuntamento = (concessionario: any) => {
  console.log('Fissa appuntamento con:', concessionario)
  concessionarioSelezionato.value = concessionario
  // Aggiorna l'URL con il concessionario selezionato
  const currentUrl = new URL(window.location.href)
  currentUrl.searchParams.set('concessionario', concessionario._id)
  window.history.replaceState({}, '', currentUrl.toString())
  // Qui puoi implementare la logica per fissare l'appuntamento
  // Ad esempio: aprire un form, inviare email, etc.
  alert(`Appuntamento fissato con ${concessionario.nome} a ${concessionario.citta}`)
}

const contattaConcessionario = (concessionario: any) => {
  if (concessionario.telefono) {
    window.open(`tel:${concessionario.telefono}`, '_self')
  } else if (concessionario.email) {
    window.open(`mailto:${concessionario.email}`, '_self')
  }
}

const vaiAllaScheda = (concessionario: any) => {
  console.log('Vai alla scheda per:', concessionario)
  concessionarioSelezionato.value = concessionario
}

const rimuoviSelezioneConcessionario = () => {
  concessionarioSelezionato.value = null
  // Rimuovi il parametro concessionario dall'URL
  const currentUrl = new URL(window.location.href)
  currentUrl.searchParams.delete('concessionario')
  window.history.replaceState({}, '', currentUrl.toString())
}

const apriLightbox = (index: number) => {
  // Implementare lightbox per le immagini
  console.log('Apri lightbox per immagine:', index)
}

// Fetch moto da API
onMounted(async () => {
  try {
    const motoId = route.params.id
    const concessionarioId = route.query.concessionario as string
    
    console.log('Caricamento moto con ID:', motoId)
    console.log('Concessionario selezionato ID:', concessionarioId)
    
    const motoFetched = await $fetch(`/api/motos/${motoId}`)
    console.log('Moto caricata:', motoFetched)
    moto.value = motoFetched
    
    // Se c'è un concessionario selezionato, lo carico
    if (concessionarioId && moto.value?.concessionari) {
      const concessionario = moto.value.concessionari.find(c => c._id === concessionarioId)
      if (concessionario) {
        concessionarioSelezionato.value = concessionario
        console.log('Concessionario selezionato caricato:', concessionario)
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento della moto:', error)
    moto.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
