export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { nome, email, telefono, messaggio } = body

    console.log('📝 Form di test ricevuto:', { nome, email, telefono, messaggio })

    // Salva in un file locale per test
    const fs = require('fs')
    const path = require('path')
    
    const data = {
      timestamp: new Date().toISOString(),
      nome,
      email,
      telefono,
      messaggio
    }

    const filePath = path.join(process.cwd(), 'test-messages.json')
    
    // Leggi i messaggi esistenti
    let messages = []
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        messages = JSON.parse(content)
      }
    } catch (error) {
      console.log('File non esiste o errore lettura, creo nuovo array')
    }

    // Aggiungi nuovo messaggio
    messages.push(data)

    // Salva
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2))

    return {
      success: true,
      message: 'Messaggio salvato con successo!',
      data: data
    }

  } catch (error) {
    console.error('❌ Errore form di test:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nel salvataggio del messaggio'
    })
  }
})



