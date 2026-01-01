<template>
  <div class="min-h-screen w-full bg-white">
    <HeaderMenu />
    
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#90c149] mx-auto mb-4"></div>
      <div class="text-lg text-gray-600">Caricamento moto...</div>
    </div>
      
    <div v-else-if="moto" class="w-full">
      <!-- Gallery Semplice - Una singola immagine alla volta -->
      <div 
        v-if="moto.immaginiGallery && moto.immaginiGallery.length > 0" 
        class="relative overflow-hidden w-full bg-gray-100"
        @mouseenter="stopAutoScroll"
        @mouseleave="startAutoScroll"
      >
        <div class="flex transition-transform duration-500 ease-in-out" :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
          <div 
            v-for="(immagine, index) in moto.immaginiGallery" 
            :key="index"
            class="w-full flex-shrink-0 h-64 md:h-80 bg-gray-100"
          >
            <img 
              :src="immagine" 
              :alt="`${moto.marca} ${moto.modello} - Immagine ${index + 1}`"
              class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300"
              @click="openImageModal(immagine)"
            />
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button 
          v-if="moto.immaginiGallery.length > 1"
          @click="previousImage"
          class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button 
          v-if="moto.immaginiGallery.length > 1"
          @click="nextImage"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <!-- Dots Indicator -->
        <div v-if="moto.immaginiGallery.length > 1" class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
          <button 
            v-for="(_, index) in moto.immaginiGallery.length" 
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
      <div v-else class="bg-gray-200 flex items-center justify-center h-64 md:h-80">
        <div class="text-center">
          <div class="text-6xl mb-4">🏍️</div>
          <p class="text-gray-600">Nessuna immagine disponibile</p>
        </div>
      </div>

      <!-- Info Principali Compatte -->
      <div class="w-full bg-white px-4 py-4">
        <div class="text-center mb-4">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{{ moto.marca }} {{ moto.modello }}</h1>
          <p v-if="moto.allestimento" class="text-base md:text-lg text-gray-600 mb-2">{{ moto.allestimento }}</p>
          
          <!-- Prezzo -->
          <div v-if="moto.prezzo" class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            € {{ moto.prezzo.toLocaleString() }}
          </div>
          
          <!-- Tag Caratteristiche Essenziali -->
          <div class="flex flex-wrap gap-2 justify-center">
            <span v-if="moto.categoria" class="bg-[#90c149] text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              {{ moto.categoria }}
            </span>
            <span v-if="moto.cilindrata" class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              {{ moto.cilindrata }} cc
            </span>
            <span v-if="moto.pesoASecco" class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              {{ moto.pesoASecco }} kg
            </span>
          </div>
        </div>
      </div>

      <!-- Filtro Città Compatto -->
      <div v-if="cittaDisponibili.length > 0" class="w-full bg-gray-50 px-4 py-4 border-b border-gray-200">
        <div class="max-w-7xl mx-auto">
          <h3 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Filtra per città
          </h3>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="citta in cittaDisponibili" 
              :key="citta"
              @click="filtraPerCitta(citta)"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors',
                cittaSelezionata === citta 
                  ? 'bg-[#90c149] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              ]"
            >
              {{ citta }}
            </button>
          </div>
          <div v-if="cittaSelezionata" class="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-xs text-green-800">
              <span class="font-semibold">{{ cittaSelezionata }}</span> - 
              {{ concessionariFiltrati.length }} concessionari
            </p>
          </div>
        </div>
      </div>

      <!-- Lista Concessionari Compatta -->
      <div id="concessionari" class="w-full bg-gray-50 py-6">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-6">
            <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Concessionari Disponibili
            </h2>
            <p class="text-sm md:text-base text-gray-600">Moto in pronta consegna</p>
          </div>

          <!-- Lista Concessionari -->
          <div v-if="!moto.concessionari || moto.concessionari.length === 0" class="text-center py-8">
            <div class="text-gray-500 text-base">
              <p>Nessun concessionario disponibile per questa moto al momento.</p>
            </div>
          </div>
          
          <div v-else-if="concessionariFiltrati && concessionariFiltrati.length > 0" class="space-y-4">
            <div 
              v-for="(concessionario, index) in concessionariFiltrati" 
              :key="concessionario._id || concessionario.id || index"
              class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <!-- Header Concessionario Compatto -->
              <div class="bg-gradient-to-r from-[#90c149] to-[#7aa83f] p-3 md:p-4 text-white">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 md:gap-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-base md:text-xl">🏪</span>
                    </div>
                    <div>
                      <h3 class="text-base md:text-lg font-bold">{{ concessionario.nome }}</h3>
                      <p class="text-xs md:text-sm opacity-90">{{ concessionario.citta }}, {{ concessionario.provincia }}</p>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="text-sm md:text-base font-bold">⭐ 4.8</div>
                    <div class="text-xs opacity-90">Rating</div>
                  </div>
                </div>
              </div>
              
              <!-- Contenuto Card Compatto -->
              <div class="p-3 md:p-4">
                <!-- Prezzo e Disponibilità -->
                <div class="mb-3">
                  <div v-if="concessionario.prezzo_speciale || moto.prezzo" class="bg-gradient-to-r from-[#90c149] to-[#7aa83f] rounded-lg p-3 text-white mb-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-xs opacity-90">Prezzo</div>
                        <div class="text-lg md:text-xl font-bold">€ {{ (concessionario.prezzo_speciale || moto.prezzo)?.toLocaleString('it-IT') }}</div>
                        <div v-if="concessionario.prezzo_speciale && moto.prezzo && concessionario.prezzo_speciale < moto.prezzo" class="text-xs opacity-90 mt-1">
                          Listino: € {{ moto.prezzo.toLocaleString('it-IT') }}
                        </div>
                      </div>
                      <div v-if="concessionario.prezzo_speciale && moto.prezzo && concessionario.prezzo_speciale < moto.prezzo" class="text-right flex-shrink-0">
                        <div class="text-sm font-bold">-€ {{ (moto.prezzo - concessionario.prezzo_speciale).toLocaleString('it-IT') }}</div>
                        <div class="text-xs opacity-90">Risparmio</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-2">
                    <span class="text-lg">✅</span>
                    <span class="font-medium">Disponibile in Pronta Consegna</span>
                  </div>
                </div>

                <!-- CTA Principali -->
                <div class="flex flex-col sm:flex-row gap-2">
                  <button 
                    @click="contattaConcessionario(concessionario)"
                    class="flex-1 bg-[#90c149] text-white px-4 py-2.5 rounded-lg font-semibold text-sm md:text-base hover:bg-[#7aa83f] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Contatta
                  </button>
                  <button 
                    @click="fissaAppuntamento(concessionario)"
                    class="flex-1 bg-white text-[#90c149] border-2 border-[#90c149] px-4 py-2.5 rounded-lg font-semibold text-sm md:text-base hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Appuntamento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scheda Tecnica Collassabile -->
      <div id="specifiche" class="w-full bg-white py-6 border-t border-gray-200">
        <div class="max-w-7xl mx-auto px-4">
          <button
            @click="showTechSpecs = !showTechSpecs"
            class="w-full bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 text-white flex items-center justify-between hover:from-gray-700 hover:to-gray-800 transition-colors"
          >
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 md:w-6 md:h-6 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div class="text-left">
                <h2 class="text-lg md:text-xl font-bold">Scheda Tecnica</h2>
                <p class="text-sm opacity-90">{{ moto.marca }} {{ moto.modello }}</p>
              </div>
            </div>
            <svg 
              class="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300"
              :class="{ 'rotate-180': showTechSpecs }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <!-- Contenuto Scheda Tecnica Collassabile -->
          <div 
            v-show="showTechSpecs"
            class="mt-4 bg-white rounded-xl border border-gray-200 p-4 md:p-6"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <!-- Motore -->
              <div class="space-y-2">
                <h3 class="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 md:w-5 md:h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Motore
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Cilindrata</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.cilindrata || 'N/A' }} cc</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Potenza</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.potenza || 'N/A' }} CV</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Alimentazione</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.alimentazione || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Trasmissione -->
              <div class="space-y-2">
                <h3 class="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 md:w-5 md:h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Trasmissione
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Tipo</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.trasmissione || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Rapporti</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.rapporti || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Frizione</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.frizione || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Dimensioni -->
              <div class="space-y-2">
                <h3 class="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 md:w-5 md:h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                  </svg>
                  Dimensioni
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Peso a secco</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.pesoASecco || 'N/A' }} kg</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Lunghezza</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">
                      <span v-if="moto.lunghezza">
                        {{ moto.lunghezza < 10 ? Math.round(moto.lunghezza * 1000) : Math.round(moto.lunghezza) }} mm
                      </span>
                      <span v-else>N/A</span>
                    </div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Altezza</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">
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
                <h3 class="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 md:w-5 md:h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Freni
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Anteriore</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.frenoAnteriore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Posteriore</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.frenoPosteriore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">ABS</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.abs || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Ruote -->
              <div class="space-y-2">
                <h3 class="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 md:w-5 md:h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                  </svg>
                  Ruote
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Anteriore</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.ruotaAnteriore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Posteriore</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.ruotaPosteriore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Tipo</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.tipoRuote || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <!-- Altro -->
              <div class="space-y-2">
                <h3 class="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 md:w-5 md:h-5 text-[#90c149]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Altro
                </h3>
                <div class="space-y-2">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Colore</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.colore || 'N/A' }}</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Serbatoio</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.capacitaSerbatoio || 'N/A' }} L</div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="text-xs text-gray-600 mb-1">Consumo</div>
                    <div class="text-sm md:text-base font-bold text-gray-900">{{ moto.consumo || 'N/A' }} L/100km</div>
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
    
    <!-- Modal Appuntamento -->
    <AppointmentModal 
      v-if="selectedConcessionario"
      :is-open="showAppointmentModal"
      :concessionario="selectedConcessionario"
      :servizio="`${moto?.marca} ${moto?.modello}`"
      @close="showAppointmentModal = false"
      @submit="handleAppointmentSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import HeaderMenu from "@/components/HeaderMenu.vue"
