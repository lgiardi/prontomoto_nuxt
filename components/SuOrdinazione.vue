<template>
  <div class="su-ordinazione">
    <div class="flex items-center gap-1 mb-2">
      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        📋 Su ordinazione
      </span>
      <span class="text-xs text-gray-600">({{ numeroConcessionari }} concessionari)</span>
    </div>
    
    <div class="text-xs text-gray-600 mb-2">Colori su ordinazione:</div>
    <div class="flex flex-wrap gap-2">
      <div 
        v-for="colore in coloriSuOrdinazione" 
        :key="colore.nome"
        :style="{ backgroundColor: colore.codice }"
        class="w-4 h-4 rounded-full border border-gray-300 opacity-70"
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
const numeroConcessionari = ref(5)

const coloriSuOrdinazione = ref<Colore[]>([
  { nome: 'Viola', codice: '#7c3aed' },
  { nome: 'Rosa', codice: '#ec4899' },
  { nome: 'Turchese', codice: '#06b6d4' },
  { nome: 'Marrone', codice: '#a3a3a3' }
])
</script>

<style scoped>
.su-ordinazione {
  @apply mt-2;
}
</style>
