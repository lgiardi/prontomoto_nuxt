<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Inserisci il tuo stock di moto e scooter
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Registra la tua concessionaria su ProntoMoto
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="email@concessionaria.it"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="Password sicura (min. 6 caratteri, maiuscola, minuscola, numero)"
            />
            <div v-if="password" class="mt-1 text-xs">
              <div class="flex items-center space-x-2">
                <span :class="password.length >= 6 ? 'text-green-600' : 'text-red-600'">
                  {{ password.length >= 6 ? '✓' : '✗' }} Minimo 6 caratteri
                </span>
                <span :class="/(?=.*[a-z])/.test(password) ? 'text-green-600' : 'text-red-600'">
                  {{ /(?=.*[a-z])/.test(password) ? '✓' : '✗' }} Minuscola
                </span>
                <span :class="/(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-red-600'">
                  {{ /(?=.*[A-Z])/.test(password) ? '✓' : '✗' }} Maiuscola
                </span>
                <span :class="/(?=.*\d)/.test(password) ? 'text-green-600' : 'text-red-600'">
                  {{ /(?=.*\d)/.test(password) ? '✓' : '✗' }} Numero
                </span>
              </div>
            </div>
          </div>

          <div>
            <label for="nomeAzienda" class="block text-sm font-medium text-gray-700 mb-1">Nome Azienda</label>
            <input
              id="nomeAzienda"
              v-model="nomeAzienda"
              name="nomeAzienda"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="Nome azienda *"
            />
          </div>

          <div>
            <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input
              id="telefono"
              v-model="telefono"
              name="telefono"
              type="tel"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="Telefono *"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="citta" class="block text-sm font-medium text-gray-700 mb-1">Città</label>
              <input
                id="citta"
                v-model="citta"
                name="citta"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
                placeholder="Città *"
              />
            </div>
            <div>
              <label for="provincia" class="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <input
                id="provincia"
                v-model="provincia"
                name="provincia"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
                placeholder="Provincia *"
              />
            </div>
          </div>

          <div>
            <label for="partitaIva" class="block text-sm font-medium text-gray-700 mb-1">Partita IVA (opzionale)</label>
            <input
              id="partitaIva"
              v-model="partitaIva"
              name="partitaIva"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
              placeholder="Partita IVA (opzionale)"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
          <div v-if="error.includes('già registrato')" class="mt-2">
            <NuxtLink to="/auth/login" class="text-[#90c149] hover:text-[#7aa83f] font-medium">
              Vai al Login
            </NuxtLink>
          </div>
        </div>

        <div v-if="success" class="text-green-600 text-sm text-center">
          {{ success }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#90c149] hover:bg-[#7aa83f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#90c149] disabled:opacity-50"
          >
            <span v-if="loading">Registrazione...</span>
            <span v-else>Registrati</span>
          </button>
        </div>

        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600">
            Hai già un account?
            <NuxtLink to="/auth/login" class="text-[#90c149] hover:text-[#7aa83f] font-medium">
              Accedi
            </NuxtLink>
          </p>
          <p class="text-xs text-gray-500">
            Sei un cliente? 
            <NuxtLink to="/auth/register" class="text-[#90c149] hover:text-[#7aa83f]">
              Registrati qui
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const email = ref('')
const password = ref('')
const nomeAzienda = ref('')
const telefono = ref('')
const citta = ref('')
const provincia = ref('')
const partitaIva = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  // Validazione password
  if (password.value.length < 6) {
    error.value = 'La password deve essere di almeno 6 caratteri'
    loading.value = false
    return
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)) {
    error.value = 'La password deve contenere almeno una lettera minuscola, una maiuscola e un numero'
    loading.value = false
    return
  }

  // Validazione campi obbligatori
  if (!nomeAzienda.value.trim()) {
    error.value = 'Il nome azienda è obbligatorio'
    loading.value = false
    return
  }

  if (!citta.value.trim()) {
    error.value = 'La città è obbligatoria'
    loading.value = false
    return
  }

  if (!provincia.value.trim()) {
    error.value = 'La provincia è obbligatoria'
    loading.value = false
    return
  }

  try {
    const { signUp, supabase } = useSupabase()
    const { data, error: supabaseError } = await signUp(email.value, password.value)
    
    if (supabaseError) {
      // Gestisci il caso "utente già registrato"
      if (supabaseError.message.includes('already registered') || 
          supabaseError.message.includes('User already registered') ||
          supabaseError.message.includes('already been registered')) {
        error.value = 'Questo indirizzo email è già registrato. Prova ad accedere o usa un\'email diversa.'
        loading.value = false
        return
      }
      throw supabaseError
    }
    
    // Se la registrazione è andata a buon fine, salva come concessionario
    if (data.user) {
      console.log('Tentativo di inserimento in concessionari con dati:', {
        id: data.user.id,
        nome: nomeAzienda.value,
        email: email.value,
        telefono: telefono.value,
        citta: citta.value,
        provincia: provincia.value
      })

      // Inserisci il record nella tabella concessionari
      // Nota: Assicurati che la RLS policy INSERT sia stata creata in Supabase
      const { data: dealerData, error: dealerError } = await supabase
        .from('concessionari')
        .insert({
          id: data.user.id,
          nome: nomeAzienda.value || 'Concessionario',
          email: email.value,
          telefono: telefono.value || '',
          citta: citta.value || 'Non specificata',
          provincia: provincia.value || 'Non specificata',
          status: 'pending'
        })
        .select()
      
      if (dealerError) {
        console.error('Errore nel salvare i dati concessionario:', dealerError)
        console.error('Dettagli errore:', dealerError.message)
        console.error('Codice errore:', dealerError.code)
        throw new Error(`Errore nel salvare i dati della concessionaria: ${dealerError.message}`)
      }

      console.log('Record concessionario creato con successo:', dealerData)

      // Inserisci anche il record nella tabella utenti come concessionario
      const { error: userError } = await supabase
        .from('utenti')
        .insert({
          id: data.user.id,
          nome: nomeAzienda.value,
          email: email.value,
          telefono: telefono.value,
          user_type: 'concessionario',
          created_at: new Date().toISOString()
        })
      
      if (userError) {
        console.error('Errore nel salvare il tipo utente:', userError)
        // Non blocchiamo la registrazione se c'è un errore nel salvare il tipo
      }
    }
    
    if (data.user && !data.user.email_confirmed_at) {
      success.value = 'Registrazione completata! Controlla la tua email per confermare l\'account e accedere alla dashboard.'
    } else {
      success.value = 'Registrazione completata!'
      // Redirect automatico alla dashboard dopo 2 secondi
      setTimeout(() => {
        navigateTo('/dealer/dashboard')
      }, 2000)
    }
    
  } catch (err) {
    error.value = err.message || 'Errore durante la registrazione'
  } finally {
    loading.value = false
  }
}

// Meta
definePageMeta({
  layout: false
})
</script>
