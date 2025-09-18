<template>
  <div class="colori-disponibili">
    <div class="text-xs text-gray-600 mb-2">Colori disponibili:</div>
    <div class="flex flex-wrap gap-2">
      <div 
        v-for="colore in colori" 
        :key="colore.nome"
        :style="{ backgroundColor: colore.codice }"
        class="w-4 h-4 rounded-full border border-gray-300"
        :title="colore.nome"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Colore {
  nome: string
  codice: string
}

// Dati statici per ora - poi collegheremo con Sanity
const colori = ref<Colore[]>([
  { nome: 'Rosso', codice: '#dc2626' },
  { nome: 'Blu', codice: '#2563eb' },
  { nome: 'Nero', codice: '#000000' },
  { nome: 'Bianco', codice: '#ffffff' },
  { nome: 'Grigio', codice: '#6b7280' }
])
</script>

<style scoped>
.colori-disponibili {
  @apply mt-2;
}
</style>
