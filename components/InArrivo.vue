<template>
  <div class="in-arrivo">
    <div class="flex items-center gap-1 mb-2">
      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        🚚 In arrivo
      </span>
      <span class="text-xs text-gray-600">{{ dataArrivo }}</span>
      <span class="text-xs text-gray-600">({{ numeroConcessionari }} concessionari)</span>
    </div>
    
    <div class="text-xs text-gray-600 mb-2">Colori in arrivo:</div>
    <div class="flex flex-wrap gap-2">
      <div 
        v-for="colore in coloriInArrivo" 
        :key="colore.nome"
        :style="{ backgroundColor: colore.codice }"
        class="w-4 h-4 rounded-full border border-gray-300 opacity-60"
        :title="colore.nome"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Colore {
  nome: string
  codice: string
}

// Dati statici per ora - poi collegheremo con Sanity
const dataArrivo = ref('15 Gennaio 2025')
const numeroConcessionari = ref(3)

const coloriInArrivo = ref<Colore[]>([
  { nome: 'Verde', codice: '#16a34a' },
  { nome: 'Giallo', codice: '#eab308' },
  { nome: 'Arancione', codice: '#ea580c' }
])
</script>

<style scoped>
.in-arrivo {
  @apply mt-2;
}
</style>