import AppointmentModal from "@/components/AppointmentModal.vue"

// Types
interface Concessionario {
  _id: string
  nome: string
  citta: string
  provincia: string
  telefono?: string
  email?: string
  prezzo_speciale?: number
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
const showImageModal = ref(false)
const modalImageIndex = ref(0)
const cittaSelezionata = ref<string | null>(null)
const showTechSpecs = ref(true)

// Computed
const modalImages = computed(() => {
  if (!moto.value?.immaginiGallery) return []
  return moto.value.immaginiGallery
})

const cittaDisponibili = computed(() => {
  if (!moto.value?.concessionari) return []
  const citta = moto.value.concessionari.map(c => c.citta)
  return [...new Set(citta)].sort()
})

const concessionariFiltrati = computed(() => {
  if (!moto.value?.concessionari) return []
  if (!cittaSelezionata.value) return moto.value.concessionari
  return moto.value.concessionari.filter(c => c.citta === cittaSelezionata.value)
})

// Auto scroll
let autoScrollInterval: NodeJS.Timeout | null = null

const startAutoScroll = () => {
  if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > 1) {
    autoScrollInterval = setInterval(() => {
      currentImageIndex.value = (currentImageIndex.value + 1) % moto.value!.immaginiGallery!.length
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
  if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > 1) {
    currentImageIndex.value = currentImageIndex.value > 0 ? currentImageIndex.value - 1 : moto.value.immaginiGallery.length - 1
  }
}

const nextImage = () => {
  if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % moto.value.immaginiGallery.length
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

// Filtro città
const filtraPerCitta = (citta: string) => {
  cittaSelezionata.value = cittaSelezionata.value === citta ? null : citta
}

// Fetch data
onMounted(async () => {
  try {
    const route = useRoute()
    const motoId = route.params.id as string
    
    console.log('🔍 Caricamento moto con ID:', motoId)
    
    const response = await $fetch(`/api/motos/${motoId}`)
    console.log('✅ Risposta API ricevuta:', response)
    console.log('📊 Concessionari nella risposta:', response.concessionari?.length || 0)
    if (response.concessionari && response.concessionari.length > 0) {
      console.log('🏢 Concessionari:', response.concessionari.map(c => `${c.nome} - ${c.citta}`))
    }
    
    moto.value = response
    
    if (moto.value?.immaginiGallery && moto.value.immaginiGallery.length > 1) {
      startAutoScroll()
    }
  } catch (error) {
    console.error('❌ Errore nel caricamento della moto:', error)
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

