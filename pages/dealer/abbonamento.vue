<template>
  <div class="min-h-screen w-full bg-gray-50 font-sans">
    <!-- Header -->
    <DealerHeader />

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Piani di Abbonamento</h1>
        <p class="mt-2 text-gray-600">Scegli il piano più adatto alle tue esigenze</p>
      </div>

      <!-- Current Plan Badge -->
      <div v-if="currentPlan" class="mb-8">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Piano Attuale: {{ currentPlan }}
              </h3>
              <p class="text-sm text-green-700">
                Il tuo abbonamento è attivo
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pricing Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Basic Plan -->
        <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-8">
            <div class="text-center">
              <h3 class="text-2xl font-bold text-gray-900">Basic</h3>
              <p class="mt-2 text-gray-600">Perfetto per iniziare</p>
              <div class="mt-4">
                <span class="text-4xl font-bold text-gray-900">€29</span>
                <span class="text-gray-600">/mese</span>
              </div>
            </div>
            
            <ul class="mt-8 space-y-4">
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Fino a 10 moto in vendita</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Gestione lead base</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Supporto email</span>
              </li>
            </ul>
          </div>
          
          <div class="px-6 py-4 bg-gray-50">
            <button 
              disabled
              class="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
              title="Coming soon - Stripe integration"
            >
              Coming Soon
            </button>
          </div>
        </div>

        <!-- Professional Plan -->
        <div class="bg-white rounded-lg shadow-lg border-2 border-[#90c149] overflow-hidden relative">
          <div class="absolute top-0 left-0 right-0 bg-[#90c149] text-white text-center py-2 text-sm font-medium">
            Più Popolare
          </div>
          
          <div class="px-6 py-8 pt-12">
            <div class="text-center">
              <h3 class="text-2xl font-bold text-gray-900">Professional</h3>
              <p class="mt-2 text-gray-600">Per concessionari attivi</p>
              <div class="mt-4">
                <span class="text-4xl font-bold text-gray-900">€79</span>
                <span class="text-gray-600">/mese</span>
              </div>
            </div>
            
            <ul class="mt-8 space-y-4">
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Fino a 50 moto in vendita</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Gestione lead avanzata</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Sistema appuntamenti</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Supporto prioritario</span>
              </li>
            </ul>
          </div>
          
          <div class="px-6 py-4 bg-gray-50">
            <button 
              disabled
              class="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
              title="Coming soon - Stripe integration"
            >
              Coming Soon
            </button>
          </div>
        </div>

        <!-- Enterprise Plan -->
        <div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-8">
            <div class="text-center">
              <h3 class="text-2xl font-bold text-gray-900">Enterprise</h3>
              <p class="mt-2 text-gray-600">Per grandi concessionari</p>
              <div class="mt-4">
                <span class="text-4xl font-bold text-gray-900">€199</span>
                <span class="text-gray-600">/mese</span>
              </div>
            </div>
            
            <ul class="mt-8 space-y-4">
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Moto illimitate</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Analytics avanzate</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">API personalizzate</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="ml-3 text-gray-700">Supporto dedicato</span>
              </li>
            </ul>
          </div>
          
          <div class="px-6 py-4 bg-gray-50">
            <button 
              disabled
              class="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
              title="Coming soon - Stripe integration"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="mt-12 text-center">
        <p class="text-gray-600">
          Tutti i piani includono accesso completo alla piattaforma ProntoMoto
        </p>
        <p class="mt-2 text-sm text-gray-500">
          L'integrazione con Stripe sarà disponibile a breve
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Protezione della pagina
definePageMeta({
  middleware: 'dealer',
  layout: false
})

const currentPlan = ref(null)
const loading = ref(false)

// Inizializza Supabase
const supabase = useSupabaseClient()

// Carica i dati del concessionario
const loadDealerData = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Errore nel caricamento utente:', userError)
      return
    }

    // Cerca il concessionario
    const { data: dealerData, error: dealerError } = await supabase
      .from('concessionari')
      .select('subscription_plan')
      .eq('user_id', user.id)
      .single()

    if (dealerError) {
      console.log('Concessionario non trovato, creazione automatica...')
      
      // Crea automaticamente il concessionario se non esiste
      const { data: newDealer, error: createError } = await supabase
        .from('concessionari')
        .insert({
          user_id: user.id,
          nome: user.user_metadata?.nome || user.email?.split('@')[0] || 'Nuovo Concessionario',
          email: user.email,
          status: 'active',
          subscription_plan: 'basic'
        })
        .select()
        .single()

      if (createError) {
        console.error('Errore nella creazione concessionario:', createError)
        return
      }

      currentPlan.value = newDealer.subscription_plan || 'basic'
    } else {
      currentPlan.value = dealerData.subscription_plan || 'basic'
    }
    
  } catch (error) {
    console.error('Errore nel caricamento dati concessionario:', error)
  }
}

// Carica i dati al mount
onMounted(() => {
  loadDealerData()
})
</script>

<style scoped>
/* Stili personalizzati se necessari */
</style>
