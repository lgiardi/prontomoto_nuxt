import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_TOKEN
})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { ids } = query

    if (!ids) {
      throw createError({
        statusCode: 400,
        statusMessage: 'IDs parameter is required'
      })
    }

    // Converti la stringa di ID separati da virgola in array
    const idsArray = typeof ids === 'string' ? ids.split(',') : ids
    console.log('🔍 Fetching motos for IDs:', idsArray)

    const motos = await sanityClient.fetch(`*[_id in $ids]{
      _id,
      marca,
      modello,
      allestimento,
      categoria,
      cilindrata,
      "immagineUrl": immagineCopertina.asset->url
    }`, { ids: idsArray })

    console.log('✅ Motos fetched:', motos.length)

    return motos
  } catch (error) {
    console.error('❌ Error fetching motos:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching motos from Sanity'
    })
  }
})
