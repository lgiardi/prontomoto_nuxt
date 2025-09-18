<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-bold text-black">🏪 Concessionari disponibili</h2>
          <p class="text-gray-600">{{ moto?.marca }} {{ moto?.modello }}</p>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">
          ×
        </button>
      </div>

      <!-- Contenuto -->
      <div class="p-6">
        <!-- Filtro per città -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">📍 Filtra per città</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <button 
              @click="filtroCitta = ''"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filtroCitta === '' 
                  ? 'bg-[#90c149] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Tutte
            </button>
            <button 
              v-for="citta in cittaDisponibili" 
              :key="citta"
              @click="filtroCitta = citta"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filtroCitta === citta 
                  ? 'bg-[#90c149] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ citta }}
            </button>
          </div>
        </div>

        <!-- Lista Concessionari -->
        <div class="space-y-4">
          <div 
            v-for="concessionario in concessionariFiltrati" 
            :key="concessionario._id"
            class="border border-gray-200 rounded-lg p-4 hover:border-[#90c149] transition-colors"
          >
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex-1">
                <h4 class="font-semibold text-black text-lg">{{ concessionario.nome }}</h4>
                <p class="text-gray-600">{{ concessionario.citta }}, {{ concessionario.provincia }}</p>
                
                <div class="flex items-center gap-4 mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Disponibile
                  </span>
                  <span class="text-xs text-gray-500">Pronta consegna</span>
                </div>
                
                <div class="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div v-if="concessionario.telefono" class="flex items-center gap-1">
                    📞 {{ concessionario.telefono }}
                  </div>
                  <div v-if="concessionario.email" class="flex items-center gap-1">
                    ✉️ {{ concessionario.email }}
                  </div>
                </div>
              </div>
              
              <!-- CTA Buttons -->
              <div class="flex flex-col sm:flex-row gap-2">
                <button 
                  @click="fissaAppuntamento(concessionario)"
                  class="bg-[#90c149] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7aa83f] transition-colors flex items-center justify-center gap-1"
                >
                  📞 Fissa Appuntamento
                </button>
                <button 
                  @click="contattaConcessionario(concessionario)"
                  class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  💬 Contatta
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Messaggio se nessun concessionario -->
        <div v-if="concessionariFiltrati.length === 0" class="text-center py-8 text-gray-500">
          <p>Nessun concessionario disponibile per questa moto</p>
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
  concessionari: Concessionario[]
}

const props = defineProps<{
  isOpen: boolean
  moto: Moto | null
}>()

const emit = defineEmits<{
  close: []
  bookAppointment: [concessionario: Concessionario]
}>()

const filtroCitta = ref<string>('')

// Estrai tutte le città disponibili
const cittaDisponibili = computed(() => {
  if (!props.moto) return []
  const citta = new Set<string>()
  props.moto.concessionari.forEach(c => {
    if (c.citta) citta.add(c.citta)
  })
  return Array.from(citta).sort()
})

// Filtra concessionari per città selezionata
const concessionariFiltrati = computed(() => {
  if (!props.moto) return []
  if (!filtroCitta.value) return props.moto.concessionari
  return props.moto.concessionari.filter(c => c.citta === filtroCitta.value)
})

const fissaAppuntamento = (concessionario: Concessionario) => {
  emit('bookAppointment', concessionario)
  closeModal()
}

const contattaConcessionario = (concessionario: Concessionario) => {
  // Implementare logica di contatto
  console.log('Contatta concessionario:', concessionario)
  if (concessionario.telefono) {
    window.open(`tel:${concessionario.telefono}`, '_self')
  } else if (concessionario.email) {
    window.open(`mailto:${concessionario.email}`, '_self')
  }
}

const closeModal = () => {
  filtroCitta.value = ''
  emit('close')
}
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>



