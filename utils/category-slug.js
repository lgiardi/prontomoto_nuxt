// Funzione per convertire categoria in slug URL
export function categoryToSlug(categoria) {
  if (!categoria) return 'moto'
  
  const categoryMap = {
    'Naked': 'naked',
    'Scooter Ruote alte': 'scooter',
    'Scooter Ruote basse': 'scooter',
    'Turismo': 'turismo',
    'Sportive': 'sportive',
    'Enduro Stradale': 'enduro',
    'Adventure': 'adventure',
    'Cruiser': 'cruiser',
    'Touring': 'touring'
  }
  
  return categoryMap[categoria] || 'moto'
}

// Funzione per creare slug da marca e modello
export function createSlug(marca, modello) {
  if (!marca || !modello) return ''
  
  const marcaSlug = marca.toLowerCase().replace(/\s+/g, '-')
  const modelloSlug = modello.toLowerCase().replace(/\s+/g, '-')
  
  return `${marcaSlug}-${modelloSlug}`
}

// Funzione per creare URL completo
export function createMotoUrl(moto) {
  const categoria = categoryToSlug(moto.categoria)
  const slug = createSlug(moto.marca, moto.modello)
  
  return `/${categoria}/${slug}`
}
