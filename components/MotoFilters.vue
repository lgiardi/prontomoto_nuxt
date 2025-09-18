<template>
    <div class="bg-white rounded-2xl shadow-md p-6 mb-10">
      <h2 class="text-xl font-semibold mb-4">Filtri Avanzati</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        <!-- Città Concessionari -->
        <div>
          <label class="block text-sm font-medium mb-1">Città</label>
          <select v-model="filters.citta" class="w-full p-2 border rounded-lg">
            <option value="">Tutte le città ({{ stats.citta.length }})</option>
            <option 
              v-for="citta in stats.citta" 
              :key="citta.name" 
              :value="citta.name" 
              :disabled="citta.count === 0">
              {{ citta.name }} ({{ citta.count }})
            </option>
          </select>
        </div>

        <!-- Categoria -->
        <div>
          <label class="block text-sm font-medium mb-1">Categoria</label>
          <select v-model="filters.categoria" class="w-full p-2 border rounded-lg">
            <option value="">Tutte le categorie ({{ stats.categorie.length }})</option>
            <option v-for="cat in stats.categorie" :key="cat.name" :value="cat.name">
              {{ cat.name }} ({{ cat.count }})
            </option>
          </select>
        </div>
  
        <!-- Cilindrata -->
        <div>
          <label class="block text-sm font-medium mb-1">Cilindrata</label>
          <select v-model="filters.cilindrata" class="w-full p-2 border rounded-lg">
            <option value="">Tutte le cilindrate ({{ stats.cilindrate.length }})</option>
            <option 
              v-for="cil in stats.cilindrate" 
              :key="cil.value" 
              :value="cil.value" 
              :disabled="cil.count === 0">
              {{ cil.value }} cc ({{ cil.count }})
            </option>
          </select>
        </div>
  
        <!-- Marca -->
        <div>
          <label class="block text-sm font-medium mb-1">Marca</label>
          <select v-model="filters.marca" class="w-full p-2 border rounded-lg">
            <option value="">Tutte le marche ({{ stats.marche.length }})</option>
            <option 
              v-for="marca in stats.marche" 
              :key="marca.name" 
              :value="marca.name" 
              :disabled="marca.count === 0">
              {{ marca.name }} ({{ marca.count }})
            </option>
          </select>
        </div>
  
        <!-- Modello -->
        <div>
          <label class="block text-sm font-medium mb-1">Modello</label>
          <select v-model="filters.modello" class="w-full p-2 border rounded-lg">
            <option value="">Tutti i modelli ({{ stats.modelli.length }})</option>
            <option 
              v-for="modello in stats.modelli" 
              :key="modello.name" 
              :value="modello.name" 
              :disabled="modello.count === 0">
              {{ modello.name }} ({{ modello.count }})
            </option>
          </select>
        </div>
  
        <!-- Allestimento -->
        <div>
          <label class="block text-sm font-medium mb-1">Allestimento</label>
          <select v-model="filters.allestimento" class="w-full p-2 border rounded-lg">
            <option value="">Tutti gli allestimenti ({{ stats.allestimenti.length }})</option>
            <option 
              v-for="all in stats.allestimenti" 
              :key="all.name" 
              :value="all.name" 
              :disabled="all.count === 0">
              {{ all.name }} ({{ all.count }})
            </option>
          </select>
        </div>

      </div>
  
      <div class="mt-4 flex justify-end">
        <button @click="$emit('reset')" class="px-4 py-2 rounded-lg bg-[#90c149] text-white hover:bg-[#7aa83f] transition-colors">Reset</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    filters: {
      categoria: string
      cilindrata: string | number
      marca: string
      modello: string
      allestimento: string
      citta: string
    }
    stats: {
      categorie: { name: string; count: number }[]
      cilindrate: { value: number; count: number }[]
      marche: { name: string; count: number }[]
      modelli: { name: string; count: number }[]
      allestimenti: { name: string; count: number }[]
      citta: { name: string; count: number }[]
    }
  }>()
  </script>
  
  
  