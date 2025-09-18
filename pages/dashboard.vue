<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-gray-900">
              ← ProntoMoto
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">Dashboard</span>
            <button
              @click="handleLogout"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Dashboard Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">
              Dashboard Utente 🏍️
            </h1>
            
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <!-- Statistiche -->
              <div class="bg-indigo-50 p-6 rounded-lg">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">🔍</span>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-indigo-900">Ricerche</h3>
                    <p class="text-2xl font-bold text-indigo-600">0</p>
                  </div>
                </div>
              </div>

              <div class="bg-green-50 p-6 rounded-lg">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">❤️</span>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-green-900">Preferiti</h3>
                    <p class="text-2xl font-bold text-green-600">0</p>
                  </div>
                </div>
              </div>

              <div class="bg-purple-50 p-6 rounded-lg">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">📞</span>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-purple-900">Contatti</h3>
                    <p class="text-2xl font-bold text-purple-600">0</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sezioni principali -->
            <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Ricerche Recenti</h3>
                <p class="text-gray-500">Nessuna ricerca recente</p>
              </div>

              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Moto Preferite</h3>
                <p class="text-gray-500">Nessuna moto nei preferiti</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// Questo middleware protegge la pagina - solo utenti autenticati possono accedere
definePageMeta({
  middleware: 'auth',
  layout: false
})

const handleLogout = async () => {
  try {
    const { signOut } = useSupabase()
    await signOut()
    await navigateTo('/')
  } catch (error) {
    console.error('Errore durante il logout:', error)
  }
}
</script>

