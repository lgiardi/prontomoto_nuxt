<template>
  <div class="bg-white rounded-2xl shadow-md p-8 mb-10">
    <div class="max-w-4xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        <!-- Città -->
        <div class="text-center">
          <label class="block text-lg font-semibold mb-3 text-gray-800">In quale città vuoi prenotare?</label>
          <select v-model="filters.citta" class="w-full p-3 border-2 border-[#90c149] rounded-xl focus:ring-2 focus:ring-[#90c149] focus:border-transparent text-center text-gray-700 font-medium">
            <option value="">Tutte le città</option>
            <option 
              v-for="citta in stats.citta" 
              :key="citta" 
              :value="citta">
              {{ citta }}
            </option>
          </select>
        </div>

        <!-- Categoria -->
        <div class="text-center">
          <label class="block text-lg font-semibold mb-3 text-gray-800">Che servizio vuoi prenotare?</label>
          <select v-model="filters.categoria" class="w-full p-3 border-2 border-[#90c149] rounded-xl focus:ring-2 focus:ring-[#90c149] focus:border-transparent text-center text-gray-700 font-medium">
            <option value="">Tutti i servizi</option>
            <option v-for="cat in stats.categorie" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

      </div>

      <div class="mt-6 flex justify-center">
        <button @click="$emit('reset')" class="px-6 py-3 rounded-xl bg-[#90c149] text-white font-semibold hover:bg-[#7aa83f] transition-colors shadow-lg hover:shadow-xl">
          Reset Filtri
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  filters: {
    citta: string
    categoria: string
  }
  stats: {
    citta: string[]
    categorie: string[]
  }
}>()
</script>
