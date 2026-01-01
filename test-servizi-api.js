// Test script per verificare l'API servizi
// Esegui con: node test-servizi-api.js

const testServiziAPI = async () => {
  try {
    console.log('🧪 Test API Servizi...\n')

    // Prima verifica che il server sia in esecuzione
    console.log('1️⃣ Verifica connessione server...')
    const healthCheck = await fetch('http://localhost:3002/api/servizi-catalogo')
    if (!healthCheck.ok) {
      throw new Error(`Server non raggiungibile: ${healthCheck.status}`)
    }
    const catalogo = await healthCheck.json()
    console.log('✅ Server raggiungibile')
    console.log(`✅ Catalogo servizi disponibile: ${catalogo.data?.length || 0} servizi\n`)

    // Prendi il primo servizio dal catalogo per il test
    if (!catalogo.data || catalogo.data.length === 0) {
      throw new Error('Nessun servizio nel catalogo! Esegui prima lo script SQL per popolare il catalogo.')
    }

    const primoServizio = catalogo.data[0]
    console.log('2️⃣ Dati di test:')
    console.log(`   Servizio catalogo ID: ${primoServizio.id}`)
    console.log(`   Nome: ${primoServizio.nome}\n`)

    // Dati di test per la creazione
    const testData = {
      servizio_catalogo_id: primoServizio.id,
      prezzo_da: 50.00,
      prezzo_a: 100.00,
      durata_minuti: 60,
      descrizione: 'Test automatico servizio - da eliminare',
      foto: [],
      disponibile: true
    }

    console.log('3️⃣ Test creazione servizio (senza autenticazione - dovrebbe fallire)...')
    const testWithoutAuth = await fetch('http://localhost:3002/api/servizi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    const resultNoAuth = await testWithoutAuth.json()
    if (testWithoutAuth.status === 401) {
      console.log('✅ Test autenticazione: CORRETTO (401 come previsto)\n')
    } else {
      console.log(`⚠️ Test autenticazione: Inatteso status ${testWithoutAuth.status}`)
      console.log('Risposta:', resultNoAuth, '\n')
    }

    console.log('4️⃣ Verifica struttura dati:')
    console.log('   ✓ servizio_catalogo_id:', typeof testData.servizio_catalogo_id)
    console.log('   ✓ prezzo_da:', typeof testData.prezzo_da)
    console.log('   ✓ prezzo_a:', typeof testData.prezzo_a)
    console.log('   ✓ durata_minuti:', typeof testData.durata_minuti)
    console.log('   ✓ descrizione:', typeof testData.descrizione)
    console.log('   ✓ foto:', Array.isArray(testData.foto) ? 'array' : typeof testData.foto)
    console.log('   ✓ disponibile:', typeof testData.disponibile, '\n')

    console.log('5️⃣ Test validazione schema:')
    // Verifica che i dati rispettino lo schema
    const validations = {
      'servizio_catalogo_id è UUID': /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testData.servizio_catalogo_id),
      'prezzo_da è positivo': testData.prezzo_da > 0,
      'descrizione non vuota': testData.descrizione.trim().length > 0,
      'foto è array': Array.isArray(testData.foto),
      'disponibile è boolean': typeof testData.disponibile === 'boolean'
    }

    Object.entries(validations).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}`)
    })

    console.log('\n✅ Test completati!')
    console.log('\n📝 NOTA: Per testare la creazione completa, devi:')
    console.log('   1. Essere autenticato come concessionario')
    console.log('   2. Avere uno status "active"')
    console.log('   3. Usare il form nel browser con un token valido\n')

  } catch (error) {
    console.error('❌ Errore nel test:', error.message)
    if (error.cause) {
      console.error('   Causa:', error.cause)
    }
  }
}

testServiziAPI()











