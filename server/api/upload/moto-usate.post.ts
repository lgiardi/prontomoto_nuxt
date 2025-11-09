import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { createError, defineEventHandler, getHeader, readMultipartFormData } from 'h3'

const uploadSchema = z.object({
  file: z.any(), // File object
  type: z.enum(['cover', 'gallery']).default('gallery')
})

export default defineEventHandler(async (event) => {
  try {
    // Verifica autenticazione
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token di autenticazione mancante'
      })
    }

    const token = authHeader.split(' ')[1]
    const supabase = createClient(
      'https://xffcrstnyfjthlaurlyx.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjA4OTgsImV4cCI6MjA3MzYzNjg5OH0.ksZs9k0fYCUZ0nKvF-s8LNL3SQQbppifIbtTVxpyQUE'
    )

    // Verifica token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token non valido'
      })
    }

    // Leggi il file multipart
    const formData = await readMultipartFormData(event)
    console.log('FormData ricevuto:', formData?.length || 0)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nessun file fornito'
      })
    }

    const file = formData[0]
    console.log('File ricevuto:', file?.filename, 'Tipo:', file?.type, 'Dati:', file?.data?.length || 0)
    
    if (!file.data || !file.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File non valido'
      })
    }

    // Valida tipo file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type || '')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tipo file non supportato. Usa JPG, PNG o WebP'
      })
    }

    // Crea directory se non esiste
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'moto-usate')
    console.log('Upload directory:', uploadDir)
    
    if (!existsSync(uploadDir)) {
      console.log('Creo directory:', uploadDir)
      await mkdir(uploadDir, { recursive: true })
    }

    // Genera nome file unico
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.filename.split('.').pop()
    const filename = `moto_${timestamp}_${randomString}.${extension}`
    const filepath = join(uploadDir, filename)
    
    console.log('Salvo file:', filepath)

    // Salva file
    await writeFile(filepath, file.data)
    console.log('File salvato con successo')

    // Restituisci URL pubblico
    const publicUrl = `/uploads/moto-usate/${filename}`
    console.log('URL pubblico:', publicUrl)

    return {
      success: true,
      url: publicUrl,
      filename: filename
    }

  } catch (error) {
    console.error('Errore upload:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nel caricamento del file'
    })
  }
})
