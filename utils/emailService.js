import nodemailer from 'nodemailer'

// Configurazione SMTP
const createTransporter = (config) => {
  const port = parseInt(config.smtpPort)
  const isSecure = port === 465
  
  console.log('📧 Creazione transporter SMTP:', {
    host: config.smtpHost,
    port: port,
    secure: isSecure,
    user: config.smtpUser,
    hasPassword: !!config.smtpPass,
    passwordLength: config.smtpPass?.length || 0
  })
  
  // Prova prima con la configurazione standard
  let transporterConfig = {
    host: config.smtpHost,
    port: port,
    secure: isSecure, // true per 465 (SSL), false per altri porti (STARTTLS)
    auth: {
      user: config.smtpUser.trim(), // Rimuovi spazi
      pass: config.smtpPass.trim() // Rimuovi spazi
    },
    tls: {
      // Disabilita la verifica del certificato per server SMTP con certificati autofirmati
      rejectUnauthorized: false
    },
    // Opzioni aggiuntive per compatibilità
    connectionTimeout: 20000, // 20 secondi
    greetingTimeout: 20000,
    socketTimeout: 20000,
    debug: false, // Disabilita debug verbose (troppo output)
    logger: false // Disabilita logger verbose
  }
  
  // Se non è SSL (porta 465), richiedi STARTTLS
  if (!isSecure) {
    transporterConfig.requireTLS = true
  }
  
  return nodemailer.createTransport(transporterConfig)
}

