import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '1i1fbngf',
  dataset: 'production',
  apiVersion: '2025-09-07',
  useCdn: true
})

export default defineEventHandler(async () => {
  // Prima leggo tutte le moto
  const motosQuery = `*[_type == "moto"]{
    _id,
    marca,
    modello,
    allestimento,
    categoria,
    cilindrata,
    prezzo,
    "immagineUrl": immagineCopertina.asset->url
  }`
  
  // Poi leggo tutti i concessionari con le loro moto disponibili
  const concessionariQuery = `*[_type == "concessionario"]{
    _id,
    nome,
    citta,
    provincia,
    telefono,
    email,
    motoDisponibili
  }`
  
  const [motos, concessionari] = await Promise.all([
    client.fetch(motosQuery),
    client.fetch(concessionariQuery)
  ])
  
  
  // Per ogni moto, conto quanti concessionari la hanno
  const motosWithConcessionari = motos.map(moto => {
    const concessionariConQuestaMoto = concessionari.filter(concessionario => {
      const hasMoto = concessionario.motoDisponibili?.some(motoRef => {
        return motoRef._ref === moto._id
      })
      return hasMoto
    })
    
    
    return {
      ...moto,
      concessionariCount: concessionariConQuestaMoto.length,
      concessionari: concessionariConQuestaMoto.map(c => ({
        _id: c._id,
        nome: c.nome,
        citta: c.citta,
        provincia: c.provincia,
        telefono: c.telefono,
        email: c.email
      }))
    }
  })
  
  return motosWithConcessionari
})