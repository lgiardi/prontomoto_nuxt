<template>
  <div class="min-h-screen bg-white">
    <HeaderMenu />
    
    <!-- Hero Section - Stile Scheda Moto -->
    <div class="bg-gradient-to-r from-[#90c149] to-[#7ba83a] text-white py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Info Servizio -->
            <div>
              <h1 class="text-4xl md:text-5xl font-bold mb-6">
                Tagliando Moto
              </h1>
              <p class="text-xl mb-8 text-green-100">
                Manutenzione completa per la tua moto con i migliori concessionari
              </p>
              <div class="flex flex-wrap gap-4 mb-8">
                <span class="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                  ⚙️ Manutenzione Completa
                </span>
                <span class="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                  ⏱️ 2-3 Ore
                </span>
                <span class="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                  📅 Ogni 6 Mesi
                </span>
              </div>
              <div class="text-3xl font-bold">
                Da €120
              </div>
            </div>
            
            <!-- Immagine -->
            <div class="flex justify-center">
              <div class="w-64 h-64 bg-white/10 rounded-3xl flex items-center justify-center">
                <span class="text-8xl">🔧</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Dettagliate -->
    <div class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">
            Cosa Include il Tagliando
          </h2>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-2xl shadow-md">
              <div class="text-[#90c149] text-4xl mb-4">🔧</div>
              <h3 class="text-xl font-semibold mb-3">Manutenzione Completa</h3>
              <p class="text-gray-600">
                Controllo completo di tutti i sistemi della moto per garantire sicurezza e prestazioni ottimali.
              </p>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-md">
              <div class="text-[#90c149] text-4xl mb-4">⏱️</div>
              <h3 class="text-xl font-semibold mb-3">2-3 Ore</h3>
              <p class="text-gray-600">
                Tempo necessario per un controllo approfondito e accurato di tutti i componenti.
              </p>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-md">
              <div class="text-[#90c149] text-4xl mb-4">📅</div>
              <h3 class="text-xl font-semibold mb-3">Ogni 6 Mesi</h3>
              <p class="text-gray-600">
                Frequenza consigliata per mantenere la tua moto sempre in perfette condizioni.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Concessionari - Stile Box Grandi -->
    <div class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">
            Concessionari Disponibili
          </h2>
          
          <!-- Filtri Concessionari -->
          <div class="mb-8">
            <div class="flex flex-wrap gap-4 justify-center">
              <select class="border border-gray-300 rounded-lg px-4 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20">
                <option>Tutte le città</option>
                <option>Roma</option>
                <option>Milano</option>
                <option>Napoli</option>
              </select>
              <select class="border border-gray-300 rounded-lg px-4 py-2 focus:border-[#90c149] focus:ring-2 focus:ring-[#90c149]/20">
                <option>Disponibilità</option>
                <option>Disponibile oggi</option>
                <option>Disponibile domani</option>
              </select>
            </div>
          </div>
          
          <!-- Grid Concessionari -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <!-- Header Concessionario -->
              <div class="h-24 bg-gradient-to-r from-[#90c149] to-[#7ba83a] flex items-center justify-center">
                <span class="text-white font-bold text-lg">MotoCenter</span>
              </div>
              
              <!-- Contenuto -->
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="font-bold text-xl text-gray-900 group-hover:text-[#90c149] transition-colors">
                      MotoCenter Roma
                    </h3>
                    <p class="text-gray-600 text-sm">Via Roma 123, Roma</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">4.8</span>
                  </div>
                </div>
                
                <div class="mb-4">
                  <div class="text-2xl font-bold text-gray-900 mb-1">€120</div>
                  <div class="text-sm text-gray-500">Prezzo tagliando</div>
                </div>
                
                <div class="mb-4">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span class="text-sm text-gray-600">Disponibile oggi</span>
                  </div>
                  <div class="text-sm text-gray-500">127 recensioni</div>
                </div>
                
                <button class="w-full bg-[#90c149] text-white py-3 px-4 rounded-lg hover:bg-[#7ba83a] transition-colors font-medium">
                  Prenota Appuntamento
                </button>
              </div>
            </div>
            
            <div class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <!-- Header Concessionario -->
              <div class="h-24 bg-gradient-to-r from-[#90c149] to-[#7ba83a] flex items-center justify-center">
                <span class="text-white font-bold text-lg">BikeService</span>
              </div>
              
              <!-- Contenuto -->
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="font-bold text-xl text-gray-900 group-hover:text-[#90c149] transition-colors">
                      BikeService Milano
                    </h3>
                    <p class="text-gray-600 text-sm">Corso Italia 456, Milano</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">4.9</span>
                  </div>
                </div>
                
                <div class="mb-4">
                  <div class="text-2xl font-bold text-gray-900 mb-1">€135</div>
                  <div class="text-sm text-gray-500">Prezzo tagliando</div>
                </div>
                
                <div class="mb-4">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span class="text-sm text-gray-600">Disponibile domani</span>
                  </div>
                  <div class="text-sm text-gray-500">89 recensioni</div>
                </div>
                
                <button class="w-full bg-[#90c149] text-white py-3 px-4 rounded-lg hover:bg-[#7ba83a] transition-colors font-medium">
                  Prenota Appuntamento
                </button>
              </div>
            </div>
            
            <div class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <!-- Header Concessionario -->
              <div class="h-24 bg-gradient-to-r from-[#90c149] to-[#7ba83a] flex items-center justify-center">
                <span class="text-white font-bold text-lg">MotoExpert</span>
              </div>
              
              <!-- Contenuto -->
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="font-bold text-xl text-gray-900 group-hover:text-[#90c149] transition-colors">
                      MotoExpert Napoli
                    </h3>
                    <p class="text-gray-600 text-sm">Via Napoli 789, Napoli</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">4.6</span>
                  </div>
                </div>
                
                <div class="mb-4">
                  <div class="text-2xl font-bold text-gray-900 mb-1">€110</div>
                  <div class="text-sm text-gray-500">Prezzo tagliando</div>
                </div>
                
                <div class="mb-4">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span class="text-sm text-gray-600">Disponibile oggi</span>
                  </div>
                  <div class="text-sm text-gray-500">203 recensioni</div>
                </div>
                
                <button class="w-full bg-[#90c149] text-white py-3 px-4 rounded-lg hover:bg-[#7ba83a] transition-colors font-medium">
                  Prenota Appuntamento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pagina dedicata servizio tagliando
</script>