// Template email per nuovo messaggio al concessionario
export const sendNewMessageToDealer = async (conversazione, messaggio, config) => {
  try {
    const transporter = createTransporter(config)
    
    // Verifica la connessione prima di inviare
    try {
      await transporter.verify()
      console.log('✅ Connessione SMTP verificata per sendNewMessageToDealer')
    } catch (verifyError) {
      console.error('❌ Errore verifica connessione SMTP:', verifyError)
      throw verifyError
    }
    
    const mailOptions = {
      from: `"${config.smtpSenderName}" <${config.smtpUser}>`,
      to: conversazione.concessionario_email,
      subject: `💬 Nuovo messaggio da ${conversazione.cliente_nome} - ${conversazione.moto_marca} ${conversazione.moto_modello}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuovo messaggio - ProntoMoto</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #90c149; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .moto-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #90c149; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd; }
            .button { display: inline-block; background: #90c149; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏍️ ProntoMoto</h1>
              <h2>Nuovo messaggio ricevuto!</h2>
            </div>
            
            <div class="content">
              <p>Ciao <strong>${conversazione.concessionario_nome}</strong>,</p>
              
              <p>Hai ricevuto un nuovo messaggio da un cliente interessato a una delle tue moto:</p>
              
              <div class="moto-info">
                <h3>📋 Dettagli moto</h3>
                <p><strong>Marca:</strong> ${conversazione.moto_marca}</p>
                <p><strong>Modello:</strong> ${conversazione.moto_modello}</p>
                <p><strong>Cliente:</strong> ${conversazione.cliente_nome}</p>
                <p><strong>Email:</strong> ${conversazione.cliente_email}</p>
                ${conversazione.cliente_telefono ? `<p><strong>Telefono:</strong> ${conversazione.cliente_telefono}</p>` : ''}
              </div>
              
              <div class="message-box">
                <h3>💬 Messaggio del cliente:</h3>
                <p style="font-style: italic; background: #f0f0f0; padding: 15px; border-radius: 6px;">
                  "${messaggio.messaggio}"
                </p>
              </div>
              
              <p>Rispondi rapidamente al cliente per aumentare le tue possibilità di vendita!</p>
              
              <div style="text-align: center;">
                <a href="https://prontomoto.it/dealer/conversazioni" class="button">
                  💬 Rispondi ora
                </a>
              </div>
              
              <div class="footer">
                <p>Questo messaggio è stato inviato automaticamente da ProntoMoto</p>
                <p>Se non vuoi più ricevere queste notifiche, contatta il supporto</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email inviata al concessionario:', result.messageId)
    return result
    
  } catch (error) {
    console.error('❌ Errore invio email al concessionario:', error)
    throw error
  }
}

// Template email per risposta al cliente
export const sendReplyToCustomer = async (conversazione, messaggio, config) => {
  try {
    const transporter = createTransporter(config)
    
    const mailOptions = {
      from: `"${config.smtpSenderName}" <${config.smtpUser}>`,
      to: conversazione.cliente_email,
      subject: `💬 Risposta da ${conversazione.concessionario_nome} - ${conversazione.moto_marca} ${conversazione.moto_modello}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Risposta ricevuta - ProntoMoto</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #90c149; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .moto-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #90c149; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd; }
            .button { display: inline-block; background: #90c149; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏍️ ProntoMoto</h1>
              <h2>Hai ricevuto una risposta!</h2>
            </div>
            
            <div class="content">
              <p>Ciao <strong>${conversazione.cliente_nome}</strong>,</p>
              
              <p>Il concessionario <strong>${conversazione.concessionario_nome}</strong> ti ha risposto riguardo alla moto che ti interessa:</p>
              
              <div class="moto-info">
                <h3>📋 Dettagli moto</h3>
                <p><strong>Marca:</strong> ${conversazione.moto_marca}</p>
                <p><strong>Modello:</strong> ${conversazione.moto_modello}</p>
                <p><strong>Concessionario:</strong> ${conversazione.concessionario_nome}</p>
                <p><strong>Città:</strong> ${conversazione.concessionario_citta}</p>
              </div>
              
              <div class="message-box">
                <h3>💬 Risposta del concessionario:</h3>
                <p style="font-style: italic; background: #f0f0f0; padding: 15px; border-radius: 6px;">
                  "${messaggio.messaggio}"
                </p>
              </div>
              
              <p>Continua la conversazione per ottenere tutte le informazioni che ti servono!</p>
              
              <div style="text-align: center;">
                <a href="https://prontomoto.it/conversazioni" class="button">
                  💬 Vedi la conversazione
                </a>
              </div>
              
              <div class="footer">
                <p>Questo messaggio è stato inviato automaticamente da ProntoMoto</p>
                <p>Se non vuoi più ricevere queste notifiche, contatta il supporto</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email inviata al cliente:', result.messageId)
    return result
    
  } catch (error) {
    console.error('❌ Errore invio email al cliente:', error)
    throw error
  }
}

// Template email di benvenuto per il cliente
export const sendWelcomeEmailToCustomer = async (conversazione, messaggio, config) => {
  try {
    const transporter = createTransporter(config)
    
    const mailOptions = {
      from: `"${config.smtpSenderName}" <${config.smtpUser}>`,
      to: conversazione.cliente_email,
      subject: `🏍️ Hai aperto una conversazione con ${conversazione.concessionario_nome} - ProntoMoto`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Conversazione Aperta - ProntoMoto</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #90c149; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .moto-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #90c149; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd; }
            .button { display: inline-block; background: #90c149; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏍️ ProntoMoto</h1>
              <h2>Conversazione Aperta!</h2>
            </div>
            
            <div class="content">
              <div class="success">
                <h3>✅ Messaggio Inviato con Successo!</h3>
                <p>Hai aperto una conversazione con il venditore <strong>${conversazione.concessionario_nome}</strong></p>
              </div>
              
              <p>Ciao <strong>${conversazione.cliente_nome}</strong>,</p>
              
              <p>Il tuo messaggio è stato inviato con successo al concessionario. Ecco i dettagli:</p>
              
              <div class="moto-info">
                <h3>📋 Dettagli moto</h3>
                <p><strong>Marca:</strong> ${conversazione.moto_marca}</p>
                <p><strong>Modello:</strong> ${conversazione.moto_modello}</p>
                <p><strong>Venditore:</strong> ${conversazione.concessionario_nome}</p>
                <p><strong>Città:</strong> ${conversazione.concessionario_citta}</p>
              </div>
              
              <div class="message-box">
                <h3>💬 Il tuo messaggio:</h3>
                <p style="font-style: italic; background: #f0f0f0; padding: 15px; border-radius: 6px;">
                  "${messaggio.messaggio}"
                </p>
              </div>
              
              <p><strong>📬 Quando il venditore risponderà, riceverai una notifica sulla tua email.</strong></p>
              
              ${conversazione.account_creato && conversazione.password ? `
              <div style="background: #e7f3ff; border: 2px solid #90c149; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #90c149; margin-top: 0;">🔑 I tuoi dati di accesso</h3>
                <p style="font-size: 16px; margin: 10px 0;">
                  <strong>Email:</strong> ${conversazione.cliente_email}<br>
                  <strong>Password:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px; font-size: 18px; font-weight: bold; color: #90c149;">${conversazione.password}</code>
                </p>
                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                  <strong>⚠️ Importante:</strong> Salva queste credenziali in un posto sicuro. Potrai usarle per accedere alla tua area utente e seguire tutte le tue conversazioni.
                </p>
              </div>
              ` : `
              <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 14px; color: #666;">
                  <strong>🔑 Hai già un account?</strong><br>
                  Se hai già un account con questa email, puoi accedere normalmente.<br>
                  <a href="https://prontomoto.it/auth/login" style="color: #90c149;">Accedi qui</a>
                </p>
              </div>
              `}
              
              <div style="text-align: center;">
                <a href="https://prontomoto.it/conversazioni/${conversazione.id}" class="button">
                  💬 Segui la conversazione
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <p style="font-size: 14px; color: #666;">
                  <a href="https://prontomoto.it/conversazioni" style="color: #90c149; font-weight: bold;">📬 Vedi tutte le tue conversazioni</a>
                </p>
              </div>
              
              <div class="footer">
                <p>Questo messaggio è stato inviato automaticamente da ProntoMoto</p>
                <p>Se non vuoi più ricevere queste notifiche, contatta il supporto</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email di benvenuto inviata al cliente:', result.messageId)
    return result
    
  } catch (error) {
    console.error('❌ Errore invio email di benvenuto:', error)
    throw error
  }
}

// Template email per nuova conversazione (primo messaggio)
export const sendNewConversationNotification = async (conversazione, messaggio, config) => {
  try {
    const transporter = createTransporter(config)
    
    // Verifica la connessione prima di inviare
    try {
      await transporter.verify()
      console.log('✅ Connessione SMTP verificata per sendNewConversationNotification')
    } catch (verifyError) {
      console.error('❌ Errore verifica connessione SMTP:', verifyError)
      console.error('❌ Dettagli errore verifica:', {
        message: verifyError.message,
        code: verifyError.code,
        command: verifyError.command,
        response: verifyError.response
      })
      throw verifyError
    }
    
    const mailOptions = {
      from: `"${config.smtpSenderName}" <${config.smtpUser}>`,
      to: conversazione.concessionario_email,
      subject: `🆕 Nuova richiesta da ${conversazione.cliente_nome} - ${conversazione.moto_marca} ${conversazione.moto_modello}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuova richiesta - ProntoMoto</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #90c149; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .moto-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #90c149; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ddd; }
            .button { display: inline-block; background: #90c149; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏍️ ProntoMoto</h1>
              <h2>🆕 Nuova richiesta ricevuta!</h2>
            </div>
            
            <div class="content">
              <div class="urgent">
                <h3>⚡ Azione richiesta!</h3>
                <p>Un cliente è interessato a una delle tue moto. Rispondi rapidamente per aumentare le tue possibilità di vendita!</p>
              </div>
              
              <p>Ciao <strong>${conversazione.concessionario_nome}</strong>,</p>
              
              <p>Hai ricevuto una nuova richiesta da un cliente interessato a una delle tue moto:</p>
              
              <div class="moto-info">
                <h3>📋 Dettagli moto</h3>
                <p><strong>Marca:</strong> ${conversazione.moto_marca}</p>
                <p><strong>Modello:</strong> ${conversazione.moto_modello}</p>
                <p><strong>Cliente:</strong> ${conversazione.cliente_nome}</p>
                <p><strong>Email:</strong> ${conversazione.cliente_email}</p>
                ${conversazione.cliente_telefono ? `<p><strong>Telefono:</strong> ${conversazione.cliente_telefono}</p>` : ''}
              </div>
              
              <div class="message-box">
                <h3>💬 Messaggio del cliente:</h3>
                <p style="font-style: italic; background: #f0f0f0; padding: 15px; border-radius: 6px;">
                  "${messaggio.messaggio}"
                </p>
              </div>
              
              <p><strong>💡 Suggerimento:</strong> I clienti che ricevono una risposta rapida hanno il 7x più probabilità di acquistare!</p>
              
              <div style="text-align: center;">
                <a href="https://prontomoto.it/dealer/conversazioni/${conversazione.id}" class="button">
                  💬 Rispondi ora
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <p style="font-size: 14px; color: #666;">
                  <strong>🔑 Accedi alla tua area venditore:</strong><br>
                  <a href="https://prontomoto.it/dealer/dashboard" style="color: #90c149;">Dashboard Concessionario</a>
                </p>
              </div>
              
              <div class="footer">
                <p>Questo messaggio è stato inviato automaticamente da ProntoMoto</p>
                <p>Se non vuoi più ricevere queste notifiche, contatta il supporto</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email nuova conversazione inviata:', result.messageId)
    return result
    
  } catch (error) {
    console.error('❌ Errore invio email nuova conversazione:', error)
    console.error('❌ Dettagli errore completo:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack?.substring(0, 500)
    })
    throw error
  }
}

// Template email per notifica appuntamento al concessionario
export const sendAppointmentNotificationToDealer = async (appuntamento, config) => {
  try {
    const transporter = createTransporter(config)
    
    const dataFormattata = new Date(appuntamento.data_appuntamento).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const mailOptions = {
      from: `"${config.smtpSenderName}" <${config.smtpUser}>`,
      to: appuntamento.concessionario_email,
      subject: `📅 Nuovo appuntamento prenotato - ${appuntamento.cliente_nome || appuntamento.nome}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuovo Appuntamento - ProntoMoto</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #90c149; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .appointment-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #90c149; }
            .button { display: inline-block; background: #90c149; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏍️ ProntoMoto</h1>
              <h2>📅 Nuovo Appuntamento Prenotato!</h2>
            </div>
            
            <div class="content">
              <div class="urgent">
                <h3>📅 Appuntamento da confermare</h3>
                <p>Un cliente ha prenotato un appuntamento. Verifica e conferma quando possibile!</p>
              </div>
              
              <p>Ciao <strong>${appuntamento.concessionario_nome}</strong>,</p>
              
              <p>Hai ricevuto una nuova prenotazione di appuntamento:</p>
              
              <div class="appointment-info">
                <h3>📋 Dettagli Appuntamento</h3>
                <p><strong>📅 Data:</strong> ${dataFormattata}</p>
                <p><strong>🕐 Orario:</strong> ${appuntamento.orario_appuntamento}</p>
                <p><strong>👤 Cliente:</strong> ${appuntamento.cliente_nome || appuntamento.nome} ${appuntamento.cognome || ''}</p>
                <p><strong>📧 Email:</strong> ${appuntamento.cliente_email || appuntamento.email}</p>
                ${appuntamento.cliente_telefono || appuntamento.telefono ? `<p><strong>📞 Telefono:</strong> ${appuntamento.cliente_telefono || appuntamento.telefono}</p>` : ''}
                ${appuntamento.moto_marca && appuntamento.moto_modello ? `<p><strong>🏍️ Moto:</strong> ${appuntamento.moto_marca} ${appuntamento.moto_modello}</p>` : ''}
                ${appuntamento.note ? `<p><strong>📝 Note:</strong> ${appuntamento.note}</p>` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="https://prontomoto.it/dealer/appuntamenti" class="button">
                  📅 Gestisci Appuntamenti
                </a>
              </div>
              
              <div class="footer">
                <p>Questo messaggio è stato inviato automaticamente da ProntoMoto</p>
                <p>Se non vuoi più ricevere queste notifiche, contatta il supporto</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email appuntamento inviata al concessionario:', result.messageId)
    return result
    
  } catch (error) {
    console.error('❌ Errore invio email appuntamento al concessionario:', error)
    throw error
  }
}

// Template email per conferma appuntamento al cliente
export const sendAppointmentConfirmationToCustomer = async (appuntamento, config) => {
  try {
    const transporter = createTransporter(config)
    
    const dataFormattata = new Date(appuntamento.data_appuntamento).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const mailOptions = {
      from: `"${config.smtpSenderName}" <${config.smtpUser}>`,
      to: appuntamento.cliente_email || appuntamento.email,
      subject: `📅 Appuntamento prenotato con ${appuntamento.concessionario_nome} - ProntoMoto`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appuntamento Confermato - ProntoMoto</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #90c149; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .appointment-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #90c149; }
            .button { display: inline-block; background: #90c149; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏍️ ProntoMoto</h1>
              <h2>📅 Appuntamento Prenotato!</h2>
            </div>
            
            <div class="content">
              <div class="success">
                <h3>✅ Appuntamento Confermato!</h3>
                <p>La tua prenotazione è stata registrata con successo.</p>
              </div>
              
              <p>Ciao <strong>${appuntamento.cliente_nome || appuntamento.nome}</strong>,</p>
              
              <p>Il tuo appuntamento è stato prenotato con successo. Ecco i dettagli:</p>
              
              <div class="appointment-info">
                <h3>📋 Dettagli Appuntamento</h3>
                <p><strong>📅 Data:</strong> ${dataFormattata}</p>
                <p><strong>🕐 Orario:</strong> ${appuntamento.orario_appuntamento}</p>
                <p><strong>🏪 Concessionario:</strong> ${appuntamento.concessionario_nome}</p>
                ${appuntamento.moto_marca && appuntamento.moto_modello ? `<p><strong>🏍️ Moto:</strong> ${appuntamento.moto_marca} ${appuntamento.moto_modello}</p>` : ''}
                ${appuntamento.note ? `<p><strong>📝 Note:</strong> ${appuntamento.note}</p>` : ''}
              </div>
              
              <p><strong>💡 Ricorda:</strong> Il concessionario ti confermerà l'appuntamento a breve. Riceverai una notifica quando sarà confermato.</p>
              
              <div style="text-align: center;">
                <a href="https://prontomoto.it/conversazioni" class="button">
                  💬 Vedi le tue conversazioni
                </a>
              </div>
              
              <div class="footer">
                <p>Questo messaggio è stato inviato automaticamente da ProntoMoto</p>
                <p>Se non vuoi più ricevere queste notifiche, contatta il supporto</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email conferma appuntamento inviata al cliente:', result.messageId)
    return result
    
  } catch (error) {
    console.error('❌ Errore invio email conferma appuntamento al cliente:', error)
    throw error
  }
}



