<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center">
            <img 
              src="https://prontomoto.it/wp-content/uploads/2025/06/Risorsa-12.svg" 
              alt="ProntoMoto Logo" 
              class="h-8 w-auto"
            />
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="flex items-center space-x-6">
          <NuxtLink to="/dealer/dashboard" class="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Dashboard
          </NuxtLink>
          <NuxtLink to="/dealer/servizi" class="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Servizi
          </NuxtLink>
          <NuxtLink to="/dealer/conversazioni" class="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Conversazioni
          </NuxtLink>
          <NuxtLink to="/dealer/impostazioni-negozio" class="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Impostazioni
          </NuxtLink>
        </nav>

        <!-- User Info -->
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-600">
            Benvenuto, <span class="font-medium">{{ user?.user_metadata?.nome || user?.email?.split('@')[0] }}</span>
          </div>
          <button 
            @click="logout"
            class="text-gray-600 hover:text-gray-900 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const user = ref(null)

// Carica i dati dell'utente
const loadUser = async () => {
  try {
    const supabase = useSupabaseClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser
  } catch (error) {
    console.error('Errore nel caricamento utente:', error)
  }
}

const logout = async () => {
  try {
    const supabase = useSupabaseClient()
    await supabase.auth.signOut()
    await navigateTo('/login')
  } catch (error) {
    console.error('Errore durante il logout:', error)
  }
}

onMounted(() => {
  loadUser()
})
</script>
