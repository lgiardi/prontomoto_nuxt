<template>
    <div class="min-h-screen w-full bg-white">
      <HeaderMenu />
      
        <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
        <div class="text-lg text-gray-600">Caricamento moto...</div>
        </div>
        
      <div v-else-if="moto" class="w-full">
        <!-- Hero Gallery -->
        <div 
          v-if="moto.immaginiGallery && moto.immaginiGallery.length > 0" 
          class="relative overflow-hidden w-full"
          @mouseenter="stopAutoScroll"
          @mouseleave="startAutoScroll"
        >
          <div class="flex transition-transform duration-500 ease-in-out" :style="{ transform: `translateX(-${currentImageIndex * 33.33}%)` }">
              <div 
                v-for="(immagine, index) in moto.immaginiGallery" 
                :key="index"
              class="w-full md:w-1/3 flex-shrink-0 h-96 bg-gray-100"
              >
                <img 
                  :src="immagine" 
                  :alt="`${moto.marca} ${moto.modello} - Immagine ${index + 1}`"
                class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                @click="openImageModal(immagine)"
                />
            </div>
          </div>
  
          <!-- Navigation Arrows -->
          <button 
            v-if="moto.immaginiGallery.length > getVisibleImages()"
            @click="previousImage"
            class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button 
            v-if="moto.immaginiGallery.length > getVisibleImages()"
            @click="nextImage"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
  
            <!-- Dots Indicator -->
          <div v-if="moto.immaginiGallery.length > getVisibleImages()" class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
              <button 
              v-for="(_, index) in getMaxIndex() + 1" 
                :key="index"
                @click="currentImageIndex = index"
                :class="[
                  'w-2 h-2 rounded-full transition-all',
                  currentImageIndex === index 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                ]"
              ></button>
              </div>
            </div>
  
        <!-- Fallback Image -->
        <div v-else class="bg-gray-200 flex items-center justify-center h-96">
          <div class="text-center">
            <div class="text-6xl mb-4">🏍️</div>
            <p class="text-gray-600">Nessuna immagine disponibile</p>
              </div>
            </div>
  
        <!-- Info Principali - Mobile First -->
        <div class="w-full bg-white px-4 py-6">
          <!-- Titolo e Prezzo - PRIMI ELEMENTI VISIBILI -->
          <div class="text-center mb-6">
            <!-- Logo Marca -->
            <div class="mb-4">
              <img 
                src="https://www.gemotors.it/wp-content/uploads/2025/03/benelli-seeklogo-768x243.png" 
                :alt="`Logo ${moto.marca}`"
                class="h-12 mx-auto"
              />
            </div>
            
            <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-2">{{ moto.marca }} {{ moto.modello }}</h1>
            <p v-if="moto.allestimento" class="text-lg md:text-2xl text-gray-600 mb-4">{{ moto.allestimento }}</p>
            
            <!-- PREZZO - ELEMENTO CHIAVE -->
            <div v-if="moto.prezzo" class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              € {{ moto.prezzo.toLocaleString() }}
            </div>
            
            <!-- Colori Disponibili -->
            <div v-if="moto.colori && moto.colori.length > 0" class="bg-gray-50 rounded-xl p-4 mb-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Colori disponibili:</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="(colore, index) in moto.colori" 
                  :key="index"
                  class="px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-700"
                >
                  {{ colore }}
                </span>
              </div>
            </div>
            </div>
  
          <!-- CTA Principali - SUBITO VISIBILI -->
          <div class="flex flex-col gap-3 mb-6">
                <button 
                  @click="scrollToConcessionari"
              class="w-full bg-[#90c149] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#7aa83f] transition-colors flex items-center justify-center gap-3"
                >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Trova Concessionari
                </button>
                <button 
                  @click="scrollToSpecifiche"
              class="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Specifiche Tecniche
            </button>
          </div>
  
          <!-- Filtro Città - DROPDOWN -->
          <div class="mb-6">
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Seleziona città
              </h3>
              
              <div class="mb-3">
                <select 
                  v-model="cittaSelezionata"
                  @change="onCityChange"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                >
                  <option value="">Tutte le città</option>
                  <option 
                    v-for="cittaData in tutteLeCitta" 
                    :key="cittaData.citta" 
                    :value="cittaData.citta"
                  >
                    {{ cittaData.citta }} ({{ cittaData.count }})
                  </option>
                </select>
              </div>
              
              <div v-if="cittaSelezionata" class="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-sm text-green-800">
                  <span class="font-semibold">Hai selezionato i venditori nella città {{ cittaSelezionata }}</span> che hanno in pronta consegna {{ moto.marca }} {{ moto.modello }}
                </p>
                <p class="text-xs text-green-600 mt-1">
                  {{ concessionariFiltrati.length }} concessionari disponibili
                </p>
              </div>
            </div>
          </div>
  
          <!-- Tag Caratteristiche - COMPATTI -->
          <div class="flex flex-wrap gap-2 justify-center">
            <span v-if="moto.categoria" class="bg-[#90c149] text-white px-3 py-1 rounded-full text-sm font-medium">
              {{ moto.categoria }}
            </span>
            <span v-if="moto.cilindrata" class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {{ moto.cilindrata }} cc
            </span>
            <span v-if="moto.pesoASecco" class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {{ moto.pesoASecco }} kg
            </span>
          </div>
        </div>
  
        <!-- Sezione Concessionari - MOBILE FIRST -->
        <div id="concessionari" class="w-full bg-gray-50 py-8 md:py-16">
          <div class="max-w-7xl mx-auto px-4 md:px-6">
            <div class="text-center mb-8 md:mb-12">
              <h2 class="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
                <svg class="w-6 h-6 md:w-10 md:h-10 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span class="hidden md:inline">I Tuoi Concessionari di Fiducia</span>
                <span class="md:hidden">Concessionari</span>
              </h2>
              <p class="text-base md:text-xl text-gray-600">Concessionari autorizzati con moto in pronta consegna</p>
            </div>
  
            <!-- Scheda Tecnica Completa -->
            <div id="specifiche" class="mb-16">
              <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-8 text-white">
                  <h2 class="text-3xl font-bold mb-2 flex items-center gap-3">
                    <svg class="w-8 h-8 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Scheda Tecnica Completa
                  </h2>
                  <p class="text-xl opacity-90">{{ moto.marca }} {{ moto.modello }}</p>
                </div>
                
                <div class="p-8">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Motore -->
                    <div class="space-y-4">
                      <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg class="w-6 h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        Motore
                      </h3>
                      <div class="space-y-3">
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Cilindrata</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.cilindrata || 'N/A' }} cc</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Potenza</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.potenza || 'N/A' }} CV</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Alimentazione</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.alimentazione || 'N/A' }}</div>
                        </div>
                      </div>
                    </div>
  
                    <!-- Trasmissione -->
                    <div class="space-y-4">
                      <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg class="w-6 h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Trasmissione
                      </h3>
                      <div class="space-y-3">
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Tipo</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.trasmissione || 'N/A' }}</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Rapporti</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.rapporti || 'N/A' }}</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Frizione</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.frizione || 'N/A' }}</div>
                        </div>
                      </div>
                    </div>
  
                    <!-- Dimensioni e Peso -->
                    <div class="space-y-4">
                      <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg class="w-6 h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                        </svg>
                        Dimensioni
                      </h3>
                      <div class="space-y-3">
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Peso a secco</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.pesoASecco || 'N/A' }} kg</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Lunghezza</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.lunghezza || 'N/A' }} mm</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Altezza</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.altezza || 'N/A' }} mm</div>
                        </div>
                      </div>
                    </div>
  
                    <!-- Freni -->
                    <div class="space-y-4">
                      <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg class="w-6 h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Freni
                      </h3>
                      <div class="space-y-3">
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Anteriore</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.frenoAnteriore || 'N/A' }}</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Posteriore</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.frenoPosteriore || 'N/A' }}</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">ABS</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.abs || 'N/A' }}</div>
                        </div>
                      </div>
                    </div>
  
                    <!-- Ruote -->
                    <div class="space-y-4">
                      <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg class="w-6 h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                        </svg>
                        Ruote
                      </h3>
                      <div class="space-y-3">
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Anteriore</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.ruotaAnteriore || 'N/A' }}</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Posteriore</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.ruotaPosteriore || 'N/A' }}</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Tipo</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.tipoRuote || 'N/A' }}</div>
                        </div>
                      </div>
                    </div>
  
                    <!-- Altro -->
                    <div class="space-y-4">
                      <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg class="w-6 h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Altro
                      </h3>
                      <div class="space-y-3">
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Colore</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.colore || 'N/A' }}</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Serbatoio</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.capacitaSerbatoio || 'N/A' }} L</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                          <div class="text-sm text-gray-600 mb-1">Consumo</div>
                          <div class="text-lg font-bold text-gray-900">{{ moto.consumo || 'N/A' }} L/100km</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
  
            <!-- Lista Concessionari -->
            <div v-if="concessionariFiltrati && concessionariFiltrati.length > 0" class="space-y-8">
              <div 
                v-for="(concessionario, index) in concessionariFiltrati" 
                :key="concessionario._id"
                class="bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-2xl overflow-hidden hover:shadow-xl md:hover:shadow-3xl transition-all duration-500 mb-6"
              >
                <!-- Header Concessionario - MOBILE FIRST -->
                <div class="bg-gradient-to-r from-[#90c149] to-[#7aa83f] p-4 md:p-8 text-white">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 md:gap-6">
                      <div class="w-12 h-12 md:w-20 md:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span class="text-lg md:text-3xl">🏪</span>
            </div>
                <div>
                        <h3 class="text-lg md:text-3xl font-bold mb-1 md:mb-2">{{ concessionario.nome }}</h3>
                        <p class="text-sm md:text-xl opacity-90">{{ concessionario.citta }}, {{ concessionario.provincia }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg md:text-2xl font-bold mb-1">⭐ 4.8</div>
                      <div class="text-xs md:text-sm opacity-90">Rating</div>
                    </div>
                  </div>
                </div>
                
                <!-- Contenuto Principale - MOBILE FIRST -->
                <div class="p-4 md:p-8">
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                    
                    <!-- Colonna Sinistra - Info Principali -->
                    <div class="lg:col-span-2 space-y-4 md:space-y-6">
                      
                      <!-- Status e Disponibilità -->
                      <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <div class="flex items-center gap-4 mb-4">
                          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span class="text-2xl text-white">✅</span>
                          </div>
                          <div>
                            <h4 class="text-xl font-bold text-green-800">{{ moto.marca }} {{ moto.modello }} - Disponibile in Pronta Consegna</h4>
                            <p class="text-green-600">Moto immediatamente disponibile</p>
                          </div>
                        </div>
                        
                        <!-- Prezzo del Concessionario -->
                        <div class="bg-gradient-to-r from-[#90c149] to-[#7aa83f] rounded-xl p-4 text-white mb-4">
                          <div class="flex items-center justify-between">
                            <div>
                              <div class="text-sm opacity-90">Prezzo del Concessionario</div>
                              <div class="text-2xl font-bold">€ 4.890</div>
                              <div class="text-sm opacity-90">Prezzo di listino: € 5.200</div>
                            </div>
                            <div class="text-right">
                              <div class="text-lg font-bold">-€ 310</div>
                              <div class="text-sm opacity-90">Risparmio</div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Info Moto -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div class="bg-white rounded-xl p-4 border border-green-200">
                            <div class="text-sm text-gray-600 mb-1">Colore Disponibile</div>
                            <div class="font-semibold text-gray-900">Rosso, Nero, Bianco</div>
                          </div>
                          <div class="bg-white rounded-xl p-4 border border-green-200">
                            <div class="text-sm text-gray-600 mb-1">Stato</div>
                            <div class="font-semibold text-green-600">✅ Pronta Consegna</div>
                          </div>
                          <div class="bg-white rounded-xl p-4 border border-green-200">
                            <div class="text-sm text-gray-600 mb-1">Tempi</div>
                            <div class="font-semibold text-gray-900">Immediato</div>
                          </div>
                        </div>
                      </div>
  
                      <!-- Slide Immagini Moto del Concessionario -->
                      <div class="mb-6">
                        <h5 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          Foto della moto
                        </h5>
                        <div class="relative bg-gray-100 rounded-2xl overflow-hidden">
                          <div class="flex transition-transform duration-500 ease-in-out" :style="{ transform: `translateX(-${currentDealerImageIndex * 100}%)` }">
                            <div v-for="(immagine, imgIndex) in (moto.immaginiGallery || [])" :key="imgIndex" class="w-full flex-shrink-0 h-64 bg-gray-50">
                              <img 
                                :src="immagine" 
                                :alt="`${moto.marca} ${moto.modello} - Foto ${imgIndex + 1}`"
                                class="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                                @click="openImageModal(immagine)"
                              />
                            </div>
                          </div>
                          
                          <!-- Navigation Arrows per dealer -->
                          <button 
                            v-if="(moto.immaginiGallery || []).length > 1"
                            @click="previousDealerImage"
                            class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                          </button>
                          <button 
                            v-if="(moto.immaginiGallery || []).length > 1"
                            @click="nextDealerImage"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                          </button>
                          
                          <!-- Dots Indicator -->
                          <div v-if="(moto.immaginiGallery || []).length > 1" class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                            <button 
                              v-for="(_, imgIndex) in (moto.immaginiGallery || []).length" 
                              :key="imgIndex"
                              @click="currentDealerImageIndex = imgIndex"
                              :class="[
                                'w-2 h-2 rounded-full transition-all',
                                currentDealerImageIndex === imgIndex 
                                  ? 'bg-white' 
                                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                              ]"
                            ></button>
                          </div>
                        </div>
                        <p class="text-sm text-gray-500 mt-2">Foto scattate dal concessionario</p>
                      </div>
  
                      <!-- Promozioni e Offerte del Concessionario -->
                      <div class="mb-6">
                        <h5 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                          </svg>
                          Le tue promozioni
                        </h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div class="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                            <div class="flex items-center gap-3 mb-2">
                              <div class="w-8 h-8 bg-[#90c149] rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                              <div>
                                <div class="font-semibold text-gray-900">Bolla inclusa</div>
                                <div class="text-sm text-gray-600">Valore € 150</div>
                              </div>
                            </div>
                          </div>
                          
                          <div class="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                            <div class="flex items-center gap-3 mb-2">
                              <div class="w-8 h-8 bg-[#90c149] rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                              <div>
                                <div class="font-semibold text-gray-900">Messa su strada gratis</div>
                                <div class="text-sm text-gray-600">Valore € 200</div>
                              </div>
                            </div>
                          </div>
                          
                          <div class="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                            <div class="flex items-center gap-3 mb-2">
                              <div class="w-8 h-8 bg-[#90c149] rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                              <div>
                                <div class="font-semibold text-gray-900">Garanzia estesa 2 anni</div>
                                <div class="text-sm text-gray-600">Valore € 300</div>
                              </div>
                            </div>
                          </div>
                          
                          <div class="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                            <div class="flex items-center gap-3 mb-2">
                              <div class="w-8 h-8 bg-[#90c149] rounded-full flex items-center justify-center">
                                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                              <div>
                                <div class="font-semibold text-gray-900">Prima revisione gratis</div>
                                <div class="text-sm text-gray-600">Valore € 80</div>
                              </div>
                  </div>
                          </div>
                        </div>
                        
                        <!-- Totale Risparmio -->
                        <div class="mt-4 bg-gradient-to-r from-[#90c149] to-[#7aa83f] rounded-xl p-4 text-white">
                          <div class="flex items-center justify-between">
                            <div>
                              <div class="text-sm opacity-90">Totale risparmio con le promozioni</div>
                              <div class="text-xl font-bold">€ 730</div>
                            </div>
                            <div class="text-right">
                              <div class="text-sm opacity-90">+ Prezzo scontato</div>
                              <div class="text-lg font-bold">€ 4.890</div>
                            </div>
                          </div>
                  </div>
                </div>
  
              </div>
              
                    <!-- Colonna Destra - CTA e Azioni -->
                    <div class="space-y-6">
                      
                      <!-- Recensioni del Concessionario -->
                      <div class="mb-6">
                        <h5 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                          </svg>
                          Recensioni ({{ Math.floor(Math.random() * 20) + 15 }})
                        </h5>
                        
                        <div class="space-y-3">
                          <!-- Recensione 1 -->
                          <div class="bg-gray-50 rounded-lg p-4">
                            <div class="flex items-center gap-3 mb-2">
                              <div class="w-8 h-8 bg-[#90c149] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                M
                              </div>
                              <div>
                                <div class="font-semibold text-gray-900 text-sm">Marco R.</div>
                                <div class="flex items-center gap-1">
                                  <span class="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</span>
                                  <span class="text-xs text-gray-500">2 giorni fa</span>
                                </div>
                              </div>
                            </div>
                            <p class="text-gray-700 text-sm">"Servizio eccellente, moto consegnata in perfette condizioni. Consigliatissimo!"</p>
                          </div>
  
                          <!-- Recensione 2 -->
                          <div class="bg-gray-50 rounded-lg p-4">
                            <div class="flex items-center gap-3 mb-2">
                              <div class="w-8 h-8 bg-[#90c149] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                L
                              </div>
                              <div>
                                <div class="font-semibold text-gray-900 text-sm">Laura S.</div>
                                <div class="flex items-center gap-1">
                                  <span class="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</span>
                                  <span class="text-xs text-gray-500">1 settimana fa</span>
                                </div>
                              </div>
                            </div>
                            <p class="text-gray-700 text-sm">"Personale molto professionale, mi hanno aiutato a scegliere la moto giusta."</p>
                          </div>
                        </div>
  
                        <!-- Rating Medio -->
                        <div class="mt-4 bg-gradient-to-r from-[#90c149] to-[#7aa83f] rounded-lg p-3 text-white">
                          <div class="flex items-center justify-between">
                            <div>
                              <div class="text-sm opacity-90">Rating Medio</div>
                              <div class="text-lg font-bold">4.8 ⭐</div>
                            </div>
                            <div class="text-right">
                              <div class="text-sm opacity-90">Basato su</div>
                              <div class="text-sm font-bold">{{ Math.floor(Math.random() * 20) + 15 }} recensioni</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- CTA Principali -->
                      <div class="space-y-4">
                <button 
                          @click="contattaConcessionario(concessionario)"
                          class="w-full bg-[#90c149] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#7aa83f] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          Contatta il Venditore
                </button>
                <button 
                          @click="fissaAppuntamento(concessionario)"
                          class="w-full bg-white text-[#90c149] border-2 border-[#90c149] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-3"
                >
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          Fissa Appuntamento
                        </button>
                        
                        <!-- Form di Contatto -->
                        <div class="mt-6 p-6 bg-gray-50 rounded-2xl">
                          <h4 class="text-lg font-bold text-gray-900 mb-4">Contatta il Venditore</h4>
                          <form @submit.prevent="inviaMessaggio(concessionario)" class="space-y-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                              <input 
                                v-model="formContatto.nome"
                                type="text" 
                                required
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                                placeholder="Il tuo nome"
                              >
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                              <input 
                                v-model="formContatto.email"
                                type="email" 
                                required
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                                placeholder="la.tua@email.com"
                              >
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                              <input 
                                v-model="formContatto.telefono"
                                type="tel" 
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
                                placeholder="+39 123 456 7890"
                              >
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Messaggio</label>
                              <textarea 
                                v-model="formContatto.messaggio"
                                required
                                rows="4"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#90c149] focus:border-transparent resize-none"
                                placeholder="Ciao, sono interessato a questa moto. Vorrei maggiori informazioni su..."
                                :key="`messaggio-${moto?._id || 'default'}`"
                              ></textarea>
                            </div>
                            <button 
                              type="submit"
                              class="w-full bg-[#90c149] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#7aa83f] transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                              </svg>
                              Invia Messaggio
                </button>
                          </form>
                        </div>
                        
                        <!-- Link aggiuntivi -->
                        <div class="mt-6 space-y-3">
                          <a 
                            href="#"
                            class="block w-full text-center py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Altri veicoli da questo venditore
                          </a>
                          <a 
                            href="#"
                            class="block w-full text-center py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Pagina del rivenditore
                          </a>
                          <a 
                            href="#"
                            class="block w-full text-center py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Note legali
                          </a>
                        </div>
              </div>
            </div>
          </div>
                </div>
              </div>
            </div>
  
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Moto non trovata</h2>
        <p class="text-gray-600 mb-6">La moto che stai cercando non è disponibile</p>
        <NuxtLink to="/" class="bg-[#90c149] text-white px-6 py-3 rounded-lg hover:bg-[#7aa83f] transition-colors">
          ← Torna all'elenco
        </NuxtLink>
      </div>
      
      <!-- Modal per ingrandimento immagini -->
      <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click="closeImageModal">
        <div class="relative max-w-4xl max-h-[90vh] p-4 w-full">
          <button 
            @click="closeImageModal"
            class="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all z-10"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- Navigation Arrows per modal -->
          <button 
            v-if="modalImageIndex > 0"
            @click="previousModalImage"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all z-10"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button 
            v-if="modalImageIndex < modalImages.length - 1"
            @click="nextModalImage"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all z-10"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          
          <img 
            :src="modalImages[modalImageIndex]" 
            :alt="`${moto?.marca} ${moto?.modello} - Immagine ${modalImageIndex + 1}`"
            class="max-w-full max-h-full object-contain rounded-lg mx-auto"
            @click.stop
          />
          
          <!-- Dots Indicator per modal -->
          <div v-if="modalImages.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            <button 
              v-for="(_, index) in modalImages.length" 
              :key="index"
              @click="modalImageIndex = index"
              :class="[
                'w-2 h-2 rounded-full transition-all',
                modalImageIndex === index 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              ]"
            ></button>
          </div>
        </div>
      </div>
      
      <!-- Modal Appuntamento Unificato -->
      <UnifiedAppointmentModal 
        v-if="selectedConcessionario && moto"
        :is-open="showAppointmentModal"
        :concessionario="selectedConcessionario"
        tipo="moto_nuova"
        :moto="moto"
        @close="showAppointmentModal = false"
        @booked="handleAppointmentSubmit"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import HeaderMenu from "@/components/HeaderMenu.vue"
  import UnifiedAppointmentModal from "@/components/UnifiedAppointmentModal.vue"
  
  // Types
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
    pesoASecco?: number
    immagineCopertina?: string
    immaginiGallery?: string[]
    concessionari?: Concessionario[]
    // Campi tecnici da Sanity
    potenza?: number
    alimentazione?: string
    trasmissione?: string
    rapporti?: string
    frizione?: string
    lunghezza?: number
    altezza?: number
    frenoAnteriore?: string
    frenoPosteriore?: string
    abs?: string
    ruotaAnteriore?: string
    ruotaPosteriore?: string
    tipoRuote?: string
    colore?: string
    colori?: string[]
    capacitaSerbatoio?: number
    consumo?: number
  }
  
  // State
  const loading = ref(true)
  const moto = ref<Moto | null>(null)
  const currentImageIndex = ref(0)
  const currentDealerImageIndex = ref(0)
  const showImageModal = ref(false)
  const modalImageIndex = ref(0)
  const route = useRoute()
  const cittaSelezionata = ref<string | null>(null)
  const formContatto = ref({
    nome: '',
    email: '',
    telefono: '',
    messaggio: ''
  })
  
  // Computed
  const modalImages = computed(() => {
    if (!moto.value?.immaginiGallery) return []
    return moto.value.immaginiGallery
  })
  
  const cittaDisponibili = computed(() => {
    if (!moto.value?.concessionari) return []
    const citta = moto.value.concessionari.map(c => c.citta)
    const cittaUniche = [...new Set(citta)]
    
    // Se c'è una città selezionata, mettila in cima
    if (cittaSelezionata.value && cittaUniche.includes(cittaSelezionata.value)) {
      const cittaSelezionataIndex = cittaUniche.indexOf(cittaSelezionata.value)
      const cittaSelezionataValue = cittaUniche.splice(cittaSelezionataIndex, 1)[0]
      return [cittaSelezionataValue, ...cittaUniche.sort()]
    }
    
    return cittaUniche.sort()
  })

  // Lista delle città dal database con conteggi
  const tutteLeCitta = computed(() => {
    if (!moto.value?.concessionari) return []
    
    // Conta i concessionari per città
    const cittaCounts = {}
    moto.value.concessionari.forEach(concessionario => {
      const citta = concessionario.citta
      cittaCounts[citta] = (cittaCounts[citta] || 0) + 1
    })
    
    // Crea array di oggetti con città e conteggio
    const cittaConConteggi = Object.entries(cittaCounts).map(([citta, count]) => ({
      citta,
      count
    }))
    
    // Se c'è una città selezionata, mettila in cima
    if (cittaSelezionata.value) {
      const cittaSelezionataIndex = cittaConConteggi.findIndex(c => c.citta === cittaSelezionata.value)
      if (cittaSelezionataIndex !== -1) {
        const cittaSelezionataValue = cittaConConteggi.splice(cittaSelezionataIndex, 1)[0]
        return [cittaSelezionataValue, ...cittaConConteggi.sort((a, b) => a.citta.localeCompare(b.citta))]
      }
    }
    
    return cittaConConteggi.sort((a, b) => a.citta.localeCompare(b.citta))
  })

  // Funzione per gestire il cambio città
  const router = useRouter()
  const onCityChange = () => {
    // Salva la città nel localStorage
    if (cittaSelezionata.value) {
      localStorage.setItem('selectedCity', cittaSelezionata.value)
      console.log('✅ Città salvata nel localStorage:', cittaSelezionata.value)
    } else {
      localStorage.removeItem('selectedCity')
      console.log('❌ Città rimossa dal localStorage')
    }
  }

  // Watch per sincronizzare quando l'URL cambia esternamente
  watch(() => route.query.citta, (newCitta) => {
    const val = (newCitta as string) || ''
    cittaSelezionata.value = val
  })
  
  const concessionariFiltrati = computed(() => {
    if (!moto.value?.concessionari) return []
    if (!cittaSelezionata.value) return moto.value.concessionari
    return moto.value.concessionari.filter(c => c.citta === cittaSelezionata.value)
  })
  
  // Auto scroll
  let autoScrollInterval: NodeJS.Timeout | null = null
  
  const getVisibleImages = () => {
    // Su mobile mostra 1 immagine, su desktop 3
    return 3 // Default per desktop, CSS gestisce il responsive
  }
  
  const getMaxIndex = () => {
    if (!moto.value?.immaginiGallery) return 0
    const visible = getVisibleImages()
    return Math.max(0, moto.value.immaginiGallery.length - visible)
  }
  
  const startAutoScroll = () => {
    if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > getVisibleImages()) {
      autoScrollInterval = setInterval(() => {
        const maxIndex = getMaxIndex()
        currentImageIndex.value = (currentImageIndex.value + 1) % (maxIndex + 1)
      }, 3000)
    }
  }
  
  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval)
      autoScrollInterval = null
    }
  }
  
  // Navigation functions
  const previousImage = () => {
    if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > getVisibleImages()) {
      const maxIndex = getMaxIndex()
      currentImageIndex.value = currentImageIndex.value > 0 ? currentImageIndex.value - 1 : maxIndex
    }
  }
  
  const nextImage = () => {
    if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > getVisibleImages()) {
      const maxIndex = getMaxIndex()
      currentImageIndex.value = (currentImageIndex.value + 1) % (maxIndex + 1)
    }
  }
  
  const previousDealerImage = () => {
    if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > 1) {
      currentDealerImageIndex.value = currentDealerImageIndex.value > 0 ? currentDealerImageIndex.value - 1 : moto.value.immaginiGallery.length - 1
    }
  }
  
  const nextDealerImage = () => {
    if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > 1) {
      currentDealerImageIndex.value = (currentDealerImageIndex.value + 1) % moto.value.immaginiGallery.length
    }
  }
  
  // Modal functions
  const openImageModal = (image: string) => {
    const index = modalImages.value.indexOf(image)
    if (index !== -1) {
      modalImageIndex.value = index
      showImageModal.value = true
    }
  }
  
  const closeImageModal = () => {
    showImageModal.value = false
  }
  
  const previousModalImage = () => {
    if (modalImageIndex.value > 0) {
      modalImageIndex.value--
    }
  }
  
  const nextModalImage = () => {
    if (modalImageIndex.value < modalImages.value.length - 1) {
      modalImageIndex.value++
    }
  }
  
  // Scroll functions
  const scrollToConcessionari = () => {
    document.getElementById('concessionari')?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const scrollToSpecifiche = () => {
    document.getElementById('specifiche')?.scrollIntoView({ behavior: 'smooth' })
  }
  
  // Concessionario functions
  const contattaConcessionario = (concessionario: Concessionario) => {
    if (concessionario.telefono) {
      window.open(`tel:${concessionario.telefono}`, '_self')
    } else if (concessionario.email) {
      window.open(`mailto:${concessionario.email}`, '_self')
    }
  }
  
  // Modal state
  const showAppointmentModal = ref(false)
  const selectedConcessionario = ref<Concessionario | null>(null)
  
  const fissaAppuntamento = (concessionario: Concessionario) => {
    selectedConcessionario.value = concessionario
    showAppointmentModal.value = true
  }
  
  const handleAppointmentSubmit = (appointmentData: any) => {
    console.log('Appuntamento prenotato:', appointmentData)
    // Qui implementerai la logica per salvare l'appuntamento nel database
  }
  
        const inviaMessaggio = async (concessionario: Concessionario) => {
          try {
            console.log('💬 Creazione conversazione con:', concessionario.nome)
            console.log('📝 Dati form:', formContatto.value)
            console.log('📝 Moto:', moto.value?.marca, moto.value?.modello)
            
            // Crea una nuova conversazione
            const response = await $fetch('/api/conversazioni/create', {
              method: 'POST',
              body: {
                motoId: moto.value?.id, // ID di Supabase
                concessionarioId: concessionario._id, // ID di Supabase
                motoMarca: moto.value?.marca,
                motoModello: moto.value?.modello,
                clienteNome: formContatto.value.nome,
                clienteEmail: formContatto.value.email,
                clienteTelefono: formContatto.value.telefono,
                messaggioIniziale: formContatto.value.messaggio,
                clienteId: null // TODO: Collegare con utente autenticato se presente
              }
            })
            
            console.log('✅ Conversazione creata con successo:', response)
            
            // Reset del form
            formContatto.value = {
              nome: '',
              email: '',
              telefono: '',
              messaggio: ''
            }
            
            alert('Messaggio inviato con successo! Il concessionario ti contatterà presto. Se hai un account, puoi vedere la conversazione nella tua dashboard.')
          } catch (error) {
            console.error('❌ Errore nell\'invio del messaggio:', error)
            alert('Errore nell\'invio del messaggio. Riprova.')
          }
        }
  
  
// Fetch data
onMounted(async () => {
  try {
    const route = useRoute()
    const categoria = route.params.categoria as string
    const slug = route.params.slug as string
    
    // Leggi la città dal localStorage
    const cittaFromStorage = localStorage.getItem('selectedCity')
    console.log('Città dal localStorage:', cittaFromStorage)
    
    console.log('Caricamento moto con categoria:', categoria, 'e slug:', slug)
    
    const response = await $fetch('/api/motos/by-slug', {
      method: 'POST',
      body: { categoria, slug, citta: cittaFromStorage }
    })
    console.log('Risposta API:', response)
      
      moto.value = response
      
      // Reset del form quando la moto cambia
      formContatto.value = {
        nome: '',
        email: '',
        telefono: '',
        messaggio: ''
      }
      
      // Imposta la città selezionata dal localStorage dopo che i dati sono caricati
      if (cittaFromStorage) {
        await nextTick() // Aspetta che il DOM sia aggiornato
        cittaSelezionata.value = cittaFromStorage
        console.log('✅ Città impostata dal localStorage:', cittaFromStorage)
        console.log('🏙️ Città disponibili dal database:', moto.value.cittaDisponibili)
        console.log('🏙️ Città disponibili nel dropdown:', tutteLeCitta.value)
        console.log('Città selezionata dopo impostazione:', cittaSelezionata.value)
      } else {
        console.log('❌ Nessuna città nel localStorage')
        console.log('🏙️ Città disponibili dal database:', moto.value.cittaDisponibili)
        console.log('🏙️ Città disponibili nel dropdown:', tutteLeCitta.value)
      }
      
      if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > getVisibleImages()) {
        startAutoScroll()
      }
    } catch (error) {
      console.error('Errore nel caricamento della moto:', error)
      moto.value = null
    } finally {
      loading.value = false
    }
  })
  
  onUnmounted(() => {
    stopAutoScroll()
  })
  </script>
  
  <style scoped>
  html {
    scroll-behavior: smooth;
  }
  </style>