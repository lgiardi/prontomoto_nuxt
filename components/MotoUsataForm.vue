<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ moto ? 'Modifica Moto Usata' : 'Aggiungi Moto Usata' }}
      </h2>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Modalità Selezione -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Come vuoi inserire la moto? *
        </label>
        <div class="flex space-x-4 mb-4">
          <label class="flex items-center">
            <input 
              v-model="formData.selectionMode" 
              type="radio" 
              value="catalogo" 
              class="mr-2"
            />
            Dal Catalogo
          </label>
          <label class="flex items-center">
            <input 
              v-model="formData.selectionMode" 
              type="radio" 
              value="manuale" 
              class="mr-2"
            />
            Inserimento Manuale
          </label>
        </div>
      </div>

      <!-- Selezione dal Catalogo -->
      <div v-if="formData.selectionMode === 'catalogo'">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Marca -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Marca *
            </label>
        <select 
              v-model="formData.selectedMarca"
              @change="onMarcaChange"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
        >
              <option value="">Seleziona marca</option>
              <option v-for="marca in availableMarche" :key="marca" :value="marca">
                {{ marca }}
              </option>
            </select>
          </div>

          <!-- Modello -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Modello *
            </label>
            <select 
              v-model="formData.selectedModello"
              @change="onModelloChange"
              :disabled="!formData.selectedMarca"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149] disabled:bg-gray-100"
            >
              <option value="">Seleziona modello</option>
              <option v-for="modello in availableModelli" :key="modello" :value="modello">
                {{ modello }}
            </option>
        </select>
      </div>

          <!-- Versione -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Versione
            </label>
            <select 
              v-model="formData.selectedVersione"
              :disabled="!formData.selectedModello"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149] disabled:bg-gray-100"
            >
              <option value="">Seleziona versione</option>
              <option v-for="versione in availableVersioni" :key="versione" :value="versione">
                {{ versione }}
              </option>
            </select>
          </div>

          <!-- Tipologia -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipologia
            </label>
            <select 
              v-model="formData.selectedTipologia"
              :disabled="!formData.selectedModello"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149] disabled:bg-gray-100"
            >
              <option value="">Seleziona tipologia</option>
              <option v-for="tipologia in availableTipologie" :key="tipologia" :value="tipologia">
                {{ tipologia }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Inserimento Manuale -->
      <div v-if="formData.selectionMode === 'manuale'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          <input 
            v-model="formData.manualMarca"
            type="text"
            required
            placeholder="Es: Honda, Yamaha, Ducati..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Modello *
          </label>
          <input 
            v-model="formData.manualModello"
            type="text"
            required
            placeholder="Es: CBR 1000RR, MT-09..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Versione
          </label>
          <input 
            v-model="formData.manualVersione"
            type="text"
            placeholder="Es: 1000cc, ABS, SP..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tipologia *
          </label>
          <select 
            v-model="formData.manualTipologia"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
          >
            <option value="">Seleziona tipologia</option>
            <option value="Scooter">Scooter</option>
            <option value="Naked">Naked</option>
            <option value="Sport">Sport</option>
            <option value="Touring">Touring</option>
            <option value="Enduro">Enduro</option>
            <option value="Cruiser">Cruiser</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
      </div>

      <!-- Moto Selezionata/Inserita -->
      <div v-if="getSelectedMotoInfo()" class="bg-gray-50 p-4 rounded-lg">
        <h3 class="font-medium text-gray-900 mb-2">Moto {{ formData.selectionMode === 'catalogo' ? 'Selezionata' : 'Inserita' }}:</h3>
        <div class="text-sm text-gray-600">
          <p><strong>Marca:</strong> {{ getSelectedMotoInfo().marca }}</p>
          <p><strong>Modello:</strong> {{ getSelectedMotoInfo().modello }}</p>
          <p v-if="getSelectedMotoInfo().versione"><strong>Versione:</strong> {{ getSelectedMotoInfo().versione }}</p>
          <p><strong>Tipologia:</strong> {{ getSelectedMotoInfo().tipologia }}</p>
        </div>
      </div>
        
        <!-- Chilometraggio -->
        <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Chilometraggio *
        </label>
          <input 
            v-model="formData.km"
            type="number"
          required
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
            placeholder="Es: 15000"
          />
        </div>

        <!-- Anno -->
        <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Anno *
        </label>
          <input 
            v-model="formData.anno"
            type="number"
          required
          min="1900"
            :max="new Date().getFullYear() + 1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
            placeholder="Es: 2020"
          />
        </div>

        <!-- Prezzo -->
        <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Prezzo (€) *
        </label>
            <input 
              v-model="formData.prezzo"
              type="number"
          required
              min="0"
              step="0.01"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
          placeholder="Es: 8500.00"
            />
        </div>

        <!-- Condizione -->
        <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Condizione *
        </label>
          <select 
            v-model="formData.condizione"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
          >
          <option value="">Seleziona condizione</option>
            <option value="ottima">Ottima</option>
            <option value="buona">Buona</option>
            <option value="discreta">Discreta</option>
            <option value="da-ristrutturare">Da ristrutturare</option>
          </select>
      </div>

      <!-- Descrizione -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Descrizione
        </label>
        <textarea 
          v-model="formData.descrizione"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
          placeholder="Descrivi la moto, eventuali modifiche, storia, etc..."
        ></textarea>
      </div>

      <!-- Immagine Copertina -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Immagine Copertina *
        </label>
        <div class="space-y-2">
          <input
            ref="coverFileInput"
            type="file"
            accept="image/*"
            @change="handleCoverFileUpload"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
          />
          <div v-if="coverPreview" class="mt-2">
            <img :src="coverPreview" alt="Anteprima copertina" class="w-32 h-24 object-cover rounded-md border" />
            <p class="text-sm text-green-600 mt-1">✓ Immagine caricata</p>
          </div>
        </div>
        <p class="text-sm text-gray-500 mt-1">Questa sarà l'immagine principale mostrata nella lista</p>
      </div>

      <!-- Gallery Foto -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Gallery Foto
        </label>
        <div class="space-y-2">
          <div 
            v-for="(foto, index) in galleryFiles" 
            :key="index"
            class="flex space-x-2"
          >
            <input 
              :ref="`galleryFileInput${index}`"
              type="file"
              accept="image/*"
              @change="(e) => handleGalleryFileUpload(e, index)"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#90c149] focus:border-[#90c149]"
            />
            <button
              type="button"
              @click="removeGalleryFoto(index)"
              class="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div v-if="galleryPreviews.length > 0" class="grid grid-cols-4 gap-2 mt-2">
            <div v-for="(preview, index) in galleryPreviews" :key="index" class="relative">
              <img :src="preview" :alt="`Gallery ${index + 1}`" class="w-full h-20 object-cover rounded-md border" />
              <p class="text-xs text-green-600 mt-1">✓ Caricata</p>
            </div>
          </div>
          <button
            type="button"
            @click="addGalleryFoto"
            class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            + Aggiungi Foto Gallery
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-1">Foto aggiuntive per la galleria dettagliata</p>
      </div>

      <!-- Pulsanti -->
      <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#90c149]"
        >
          Annulla
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="px-4 py-2 text-sm font-medium text-white bg-[#90c149] border border-transparent rounded-md hover:bg-[#7ba83a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#90c149] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Salvataggio...' : (moto ? 'Aggiorna' : 'Salva') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useSupabaseClient } from '~/composables/useSupabaseClient'

const props = defineProps({
  moto: {
    type: Object,
    default: null
  },
  catalogo: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'saved'])

const supabase = useSupabaseClient()
const submitting = ref(false)

const formData = ref({
  selectionMode: 'catalogo', // 'catalogo' o 'manuale'
  // Per selezione dal catalogo
  selectedMarca: '',
  selectedModello: '',
  selectedVersione: '',
  selectedTipologia: '',
  // Per inserimento manuale
  manualMarca: '',
  manualModello: '',
  manualVersione: '',
  manualTipologia: '',
  // Dati moto
  km: '',
  anno: '',
  prezzo: '',
  condizione: '',
  descrizione: '',
  foto: []
})

// Gestione file upload
const coverFileInput = ref(null)
const coverPreview = ref('')
const coverFile = ref(null)

const galleryFiles = ref([null])
const galleryPreviews = ref([])
const galleryUploadedFiles = ref([])

// Computed properties per la logica a cascata
const availableMarche = computed(() => {
  const marche = [...new Set(props.catalogo.map(m => m.marca))]
  return marche.sort()
})

const availableModelli = computed(() => {
  if (!formData.value.selectedMarca) return []
  const modelli = props.catalogo
    .filter(m => m.marca === formData.value.selectedMarca)
    .map(m => m.modello)
  return [...new Set(modelli)].sort()
})

const availableVersioni = computed(() => {
  if (!formData.value.selectedMarca || !formData.value.selectedModello) return []
  const versioni = props.catalogo
    .filter(m => m.marca === formData.value.selectedMarca && m.modello === formData.value.selectedModello)
    .map(m => m.versione)
    .filter(v => v && v !== 'Standard')
  return [...new Set(versioni)].sort()
})

const availableTipologie = computed(() => {
  if (!formData.value.selectedMarca || !formData.value.selectedModello) return []
  const tipologie = props.catalogo
    .filter(m => m.marca === formData.value.selectedMarca && m.modello === formData.value.selectedModello)
    .map(m => m.tipologia)
    .filter(t => t && t !== 'Naked')
  return [...new Set(tipologie)].sort()
})

// Moto selezionata dal catalogo
const selectedMoto = computed(() => {
  if (formData.value.selectionMode === 'catalogo') {
    return props.catalogo.find(m => 
      m.marca === formData.value.selectedMarca && 
      m.modello === formData.value.selectedModello &&
      (m.versione === formData.value.selectedVersione || (!formData.value.selectedVersione && m.versione === 'Standard'))
    )
  }
  return null
})

// Metodi per gestire i cambi di selezione
const onMarcaChange = () => {
  formData.value.selectedModello = ''
  formData.value.selectedVersione = ''
  formData.value.selectedTipologia = ''
}

const onModelloChange = () => {
  formData.value.selectedVersione = ''
  formData.value.selectedTipologia = ''
}

// Funzione per ottenere le informazioni della moto selezionata/inserita
const getSelectedMotoInfo = () => {
  if (formData.value.selectionMode === 'catalogo' && selectedMoto.value) {
    return {
      marca: selectedMoto.value.marca,
      modello: selectedMoto.value.modello,
      versione: selectedMoto.value.versione,
      tipologia: formData.value.selectedTipologia || selectedMoto.value.tipologia
    }
  } else if (formData.value.selectionMode === 'manuale') {
    return {
      marca: formData.value.manualMarca,
      modello: formData.value.manualModello,
      versione: formData.value.manualVersione,
      tipologia: formData.value.manualTipologia
    }
  }
  return null
}

// Gestione upload copertina
const handleCoverFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  coverFile.value = file
  coverPreview.value = URL.createObjectURL(file)
  
  // Upload file
  try {
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('type', 'cover')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Sessione non valida')

    const response = await $fetch('/api/upload/moto-usate', {
      method: 'POST',
      body: uploadFormData,
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    // Aggiungi come prima foto
    if (formData.value) {
      formData.value.foto = [response.url]
    }
  } catch (error) {
    console.error('Errore upload copertina:', error)
    alert('Errore nel caricamento dell\'immagine copertina')
  }
}

// Gestione upload gallery
const handleGalleryFileUpload = async (event, index) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('type', 'gallery')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Sessione non valida')

    const response = await $fetch('/api/upload/moto-usate', {
      method: 'POST',
      body: uploadFormData,
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    // Aggiorna array gallery
    galleryUploadedFiles.value[index] = response.url
    galleryPreviews.value[index] = URL.createObjectURL(file)
    
    // Aggiorna formData - combina copertina e gallery
    if (formData.value) {
      const allPhotos = []
      if (formData.value.foto.length > 0) {
        allPhotos.push(...formData.value.foto)
      }
      allPhotos.push(...galleryUploadedFiles.value.filter(url => url))
      formData.value.foto = allPhotos
    }
  } catch (error) {
    console.error('Errore upload gallery:', error)
    alert('Errore nel caricamento dell\'immagine gallery')
  }
}

// Gestione gallery foto
const addGalleryFoto = () => {
  galleryFiles.value.push(null)
}

const removeGalleryFoto = (index) => {
  if (galleryFiles.value.length > 1) {
    galleryFiles.value.splice(index, 1)
    galleryPreviews.value.splice(index, 1)
    galleryUploadedFiles.value.splice(index, 1)
    
    // Ricostruisci array foto
    if (formData.value) {
      const allPhotos = []
      if (formData.value.foto.length > 0) {
        allPhotos.push(...formData.value.foto)
      }
      allPhotos.push(...galleryUploadedFiles.value.filter(url => url))
      formData.value.foto = allPhotos
    }
  }
}

// Inizializza form se in modalità modifica
onMounted(() => {
  console.log('MotoUsataForm mounted - catalogo:', props.catalogo?.length || 0, 'moto:', props.moto?.id)
  
  if (props.moto) {
    // Carica foto dal campo foto o dai campi separati
    let fotoArray = []
    if (props.moto.foto && props.moto.foto !== '[]') {
      try {
        fotoArray = JSON.parse(props.moto.foto)
      } catch (e) {
        fotoArray = []
      }
    }
    
    // Se ci sono campi separati, usali
    if (props.moto.immagine_copertina) {
      fotoArray = [props.moto.immagine_copertina]
      if (props.moto.foto_gallery && props.moto.foto_gallery !== '[]') {
        try {
          const gallery = JSON.parse(props.moto.foto_gallery)
          fotoArray = fotoArray.concat(gallery)
        } catch (e) {
          // Ignora errori di parsing
        }
      }
    }
    
    formData.value = {
      catalogo_id: props.moto.catalogo_id || '',
      km: props.moto.km || '',
      anno: props.moto.anno || '',
      prezzo: props.moto.prezzo || '',
      condizione: props.moto.condizione || '',
      descrizione: props.moto.descrizione || '',
      foto: fotoArray
    }
    
    // Se ci sono foto, mostra la prima come copertina
    if (formData.value.foto.length > 0) {
      coverPreview.value = formData.value.foto[0]
      
      // Popola la gallery con le foto rimanenti
      if (formData.value.foto.length > 1) {
        const galleryPhotos = formData.value.foto.slice(1)
        galleryPreviews.value = galleryPhotos
        galleryUploadedFiles.value = galleryPhotos
        
        // Aggiusta l'array galleryFiles per avere il numero giusto di input
        galleryFiles.value = new Array(galleryPhotos.length).fill(null)
      }
    }
  }
})

// Submit form
const submitForm = async () => {
  try {
    submitting.value = true

    // Prepara i dati in base alla modalità di selezione
    let motoData = {}
    
    if (formData.value.selectionMode === 'catalogo') {
      // Usa i dati dal catalogo
      if (!selectedMoto.value) {
        throw new Error('Seleziona una moto dal catalogo')
      }
      motoData = {
        catalogo_id: selectedMoto.value.id,
        marca: selectedMoto.value.marca,
        modello: selectedMoto.value.modello,
        versione: selectedMoto.value.versione || 'Standard',
        tipologia: formData.value.selectedTipologia || selectedMoto.value.tipologia || 'Naked'
      }
    } else {
      // Usa i dati inseriti manualmente
      if (!formData.value.manualMarca || !formData.value.manualModello || !formData.value.manualTipologia) {
        throw new Error('Compila tutti i campi obbligatori per l\'inserimento manuale')
      }
      motoData = {
        catalogo_id: null, // Non ha un ID del catalogo
        marca: formData.value.manualMarca,
        modello: formData.value.manualModello,
        versione: formData.value.manualVersione || 'Standard',
        tipologia: formData.value.manualTipologia
      }
    }

    const data = {
      ...motoData,
      km: parseInt(formData.value.km),
      anno: parseInt(formData.value.anno),
      prezzo: parseFloat(formData.value.prezzo),
      condizione: formData.value.condizione,
      descrizione: formData.value.descrizione,
      foto: formData.value.foto.filter(url => url.trim()),
      venditore_type: 'concessionario'
    }

    // Ottieni token di autenticazione
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Sessione non valida')
    }

    if (props.moto) {
      await $fetch(`/api/moto-usate/${props.moto.id}`, {
        method: 'PUT',
        body: data,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
    } else {
      await $fetch('/api/moto-usate', {
        method: 'POST',
        body: data,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
    }

    emit('saved')
  } catch (error) {
    console.error('Errore nel salvataggio:', error)
    alert('Errore nel salvataggio della moto usata')
  } finally {
    submitting.value = false
  }
}
</script>
