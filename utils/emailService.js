import nodemailer from 'nodemailer'

// Configurazione SMTP
const createTransporter = (config) => {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: parseInt(config.smtpPort),
    secure: true, // true per 465, false per altri porti
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  })
}

// Template email per nuovo messaggio al concessionario
export const sendNewMessageToDealer = async (conversazione, messaggio, config) => {
  try {
    const transporter = createTransporter(config)
    
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
              
              <div style="text-align: center;">
                <a href="https://prontomoto.it/conversazioni/${conversazione.id}" class="button">
                  💬 Segui la conversazione
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <p style="font-size: 14px; color: #666;">
                  <strong>🔑 I tuoi dati di accesso:</strong><br>
                  Email: ${conversazione.cliente_email}<br>
                  <a href="https://prontomoto.it/dashboard" style="color: #90c149;">Accedi alla tua area utente</a>
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
    throw error
  }
}



