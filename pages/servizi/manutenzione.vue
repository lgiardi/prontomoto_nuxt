<template>
  <div class="min-h-screen bg-white">
    <HeaderMenu />
    
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-black mb-8">Manutenzione Moto</h1>
      
      <div class="bg-green-100 p-6 rounded-lg mb-8">
        <h2 class="text-2xl font-semibold text-black mb-4">Servizio Manutenzione</h2>
        <p class="text-gray-700">Controlli periodici e riparazioni per la tua moto</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-black mb-2">Honda Roma</h3>
          <p class="text-gray-600 mb-2">Via del Corso 123, Roma</p>
          <p class="text-green-600 font-bold">€80</p>
          <button class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Prenota
          </button>
        </div>
        
        <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-black mb-2">Yamaha Milano</h3>
          <p class="text-gray-600 mb-2">Corso Buenos Aires 456, Milano</p>
          <p class="text-green-600 font-bold">€75</p>
          <button class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Prenota
          </button>
        </div>
        
        <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-black mb-2">Ducati Napoli</h3>
          <p class="text-gray-600 mb-2">Via Chiaia 789, Napoli</p>
          <p class="text-green-600 font-bold">€120</p>
          <button class="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Prenota
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})
</script>

