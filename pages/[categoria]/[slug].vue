<template>
    <div class="min-h-screen w-full bg-white">
      <HeaderMenu />
      
        <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
        <div class="text-lg text-gray-600">Caricamento moto...</div>
        </div>
        
      <div v-else-if="moto" class="w-full">
        <!-- 1. Gallery Immagini - PRIMA COSA VISIBILE -->
        <div 
          v-if="tutteLeImmagini && tutteLeImmagini.length > 0" 
          class="relative overflow-hidden w-full"
          @mouseenter="stopAutoScroll"
          @mouseleave="startAutoScroll"
        >
          <div class="flex transition-transform duration-500 ease-in-out" :style="{ transform: `translateX(-${currentImageIndex * 33.33}%)` }">
              <div 
                v-for="(immagine, index) in tutteLeImmagini" 
                :key="index"
              class="w-full md:w-1/3 flex-shrink-0 h-96 bg-gray-100"
              >
                <img 
                  :src="immagine" 
                  :alt="`${moto.marca} ${moto.modello} - Immagine ${index + 1}`"
                class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                @click="openImageModal(immagine)"
                @error="handleImageError"
                />
            </div>
          </div>
  
          <!-- Navigation Arrows -->
          <button 
            v-if="tutteLeImmagini.length > getVisibleImages()"
            @click="previousImage"
            class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <button 
            v-if="tutteLeImmagini.length > getVisibleImages()"
            @click="nextImage"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
  
            <!-- Dots Indicator -->
          <div v-if="tutteLeImmagini.length > getVisibleImages()" class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
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

        <!-- 2. Info Principali: Titolo, Tag, Prezzo, Filtro, Città -->
        <div class="w-full bg-white px-4 py-6">
          <div class="max-w-4xl mx-auto">
            <!-- 2. Titolo Moto -->
            <div class="text-center mb-4">
              <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-2">{{ moto.marca }} {{ moto.modello }}</h1>
              <p v-if="moto.allestimento" class="text-lg md:text-2xl text-gray-600">{{ moto.allestimento }}</p>
            </div>

            <!-- 3. Tag Caratteristiche - DOPO IL TITOLO -->
            <div class="flex flex-wrap gap-2 justify-center mb-6">
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

            <!-- 4. Blocco Prezzo -->
            <div v-if="moto.prezzo" class="text-center mb-6">
              <div class="text-3xl md:text-4xl font-bold text-gray-900">
                € {{ moto.prezzo.toLocaleString() }}
              </div>
            </div>

            <!-- 5. Filtro Città - DOPO IL PREZZO -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2 text-center">Seleziona città</label>
              <select 
                v-model="cittaSelezionata"
                @change="onCityChange"
                class="w-full max-w-md mx-auto p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#90c149] focus:border-transparent block"
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

            <!-- 6. Città Selezionata - VISUALIZZAZIONE -->
            <div v-if="cittaSelezionata" class="max-w-md mx-auto mb-6">
              <div class="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p class="text-sm text-green-800">
                  <span class="font-semibold">{{ cittaSelezionata }}</span> - 
                  {{ concessionariFiltrati.length }} concessionari disponibili
                </p>
              </div>
            </div>

            <!-- Pulsante Specifiche Tecniche -->
            <div class="text-center mb-6">
              <button 
                @click="showTechSpecsModal = true"
                class="bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold text-base hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Specifiche Tecniche
              </button>
            </div>
          </div>
        </div>

        <!-- 7. Card Concessionari - DOPO LA CITTÀ SELEZIONATA -->
        <div id="concessionari" class="w-full bg-gray-50 py-6">
          <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-4">
              <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <svg class="w-5 h-5 md:w-6 md:h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Concessionari Disponibili
              </h2>
              <p class="text-sm text-gray-600">Moto in pronta consegna</p>
            </div>

            <!-- Lista Concessionari COMPATTA - Layout 2 Colonne -->
            <div v-if="concessionariFiltrati && concessionariFiltrati.length > 0" class="space-y-4">
              <div 
                v-for="(concessionario, index) in concessionariFiltrati" 
                :key="concessionario._id"
                class="bg-white rounded-lg shadow p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 hover:shadow-lg transition-shadow"
              >
                <!-- Colonna Sinistra: Immagine -->
                <div class="flex-shrink-0">
                  <img 
                    :src="concessionario.foto_principale || concessionario.immagineUrl || moto.immagineCopertina || 'https://via.placeholder.com/120x90'" 
                    :alt="`${concessionario.nome} - ${moto.marca} ${moto.modello}`"
                    class="w-32 h-24 object-cover rounded-lg"
                    @error="$event.target.src='https://via.placeholder.com/120x90'"
                  />
                </div>

                <!-- Colonna Destra: Contenuto -->
                <div class="flex-1 min-w-0">
                  <!-- Nome Concessionario e Indirizzo -->
                  <div class="mb-2">
                    <div class="flex items-start justify-between gap-2">
                      <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ concessionario.nome }}</h3>
                      <!-- Stelle Recensioni -->
                      <button 
                        v-if="concessionario.numero_recensioni && concessionario.numero_recensioni > 0"
                        @click="apriRecensioni(concessionario)"
                        class="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity"
                      >
                        <div class="flex items-center gap-0.5">
                          <svg 
                            v-for="i in 5" 
                            :key="i"
                            class="w-4 h-4"
                            :class="i <= Math.round(concessionario.rating_medio || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span class="text-gray-700 font-medium">{{ concessionario.rating_medio?.toFixed(1) || '0.0' }}</span>
                        <span class="text-gray-500 text-xs">({{ concessionario.numero_recensioni }})</span>
                      </button>
                      <div 
                        v-else
                        class="flex items-center gap-1 text-sm text-gray-400"
                      >
                        <div class="flex items-center gap-0.5">
                          <svg 
                            v-for="i in 5" 
                            :key="i"
                            class="w-4 h-4 text-gray-300"
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span class="text-xs">Nessuna recensione</span>
                      </div>
                    </div>
                    <div class="flex items-start gap-2 mt-1">
                      <svg class="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <div class="flex-1">
                        <p class="text-sm text-gray-600">
                          <span v-if="concessionario.via">{{ concessionario.via }}, </span>
                          {{ concessionario.citta }}, {{ concessionario.provincia }}
                        </p>
                        <button 
                          @click="apriMappa(concessionario)"
                          class="text-xs text-[#90c149] hover:text-[#7aa83f] mt-1 flex items-center gap-1"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                          </svg>
                          Visualizza sulla mappa
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Prezzi -->
                  <div class="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div class="flex items-center text-gray-700">
                        <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <span class="text-sm text-gray-600">Prezzo di Listino:</span>
                        <span class="font-semibold ml-2 text-gray-800">€{{ moto.prezzo?.toLocaleString('it-IT') || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center text-gray-700">
                        <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span class="text-sm text-gray-600">Il Tuo Prezzo:</span>
                        <span class="font-bold ml-2 text-[#90c149] text-lg">€{{ (concessionario.prezzo_speciale || moto.prezzo)?.toLocaleString('it-IT') || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Dettagli: Quantità, Colore, Promozioni, Note -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                    <div class="flex items-center text-gray-700">
                      <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7V4c0-1.105 3.582-2 8-2s8 .895 8 2v3M12 20v-9"></path>
                      </svg>
                      <span class="text-gray-600">Quantità:</span>
                      <span class="font-semibold ml-1 text-gray-800">{{ concessionario.quantita || 1 }}</span>
                    </div>
                    
                    <div v-if="concessionario.colore" class="flex items-center text-gray-700">
                      <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                      </svg>
                      <span class="text-gray-600">Colore:</span>
                      <span class="font-semibold ml-1 text-gray-800">{{ concessionario.colore }}</span>
                    </div>
                    
                    <div class="flex items-center text-gray-700">
                      <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      <span class="text-gray-600">Promozioni:</span>
                      <span class="font-semibold ml-1 text-[#90c149]">{{ getActivePromotionsCount(concessionario.promozioni) }} attive</span>
                    </div>
                    
                    <div v-if="concessionario.note" class="flex items-center text-gray-700">
                      <svg class="w-4 h-4 mr-2 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      <span class="text-gray-600">Note:</span>
                      <span class="font-semibold ml-1 text-gray-800">Presenti</span>
                    </div>
                  </div>

                  <!-- Promozioni Attive -->
                  <div class="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 class="text-sm font-semibold text-green-800 mb-2">Promozioni Attive:</h4>
                    <div class="flex flex-wrap gap-2">
                      <template v-if="getActivePromotions(concessionario.promozioni).length > 0">
                        <span 
                          v-for="promo in getActivePromotions(concessionario.promozioni)" 
                          :key="promo"
                          class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {{ promo }}
                        </span>
                      </template>
                      <span v-else class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Nessuna promozione attiva
                      </span>
                    </div>
                  </div>

                  <!-- CTA Buttons -->
                  <div class="flex flex-wrap gap-2 mt-4">
                    <button 
                      @click="contattaConcessionario(concessionario)"
                      class="bg-[#90c149] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#7aa83f] transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      Contatta
                    </button>
                    <button 
                      @click="fissaAppuntamento(concessionario)"
                      class="bg-white text-[#90c149] border-2 border-[#90c149] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Appuntamento
                    </button>
                    <button 
                      v-if="concessionario.telefono"
                      @click="mostraNumero(concessionario)"
                      class="bg-gray-100 text-gray-700 border-2 border-gray-300 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span v-if="!showPhoneNumbers[concessionario._id || concessionario.id]">Mostra Numero</span>
                      <span v-else class="font-mono">{{ concessionario.telefono }}</span>
                    </button>
                    <NuxtLink 
                      :to="`/concessionario/${concessionario.id || concessionario._id}`"
                      class="bg-gray-100 text-gray-700 border-2 border-gray-300 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Pagina Venditore
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8">
              <p class="text-gray-500 text-sm">Nessun concessionario disponibile per questa moto al momento.</p>
            </div>
          </div>
        </div>
  
      <!-- Modal Specifiche Tecniche -->
      <div v-if="showTechSpecsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showTechSpecsModal = false">
        <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header Modal -->
          <div class="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold mb-1 flex items-center gap-2">
                <svg class="w-6 h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Scheda Tecnica Completa
              </h2>
              <p class="text-lg opacity-90">{{ moto.marca }} {{ moto.modello }}</p>
            </div>
            <button 
              @click="showTechSpecsModal = false"
              class="text-gray-400 hover:text-white"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Contenuto Specifiche -->
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Motore -->
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Motore
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Cilindrata</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.cilindrata || 'N/A' }} cc</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Potenza</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.potenza || 'N/A' }} CV</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Alimentazione</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.alimentazione || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Trasmissione -->
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Trasmissione
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Tipo</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.trasmissione || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Rapporti</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.rapporti || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Frizione</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.frizione || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Dimensioni -->
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                  </svg>
                  Dimensioni
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Peso a secco</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.pesoASecco || 'N/A' }} kg</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Lunghezza</div>
                    <div class="text-sm font-bold text-gray-900">
                      <span v-if="moto.lunghezza">
                        {{ moto.lunghezza < 10 ? Math.round(moto.lunghezza * 1000) : Math.round(moto.lunghezza) }} mm
                      </span>
                      <span v-else>N/A</span>
                    </div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Altezza</div>
                    <div class="text-sm font-bold text-gray-900">
                      <span v-if="moto.altezza">
                        {{ moto.altezza < 10 ? Math.round(moto.altezza * 1000) : Math.round(moto.altezza) }} mm
                      </span>
                      <span v-else>N/A</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Freni -->
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Freni
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Anteriore</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.frenoAnteriore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Posteriore</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.frenoPosteriore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">ABS</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.abs || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Ruote -->
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                  </svg>
                  Ruote
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Anteriore</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.ruotaAnteriore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Posteriore</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.ruotaPosteriore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Tipo</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.tipoRuote || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Altro -->
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Altro
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Colore</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.colore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Serbatoio</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.capacitaSerbatoio || 'N/A' }} L</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Consumo</div>
                    <div class="text-sm font-bold text-gray-900">{{ moto.consumo || 'N/A' }} L/100km</div>
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
      
      <!-- Modal Contatto Unificato -->
      <UnifiedContactModal 
        v-if="selectedConcessionario && moto"
        :is-open="showContactModal"
        :concessionario="selectedConcessionario"
        tipo="moto_nuova"
        :moto="moto"
        @close="showContactModal = false"
        @sent="handleContactSent"
      />
      
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

      <!-- Modal Mappa Google Maps -->
      <div 
        v-if="showMapModal && selectedConcessionarioForMap" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showMapModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header Modal -->
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ selectedConcessionarioForMap.nome }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                <span v-if="selectedConcessionarioForMap.via">{{ selectedConcessionarioForMap.via }}, </span>
                {{ selectedConcessionarioForMap.citta }}, {{ selectedConcessionarioForMap.provincia }}
              </p>
            </div>
            <button 
              @click="showMapModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Mappa -->
          <div class="flex-1 relative" style="min-height: 400px;">
            <iframe
              :src="getGoogleMapsUrl(selectedConcessionarioForMap)"
              width="100%"
              height="100%"
              style="border:0; min-height: 400px;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          
          <!-- Footer con link -->
          <div class="p-4 border-t border-gray-200 bg-gray-50">
            <a 
              :href="getGoogleMapsLink(selectedConcessionarioForMap)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-[#90c149] hover:text-[#7aa83f] font-medium text-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Apri in Google Maps
            </a>
          </div>
        </div>
      </div>

      <!-- Modal Recensioni -->
      <div 
        v-if="showRecensioniModal && selectedConcessionario" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="showRecensioniModal = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header Modal -->
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Recensioni - {{ selectedConcessionario.nome }}</h3>
              <div v-if="selectedConcessionario.rating_medio && selectedConcessionario.numero_recensioni" class="flex items-center gap-2 mt-1">
                <div class="flex items-center gap-0.5">
                  <svg 
                    v-for="i in 5" 
                    :key="i"
                    class="w-5 h-5"
                    :class="i <= Math.round(selectedConcessionario.rating_medio) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span class="text-gray-700 font-semibold">{{ selectedConcessionario.rating_medio.toFixed(1) }}</span>
                <span class="text-gray-500 text-sm">su {{ selectedConcessionario.numero_recensioni }} recensioni</span>
              </div>
            </div>
            <button 
              @click="showRecensioniModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Lista Recensioni -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="loadingRecensioni" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#90c149] mx-auto mb-2"></div>
              <p class="text-gray-500 text-sm">Caricamento recensioni...</p>
            </div>
            <div v-else-if="recensioni.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
              <p class="text-gray-500">Nessuna recensione disponibile</p>
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="recensione in recensioni" 
                :key="recensione.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="font-semibold text-gray-900">{{ recensione.nome_utente }}</h4>
                      <span v-if="recensione.verificata" class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        Verificata
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="flex items-center gap-0.5">
                        <svg 
                          v-for="i in 5" 
                          :key="i"
                          class="w-4 h-4"
                          :class="i <= recensione.voto ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      </div>
                      <span class="text-xs text-gray-500">{{ formatDate(recensione.created_at) }}</span>
                    </div>
                  </div>
                </div>
                <h5 v-if="recensione.titolo" class="font-medium text-gray-900 mb-1">{{ recensione.titolo }}</h5>
                <p v-if="recensione.commento" class="text-sm text-gray-700 whitespace-pre-wrap">{{ recensione.commento }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import HeaderMenu from "@/components/HeaderMenu.vue"
  import UnifiedContactModal from "@/components/UnifiedContactModal.vue"
  import UnifiedAppointmentModal from "@/components/UnifiedAppointmentModal.vue"
  
  // Types
  interface Concessionario {
    _id: string
    id?: string
    nome: string
    citta: string
    provincia: string
    via?: string
    telefono?: string
    email?: string
    prezzo_speciale?: number
    disponibile?: boolean
    quantita?: number
    colore?: string
    promozioni?: any // JSONB con le promozioni
    foto_principale?: string
    foto_gallery?: string[] // JSONB array con le foto
    note?: string
    immagineUrl?: string
    rating_medio?: number
    numero_recensioni?: number
  }
  
  interface Recensione {
    id: string
    nome_utente: string
    voto: number
    titolo?: string
    commento?: string
    verificata: boolean
    created_at: string
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
  const showPhoneNumbers = ref<Record<string, boolean>>({})
  const showContactModal = ref(false)
  const showAppointmentModal = ref(false)
  const showTechSpecsModal = ref(false)
  const selectedConcessionario = ref<Concessionario | null>(null)
  const showMapModal = ref(false)
  const selectedConcessionarioForMap = ref<Concessionario | null>(null)
  const showRecensioniModal = ref(false)
  const recensioni = ref<Recensione[]>([])
  const loadingRecensioni = ref(false)
  
  // Computed
  const tutteLeImmagini = computed(() => {
    const immagini = []
    
    // Aggiungi immagine copertina se disponibile
    if (moto.value?.immagineCopertina) {
      immagini.push(moto.value.immagineCopertina)
    }
    
    // Aggiungi immagini gallery se disponibili
    if (moto.value?.immaginiGallery && Array.isArray(moto.value.immaginiGallery)) {
      moto.value.immaginiGallery.forEach(img => {
        if (img && !immagini.includes(img)) {
          immagini.push(img)
        }
      })
    }
    
    console.log('🖼️ Tutte le immagini calcolate:', immagini)
    return immagini
  })
  
  const modalImages = computed(() => {
    return tutteLeImmagini.value
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
    if (!tutteLeImmagini.value || tutteLeImmagini.value.length === 0) return 0
    const visible = getVisibleImages()
    return Math.max(0, tutteLeImmagini.value.length - visible)
  }
  
  const handleImageError = (event: Event) => {
    console.error('❌ Errore caricamento immagine:', event)
    const img = event.target as HTMLImageElement
    img.style.display = 'none'
  }
  
  const startAutoScroll = () => {
    if (tutteLeImmagini.value && tutteLeImmagini.value.length > getVisibleImages()) {
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
    if (tutteLeImmagini.value && tutteLeImmagini.value.length > getVisibleImages()) {
      const maxIndex = getMaxIndex()
      currentImageIndex.value = currentImageIndex.value > 0 ? currentImageIndex.value - 1 : maxIndex
    }
  }
  
  const nextImage = () => {
    if (tutteLeImmagini.value && tutteLeImmagini.value.length > getVisibleImages()) {
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
    selectedConcessionario.value = concessionario
    showContactModal.value = true
  }
  
  const fissaAppuntamento = (concessionario: Concessionario) => {
    selectedConcessionario.value = concessionario
    showAppointmentModal.value = true
  }
  
  const mostraNumero = (concessionario: Concessionario) => {
    const id = concessionario._id || concessionario.id
    showPhoneNumbers.value[id] = !showPhoneNumbers.value[id]
  }
  
  const apriMappa = (concessionario: Concessionario) => {
    selectedConcessionarioForMap.value = concessionario
    showMapModal.value = true
  }
  
  const apriRecensioni = async (concessionario: Concessionario) => {
    selectedConcessionario.value = concessionario
    showRecensioniModal.value = true
    loadingRecensioni.value = true
    recensioni.value = []
    
    try {
      const concessionarioId = concessionario.id || concessionario._id
      const data = await $fetch(`/api/recensioni/${concessionarioId}`)
      recensioni.value = data.recensioni || []
    } catch (error) {
      console.error('Errore nel caricamento delle recensioni:', error)
      recensioni.value = []
    } finally {
      loadingRecensioni.value = false
    }
  }
  
  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('it-IT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  const getGoogleMapsUrl = (concessionario: Concessionario): string => {
    const indirizzo = [
      concessionario.via,
      concessionario.citta,
      concessionario.provincia,
      'Italia'
    ].filter(Boolean).join(', ')
    // Usa il formato embed senza chiave API
    return `https://www.google.com/maps?q=${encodeURIComponent(indirizzo)}&output=embed`
  }
  
  const getGoogleMapsLink = (concessionario: Concessionario): string => {
    const indirizzo = [
      concessionario.via,
      concessionario.citta,
      concessionario.provincia,
      'Italia'
    ].filter(Boolean).join(', ')
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(indirizzo)}`
  }
  
  const handleContactSent = () => {
    showContactModal.value = false
    alert('Richiesta inviata con successo! Il concessionario ti contatterà presto.')
  }
  
  const handleAppointmentSubmit = (appointmentData: any) => {
    console.log('Appuntamento prenotato:', appointmentData)
    showAppointmentModal.value = false
    alert('Appuntamento prenotato con successo! Il concessionario ti contatterà per confermare.')
  }
  
  // Funzioni per gestire le promozioni (come nella pagina del dealer)
  const getActivePromotions = (promozioniJson: any): string[] => {
    if (!promozioniJson) return []
    try {
      const promozioni = typeof promozioniJson === 'string' ? JSON.parse(promozioniJson) : promozioniJson
      const activePromotions: string[] = []
      
      if (promozioni.bollaInclusa) activePromotions.push('Bollo inclusa')
      if (promozioni.messaSuStrada) activePromotions.push('Messa su strada gratis')
      if (promozioni.garanziaEstesa) activePromotions.push('Garanzia estesa 2 anni')
      if (promozioni.primaRevisione) activePromotions.push('Prima revisione gratis')
      if (promozioni.assicurazioneScontata) activePromotions.push('Assicurazione scontata')
      
      // Se è un array di stringhe, restituiscilo direttamente
      if (Array.isArray(promozioni)) {
        return promozioni.filter(Boolean)
      }
      
      return activePromotions
    } catch (e) {
      console.error('Errore nel parsing delle promozioni:', e)
      return []
    }
  }
  
  const getActivePromotionsCount = (promozioniJson: any): number => {
    if (!promozioniJson) return 0
    try {
      const promozioni = typeof promozioniJson === 'string' ? JSON.parse(promozioniJson) : promozioniJson
      if (Array.isArray(promozioni)) {
        return promozioni.filter(Boolean).length
      }
      return Object.values(promozioni).filter(Boolean).length
    } catch (e) {
      return 0
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
    console.log('🖼️ Immagini Gallery:', response.immaginiGallery)
    console.log('🖼️ Tipo immaginiGallery:', typeof response.immaginiGallery)
    console.log('🖼️ È array?', Array.isArray(response.immaginiGallery))
    console.log('🖼️ Lunghezza:', response.immaginiGallery?.length)
      
      moto.value = response
      
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
      
      if (tutteLeImmagini.value && tutteLeImmagini.value.length > getVisibleImages()) {
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