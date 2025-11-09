<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Modifica Servizio' : 'Aggiungi Nuovo Servizio' }}
        </h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" class="p-6 space-y-6">
        <!-- Selezione Servizio Catalogo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Servizio *
          </label>
          <select 
            v-model="form.servizio_catalogo_id"
            :disabled="isEditing"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
          >
            <option value="">Seleziona un servizio</option>
            <option 
              v-for="servizio in catalogo" 
              :key="servizio.id" 
              :value="servizio.id"
            >
              {{ servizio.nome }} ({{ servizio.categoria }})
            </option>
          </select>
          <p v-if="selectedServizioCatalogo" class="text-sm text-gray-600 mt-1">
            {{ selectedServizioCatalogo.descrizione_breve }}
          </p>
        </div>

        <!-- Prezzo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prezzo da (€) *
            </label>
            <input
              v-model.number="form.prezzo_da"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
              placeholder="120.00"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prezzo a (€)
            </label>
            <input
              v-model.number="form.prezzo_a"
              type="number"
              step="0.01"
              min="0"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
              placeholder="150.00"
            />
          </div>
        </div>

        <!-- Durata -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Durata (minuti)
          </label>
          <input
            v-model.number="form.durata_minuti"
            type="number"
            min="1"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="60"
          />
        </div>

        <!-- Descrizione -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descrizione Dettagliata *
          </label>
          <textarea
            v-model="form.descrizione"
            rows="4"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#90c149] focus:border-transparent"
            placeholder="Descrivi in dettaglio il servizio che offri, cosa include, i materiali utilizzati, la garanzia, etc."
          ></textarea>
        </div>

        <!-- Immagini -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Immagini del Servizio
          </label>
          <div class="space-y-3">
            <!-- Preview Immagini Caricate -->
            <div v-if="form.foto.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div v-for="(url, index) in form.foto" :key="index" class="relative group">
                <img 
                  :src="url" 
                  :alt="selectedServizioCatalogo?.nome || 'Servizio'"
                  class="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Rimuovi immagine"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Input File -->
            <div>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                class="hidden"
              />
              <button
                type="button"
                @click="fileInput?.click()"
                :disabled="uploading"
                class="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                {{ uploading ? 'Caricamento in corso...' : 'Carica Immagini dal PC' }}
              </button>
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            Formati supportati: JPG, PNG, WebP. Dimensione massima: 5MB per immagine
          </p>
        </div>


        <!-- Disponibilità -->
        <div class="flex items-center">
          <input
            v-model="form.disponibile"
            type="checkbox"
            id="disponibile"
            class="h-4 w-4 text-[#90c149] focus:ring-[#90c149] border-gray-300 rounded"
          />
          <label for="disponibile" class="ml-2 block text-sm text-gray-700">
            Servizio disponibile per i clienti
          </label>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-[#90c149] text-white rounded-lg hover:bg-[#7ba83a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading || uploading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ uploading ? 'Caricamento immagini...' : 'Salvataggio...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Aggiorna' : 'Aggiungi' }} Servizio
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const supabase = useSupabaseClient()

const props = defineProps({
  servizio: {
    type: Object,
    default: null
  },
  catalogo: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

// Reactive data
const loading = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const form = ref({
  servizio_catalogo_id: '',
  prezzo_da: null,
  prezzo_a: null,
  durata_minuti: null,
  descrizione: '',
  foto: [],
  disponibile: true
})

// Computed
const isEditing = computed(() => !!props.servizio)

const selectedServizioCatalogo = computed(() => {
  return props.catalogo.find(s => s.id === form.value.servizio_catalogo_id)
})

// Methods
const resetForm = () => {
  form.value = {
    servizio_catalogo_id: '',
    prezzo_da: null,
    prezzo_a: null,
    durata_minuti: null,
    descrizione: '',
    foto: [],
    disponibile: true
  }
}

// Watch for prop changes
watch(() => props.servizio, (newServizio) => {
  if (newServizio) {
    form.value = {
      servizio_catalogo_id: newServizio.servizio_catalogo_id,
      prezzo_da: newServizio.prezzo_da,
      prezzo_a: newServizio.prezzo_a,
      durata_minuti: newServizio.durata_minuti,
      descrizione: newServizio.descrizione,
      foto: newServizio.foto || [],
      disponibile: newServizio.disponibile
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const removeImage = (index) => {
  form.value.foto.splice(index, 1)
}

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return

  uploading.value = true

  try {
    // Ottieni token di autenticazione
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Sessione non valida. Effettua il login.')
    }

    // Carica ogni file
    const uploadPromises = files.map(async (file) => {
      // Valida tipo file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo file non supportato: ${file.type}. Usa JPG, PNG o WebP`)
      }

      // Valida dimensione (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error(`File troppo grande: ${file.name}. Dimensione massima: 5MB`)
      }

      // Crea FormData per l'upload
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      // Esegui upload
      const response = await $fetch('/api/upload/servizi', {
        method: 'POST',
        body: uploadFormData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.success) {
        return response.url
      } else {
        throw new Error('Errore durante l\'upload')
      }
    })

    // Attendi tutti gli upload
    const uploadedUrls = await Promise.all(uploadPromises)
    
    // Aggiungi gli URL alle foto
    form.value.foto.push(...uploadedUrls)
    
    console.log('✅ Immagini caricate:', uploadedUrls.length)

  } catch (error) {
    console.error('❌ Errore upload immagini:', error)
    alert(error.message || 'Errore nel caricamento delle immagini. Riprova.')
  } finally {
    uploading.value = false
    // Reset input file
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const submitForm = async () => {
  try {
    loading.value = true

    // Validazione
    if (!form.value.servizio_catalogo_id) {
      throw new Error('Seleziona un servizio dal catalogo')
    }

    if (!form.value.prezzo_da || form.value.prezzo_da <= 0) {
      throw new Error('Inserisci un prezzo valido')
    }

    if (!form.value.descrizione.trim()) {
      throw new Error('Inserisci una descrizione')
    }

    // Ottieni token di autenticazione
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Sessione non valida. Effettua il login.')
    }

    // Prepara i dati
    const formData = {
      servizio_catalogo_id: form.value.servizio_catalogo_id,
      prezzo_da: parseFloat(form.value.prezzo_da),
      prezzo_a: form.value.prezzo_a ? parseFloat(form.value.prezzo_a) : null,
      durata_minuti: form.value.durata_minuti ? parseInt(form.value.durata_minuti) : null,
      descrizione: form.value.descrizione.trim(),
      foto: form.value.foto.filter(url => url.trim() !== ''),
      disponibile: form.value.disponibile
    }

    let response
    if (isEditing.value) {
      // Aggiorna servizio esistente
      response = await $fetch(`/api/servizi/${props.servizio.id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
    } else {
      // Crea nuovo servizio
      response = await $fetch('/api/servizi', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
    }

    if (response.success) {
      emit('saved', response.data)
    } else {
      throw new Error(response.error || 'Errore nel salvataggio')
    }

  } catch (error) {
    console.error('Errore salvataggio servizio:', error)
    alert(error.message || 'Errore nel salvataggio del servizio')
  } finally {
    loading.value = false
  }
}
</script>
