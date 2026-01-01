import { sendNewConversationNotification } from '~/utils/emailService'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Prepara la configurazione SMTP
    const emailConfig = {
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpUser: config.smtpUser,
      smtpPass: config.smtpPass,
      smtpSenderName: config.smtpSenderName || 'ProntoMoto'
    }
    
    console.log('📧 Test invio email - Configurazione SMTP:', {
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      user: emailConfig.smtpUser,
      hasPassword: !!emailConfig.smtpPass
    })
    
    // Crea dati di test
    const testConversazione = {
      id: 'test-123',
      cliente_nome: 'Test Utente',
      cliente_email: 'marketing@palatifini.it',
      cliente_telefono: '+39 123 456 7890',
      concessionario_nome: 'Test Concessionario',
      concessionario_email: 'marketing@palatifini.it',
      concessionario_citta: 'Roma',
      moto_marca: 'Test Marca',
      moto_modello: 'Test Modello'
    }
    
    const testMessaggio = {
      id: 'test-msg-123',
      messaggio: 'Questa è una email di test per verificare la configurazione SMTP.'
    }
    
    console.log('📧 Invio email di test a: marketing@palatifini.it')
    
    // Invia email di test
    const result = await sendNewConversationNotification(
      testConversazione,
      testMessaggio,
      emailConfig
    )
    
    console.log('✅ Email di test inviata con successo:', result.messageId)
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email di test inviata con successo a marketing@palatifini.it'
    }
    
  } catch (error) {
    console.error('❌ Errore invio email di test:', error)
    console.error('❌ Dettagli errore:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack?.substring(0, 1000)
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nell\'invio dell\'email di test',
      data: {
        message: error.message,
        code: error.code,
        response: error.response
      }
    })
  }
})

