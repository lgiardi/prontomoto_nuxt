<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-bold text-black">{{ moto.marca }} {{ moto.modello }}</h2>
          <p class="text-lg font-semibold text-black">€ {{ moto.prezzo?.toLocaleString() }}</p>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">
          ×
        </button>
      </div>

      <!-- Contenuto -->
      <div class="p-6">
        <!-- Selezione Città -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">📍 Seleziona la tua città</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button 
              v-for="citta in cittaDisponibili" 
              :key="citta"
              @click="selezionaCitta(citta)"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                cittaSelezionata === citta 
                  ? 'bg-[#90c149] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ citta }}
            </button>
          </div>
        </div>

        <!-- Lista Concessionari -->
        <div v-if="cittaSelezionata" class="mb-6">
          <h3 class="text-lg font-semibold mb-3">🏪 Concessionari disponibili a {{ cittaSelezionata }}</h3>
          <div class="space-y-3">
            <div 
              v-for="concessionario in concessionariFiltrati" 
              :key="concessionario._id"
              class="border border-gray-200 rounded-lg p-4 hover:border-[#90c149] transition-colors"
            >
              <div class="mb-3">
                <h4 class="font-semibold text-black">{{ concessionario.nome }}</h4>
                <p class="text-sm text-gray-600">{{ concessionario.citta }}, {{ concessionario.provincia }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Pronta consegna
                  </span>
                  <span class="text-xs text-gray-500">Disponibile ora</span>
                </div>
                <div v-if="concessionario.telefono" class="text-sm text-gray-600 mt-1">
                  📞 {{ concessionario.telefono }}
                </div>
              </div>
              
              <!-- CTA Buttons -->
              <div class="flex gap-2">
                <button 
                  @click="fissaAppuntamento(concessionario)"
                  class="flex-1 bg-[#90c149] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#7aa83f] transition-colors flex items-center justify-center gap-1"
                >
                  📞 Fissa Appuntamento
                </button>
                <button 
                  @click="vaiAllaScheda(concessionario)"
                  class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  ℹ️ Scheda Moto
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Messaggio se nessuna città selezionata -->
        <div v-else class="text-center py-8 text-gray-500">
          <p>Seleziona una città per vedere i concessionari disponibili</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
  prezzo?: number
  concessionari: Concessionario[]
}

const props = defineProps<{
  isOpen: boolean
  moto: Moto | null
  cittaFiltro?: string
}>()

const emit = defineEmits<{
  close: []
  openDetail: [concessionario: Concessionario]
  bookAppointment: [concessionario: Concessionario]
}>()

const cittaSelezionata = ref<string>('')

// Estrai tutte le città disponibili
const cittaDisponibili = computed(() => {
  if (!props.moto) return []
  const citta = new Set<string>()
  props.moto.concessionari.forEach(c => {
    if (c.citta) citta.add(c.citta)
  })
  return Array.from(citta).sort()
})

// Pre-seleziona la città dal filtro se disponibile
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.cittaFiltro && props.moto) {
    // Verifica se la città del filtro è disponibile per questa moto
    const cittaDisponibili = props.moto.concessionari.map(c => c.citta).filter(Boolean)
    if (cittaDisponibili.includes(props.cittaFiltro)) {
      cittaSelezionata.value = props.cittaFiltro
    }
  }
}, { immediate: true })

// Filtra concessionari per città selezionata
const concessionariFiltrati = computed(() => {
  if (!cittaSelezionata.value || !props.moto) return []
  return props.moto.concessionari.filter(c => c.citta === cittaSelezionata.value)
})

const selezionaCitta = (citta: string) => {
  cittaSelezionata.value = citta
}

const fissaAppuntamento = (concessionario: Concessionario) => {
  emit('bookAppointment', concessionario)
  closeModal()
}

const vaiAllaScheda = (concessionario: Concessionario) => {
  emit('openDetail', concessionario)
  closeModal()
}

const closeModal = () => {
  cittaSelezionata.value = ''
  emit('close')
}
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
