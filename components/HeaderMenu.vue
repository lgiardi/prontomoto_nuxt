<template>
  <header class="bg-white border-b border-gray-200">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo con link alla home -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center">
          <img 
            src="https://prontomoto.it/wp-content/uploads/2025/06/Risorsa-12.svg" 
            alt="ProntoMoto Logo" 
            class="h-10 w-auto"
          />
          </NuxtLink>
        </div>

        <!-- Menu Navigation -->
        <nav class="hidden md:flex space-x-8">
          <NuxtLink to="/moto" class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
            Cerca Moto, Scooter e Servizi in tutta Italia
          </NuxtLink>
          
          <!-- Nuovo Dropdown -->
          <div class="relative" @mouseenter="showNuovo = true" @mouseleave="showNuovo = false">
            <button class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors flex items-center">
              Nuovo
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div v-if="showNuovo" class="absolute top-full left-0 pt-1 w-56 z-50">
              <div class="bg-white rounded-lg shadow-lg border border-gray-200">
                <div class="py-1">
                  <NuxtLink to="/moto/nuovo" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    Vedi Tutte
                  </NuxtLink>
                  <NuxtLink to="/moto/nuovo/piu-vendute" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    40 Moto più vendute
                  </NuxtLink>
                  <NuxtLink to="/moto/nuovo/scooter-piu-venduti" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    40 Scooter più venduti
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Usato Dropdown -->
          <div class="relative" @mouseenter="showUsato = true" @mouseleave="showUsato = false">
            <button class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors flex items-center">
              Usato
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div v-if="showUsato" class="absolute top-full left-0 pt-1 w-48 z-50">
              <div class="bg-white rounded-lg shadow-lg border border-gray-200">
                <div class="py-1">
                  <NuxtLink to="/moto/usato/privati" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Da privati
                  </NuxtLink>
                  <NuxtLink to="/moto/usato/concessionari" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Da concessionari
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Servizi Dropdown -->
          <div class="relative" @mouseenter="showServizi = true" @mouseleave="showServizi = false">
            <button class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors flex items-center">
            Servizi
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div v-if="showServizi" class="absolute top-full left-0 pt-1 w-56 z-50">
              <div class="bg-white rounded-lg shadow-lg border border-gray-200">
                <div class="py-1">
                  <NuxtLink to="/servizi/tagliando" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Tagliando
                  </NuxtLink>
                  <NuxtLink to="/servizi/revisione" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Revisione
                  </NuxtLink>
                  <NuxtLink to="/servizi/gomme" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                    </svg>
                    Sostituzione Gomme
                  </NuxtLink>
                  <NuxtLink to="/servizi/manutenzione" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                    </svg>
                    Manutenzione
                  </NuxtLink>
                  <NuxtLink to="/servizi/assistenza" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"></path>
                    </svg>
                    Assistenza Stradale
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
          
          <NuxtLink to="/assicurazioni" class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
            Assicurazioni
          </NuxtLink>
          <NuxtLink to="/finanziamenti" class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
            Finanziamenti
          </NuxtLink>
        </nav>

        <!-- CTA Buttons -->
        <div class="flex items-center space-x-4">
          <div v-if="user" class="hidden md:flex items-center space-x-4">
            <!-- User Menu Dropdown -->
            <div class="relative" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
              <button class="flex items-center space-x-2 text-gray-700 hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
                <span>👤</span>
                <span>{{ user.email?.split('@')[0] || 'Utente' }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- User Dropdown Menu -->
              <div v-if="showUserMenu" class="absolute top-full right-0 pt-1 w-56 z-50">
                <div class="bg-white rounded-lg shadow-lg border border-gray-200">
                  <div class="py-1">
                    <div class="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      {{ user.email }}
                      <div class="text-xs text-[#90c149] font-medium">
                        {{ userType === 'concessionario' ? '🏪 Concessionario' : '👤 Cliente' }}
                      </div>
                    </div>
                    
                    <!-- Menu Cliente -->
                    <div v-if="userType === 'cliente'">
                      <NuxtLink to="/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        📊 Dashboard
                      </NuxtLink>
                      
                      <NuxtLink to="/preferiti" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        ❤️ Preferiti
                      </NuxtLink>
                      
                      <NuxtLink to="/ricerche" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        🔍 Ricerche
                      </NuxtLink>
                      
                      <NuxtLink to="/messaggi" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        💬 Messaggi
                      </NuxtLink>
                      
                      <NuxtLink to="/appuntamenti" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        📅 Appuntamenti
                      </NuxtLink>
                    </div>
                    
                    <!-- Menu Concessionario -->
                    <div v-else-if="userType === 'concessionario'">
                      <NuxtLink to="/dealer/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        📊 Dashboard
                      </NuxtLink>
                      
                      <NuxtLink to="/dealer/moto" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        🏍️ Gestione Moto
                      </NuxtLink>
                      
                      <NuxtLink to="/dealer/lead" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        📞 Lead
                      </NuxtLink>
                      
                      <NuxtLink to="/dealer/messaggi" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        💬 Messaggi
                      </NuxtLink>
                      
                      <NuxtLink to="/dealer/appuntamenti" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        📅 Appuntamenti
                      </NuxtLink>
                      
                      <NuxtLink to="/dealer/analytics" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                        📈 Analytics
                      </NuxtLink>
                    </div>
                    
                    <!-- Menu comune -->
                    <div class="border-t border-gray-100"></div>
                    
                    <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                      👤 Profilo
                    </NuxtLink>
                    
                    <NuxtLink to="/impostazioni" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                      ⚙️ Impostazioni
                    </NuxtLink>
                    
                    <NuxtLink to="/cambia-password" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showUserMenu = false">
                      🔒 Cambia Password
            </NuxtLink>
                    
            <button
              @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
                      🚪 Logout
            </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="hidden md:flex items-center space-x-4">
            <!-- Dropdown Registrati -->
            <div class="relative" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
              <button class="bg-[#90c149] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7aa83f] transition-colors">
                Registrati
              </button>
              
              <!-- Dropdown Menu -->
              <div v-if="showDropdown" class="absolute top-full left-0 pt-1 w-48 z-50">
                <div class="bg-white rounded-lg shadow-lg border border-gray-200">
                <div class="py-1">
                  <NuxtLink to="/auth/register" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showDropdown = false">
                    👤 Utente
                  </NuxtLink>
                  <NuxtLink to="/auth/register-dealer" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" @click="showDropdown = false">
                    🏪 Concessionario
            </NuxtLink>
                </div>
                </div>
              </div>
            </div>
            
            <NuxtLink to="/auth/login" class="text-gray-600 hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
              Accedi
            </NuxtLink>
          </div>
          
          <!-- Mobile menu button -->
          <button 
            @click="toggleMobileMenu"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-black hover:text-[#90c149] focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <NuxtLink to="/moto" class="text-black hover:text-[#90c149] block px-3 py-2 text-base font-medium">
            Cerca Moto, Scooter e Servizi in tutta Italia
          </NuxtLink>
          
          <!-- Mobile Nuovo -->
          <div class="px-3 py-2">
            <div class="text-black font-medium text-base mb-2">Nuovo</div>
            <div class="ml-4 space-y-1">
              <NuxtLink to="/moto/nuovo" class="text-gray-600 hover:text-[#90c149] block px-3 py-2 text-sm font-medium transition-colors">
                Vedi Tutte
              </NuxtLink>
              <NuxtLink to="/moto/nuovo/piu-vendute" class="text-gray-600 hover:text-[#90c149] block px-3 py-2 text-sm font-medium transition-colors">
                40 Moto più vendute
              </NuxtLink>
              <NuxtLink to="/moto/nuovo/scooter-piu-venduti" class="text-gray-600 hover:text-[#90c149] block px-3 py-2 text-sm font-medium transition-colors">
                40 Scooter più venduti
              </NuxtLink>
            </div>
          </div>
          
          <!-- Mobile Usato -->
          <div class="px-3 py-2">
            <div class="text-gray-600 text-sm font-medium mb-2">Usato</div>
            <div class="ml-4 space-y-1">
              <NuxtLink to="/moto/usato/privati" class="text-gray-600 hover:text-[#90c149] block px-3 py-1 text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Da privati
              </NuxtLink>
              <NuxtLink to="/moto/usato/concessionari" class="text-gray-600 hover:text-[#90c149] block px-3 py-1 text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Da concessionari
              </NuxtLink>
            </div>
          </div>
          
          <!-- Mobile Servizi -->
          <div class="px-3 py-2">
            <div class="text-gray-600 text-sm font-medium mb-2">Servizi</div>
            <div class="ml-4 space-y-1">
              <NuxtLink to="/servizi/tagliando" class="text-gray-600 hover:text-[#90c149] block px-3 py-1 text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Tagliando
              </NuxtLink>
              <NuxtLink to="/servizi/revisione" class="text-gray-600 hover:text-[#90c149] block px-3 py-1 text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Revisione
              </NuxtLink>
              <NuxtLink to="/servizi/gomme" class="text-gray-600 hover:text-[#90c149] block px-3 py-1 text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                </svg>
                Sostituzione Gomme
              </NuxtLink>
              <NuxtLink to="/servizi/manutenzione" class="text-gray-600 hover:text-[#90c149] block px-3 py-1 text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
                Manutenzione
              </NuxtLink>
              <NuxtLink to="/servizi/assistenza" class="text-gray-600 hover:text-[#90c149] block px-3 py-1 text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"></path>
                </svg>
                Assistenza Stradale
              </NuxtLink>
            </div>
          </div>
          
          <NuxtLink to="/assicurazioni" class="text-black hover:text-[#90c149] block px-3 py-2 text-base font-medium">
            Assicurazioni
          </NuxtLink>
          <NuxtLink to="/finanziamenti" class="text-black hover:text-[#90c149] block px-3 py-2 text-base font-medium">
            Finanziamenti
          </NuxtLink>
          <div class="pt-4 space-y-2">
            <div v-if="user" class="space-y-2">
              <div class="text-center text-sm text-gray-600 py-2 border-b border-gray-200">
                {{ user.email }}
                <div class="text-xs text-[#90c149] font-medium">
                  {{ userType === 'concessionario' ? '🏪 Concessionario' : '👤 Cliente' }}
                </div>
              </div>
              
              <!-- Menu Cliente Mobile -->
              <div v-if="userType === 'cliente'">
              <NuxtLink to="/dashboard" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  📊 Dashboard
                </NuxtLink>
                
                <NuxtLink to="/preferiti" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  ❤️ Preferiti
                </NuxtLink>
                
                <NuxtLink to="/ricerche" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  🔍 Ricerche
                </NuxtLink>
                
                <NuxtLink to="/messaggi" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  💬 Messaggi
                </NuxtLink>
                
                <NuxtLink to="/appuntamenti" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  📅 Appuntamenti
                </NuxtLink>
              </div>
              
              <!-- Menu Concessionario Mobile -->
              <div v-else-if="userType === 'concessionario'">
                <NuxtLink to="/dealer/dashboard" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  📊 Dashboard
                </NuxtLink>
                
                <NuxtLink to="/dealer/moto" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  🏍️ Gestione Moto
                </NuxtLink>
                
                <NuxtLink to="/dealer/lead" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  📞 Lead
                </NuxtLink>
                
                <NuxtLink to="/dealer/messaggi" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  💬 Messaggi
                </NuxtLink>
                
                <NuxtLink to="/dealer/appuntamenti" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  📅 Appuntamenti
                </NuxtLink>
                
                <NuxtLink to="/dealer/analytics" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                  📈 Analytics
                </NuxtLink>
              </div>
              
              <!-- Menu comune -->
              <div class="border-t border-gray-200 my-2"></div>
              
              <NuxtLink to="/profile" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                👤 Profilo
              </NuxtLink>
              
              <NuxtLink to="/impostazioni" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                ⚙️ Impostazioni
              </NuxtLink>
              
              <NuxtLink to="/cambia-password" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                🔒 Cambia Password
              </NuxtLink>
              
              <button
                @click="handleLogout"
                class="block w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors text-center"
              >
                🚪 Logout
              </button>
            </div>
            
            <div v-else class="space-y-2">
              <div class="space-y-1">
                <div class="text-center text-sm text-gray-600 py-1">Registrati come:</div>
                <NuxtLink to="/auth/register" class="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center">
                  👤 Utente
                </NuxtLink>
                <NuxtLink to="/auth/register-dealer" class="block w-full bg-[#90c149] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7aa83f] transition-colors text-center">
                  🏪 Concessionario
              </NuxtLink>
              </div>
              <NuxtLink to="/auth/login" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                Accedi
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const mobileMenuOpen = ref(false)
const showDropdown = ref(false)
const showUserMenu = ref(false)
const showUsato = ref(false)
const showServizi = ref(false)
const showNuovo = ref(false)
const user = ref(null)

// Composable per rilevare il tipo di utente
const { userType, userData, loading: userTypeLoading } = useUserType()

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const handleLogout = async () => {
  const { signOut } = useSupabase()
  await signOut()
  user.value = null
  await navigateTo('/')
}

// Carica l'utente
const loadUser = async () => {
  const { getUser } = useSupabase()
  user.value = await getUser()
}

// Listener per cambiamenti di autenticazione
const { onAuthStateChange } = useSupabase()
onAuthStateChange((event, session) => {
  user.value = session?.user || null
  mobileMenuOpen.value = false
  showDropdown.value = false
  showUserMenu.value = false
  showUsato.value = false
  showServizi.value = false
})

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>

