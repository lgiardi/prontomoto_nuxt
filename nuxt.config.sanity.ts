// Configurazione Sanity per ottimizzazioni produzione
export default {
  sanity: {
    // Abilita cache per le immagini
    imageOptions: {
      quality: 80, // Riduce la qualità per velocità
      format: 'webp', // Formato più leggero
      fit: 'crop',
      auto: 'format'
    },
    
    // Ottimizzazioni query
    queryOptions: {
      useCdn: true,
      perspective: 'published',
      stega: false
    },
    
    // Cache headers
    cache: {
      maxAge: 3600, // 1 ora di cache
      staleWhileRevalidate: 86400 // 24 ore stale-while-revalidate
    }
  }
}


