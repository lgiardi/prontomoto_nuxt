<template>
  <header class="bg-white shadow-md border-b border-gray-200">
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
            <span class="text-gray-700 text-sm">Ciao, {{ user.email }}!</span>
            <NuxtLink to="/dashboard" class="text-gray-600 hover:text-[#90c149] px-3 py-2 text-sm font-medium transition-colors">
              Dashboard
            </NuxtLink>
            <button
              @click="handleLogout"
              class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div v-else class="hidden md:flex items-center space-x-4">
            <NuxtLink to="/auth/register" class="bg-[#90c149] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7aa83f] transition-colors">
              Registrati come Concessionario
            </NuxtLink>
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
              <div class="text-center text-sm text-gray-600 py-2">
                Ciao, {{ user.email }}!
              </div>
              <NuxtLink to="/dashboard" class="block w-full text-gray-600 hover:text-[#90c149] px-4 py-2 text-sm font-medium transition-colors text-center">
                Dashboard
              </NuxtLink>
              <button
                @click="handleLogout"
                class="block w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors text-center"
              >
                Logout
              </button>
            </div>
            
            <div v-else class="space-y-2">
              <NuxtLink to="/auth/register" class="block w-full bg-[#90c149] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7aa83f] transition-colors text-center">
                Registrati come Concessionario
              </NuxtLink>
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
import { ref, onMounted } from 'vue'

const mobileMenuOpen = ref(false)
const user = ref(null)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const handleLogout = async () => {
  const { signOut } = useSupabase()
  await signOut()
  user.value = null
  await navigateTo('/')
}

onMounted(async () => {
  const { getUser } = useSupabase()
  user.value = await getUser()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>

