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
          <a href="#" class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
            Moto
          </a>
          <a href="#" class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
            Concessionari
          </a>
          <a href="#" class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
            Servizi
          </a>
          <a href="#" class="text-black hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
            Contatti
          </a>
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
          <a href="#" class="text-black hover:text-[#90c149] block px-3 py-2 text-base font-medium">
            Moto
          </a>
          <a href="#" class="text-black hover:text-[#90c149] block px-3 py-2 text-base font-medium">
            Concessionari
          </a>
          <a href="#" class="text-black hover:text-[#90c149] block px-3 py-2 text-base font-medium">
            Servizi
          </a>
          <a href="#" class="text-black hover:text-[#90c149] block px-3 py-2 text-base font-medium">
            Contatti
          </a>
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
})

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>

