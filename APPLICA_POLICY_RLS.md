# 🔧 Applicazione Policy RLS per Sistema Chat

## 📋 **Istruzioni per Completare il Sistema Chat**

### **1. Configurare Service Key Supabase**

La **Service Role Key** è già configurata in `nuxt.config.ts`. Se non l'hai ancora aggiunta:

**Come ottenere la Service Key:**
1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Settings** → **API**
4. Copia la **service_role** key (non la anon key)
5. Aggiungila al file `.env` come `SUPABASE_SERVICE_ROLE_KEY=...`

### **2. Applicare le Policy RLS**

Esegui il file SQL `fix-chat-rls-policies.sql` nel **SQL Editor** di Supabase:

1. Vai su **SQL Editor** nel dashboard Supabase
2. Crea una nuova query
3. Copia e incolla il contenuto di `fix-chat-rls-policies.sql`
4. Esegui la query

### **3. Testare il Sistema**

Dopo aver applicato le policy:

1. **Riavvia il server**: `pnpm run dev -- --port 3002`
2. **Vai su una scheda moto**
3. **Compila il form "Contatta venditore"**
4. **Verifica che:**
   - ✅ Account venga creato automaticamente
   - ✅ Conversazione venga creata
   - ✅ Email di benvenuto arrivi al cliente
   - ✅ Email di notifica arrivi al concessionario

### **4. Flusso Completo Funzionante**

```
Cliente compila form → Account creato → Conversazione creata → 
Email cliente: "Hai aperto conversazione con GEMOTORS" → 
Email concessionario: "Nuova richiesta da cliente" → 
Concessionario risponde → Cliente riceve notifica → 
Chat continua con notifiche automatiche
```

## 🎯 **Risultato Finale**

- ✅ **Zero friction** - nessuna barriera all'ingresso
- ✅ **Account automatici** - database utenti popolato
- ✅ **Notifiche email** - sistema professionale
- ✅ **Sicurezza RLS** - dati protetti
- ✅ **Futuro dashsense** - base utenti pronta

## 🚨 **Importante**

**NON dimenticare di:**
1. Aggiungere la `SUPABASE_SERVICE_ROLE_KEY` al `.env`
2. Applicare le policy RLS al database
3. Riavviare il server dopo le modifiche

**Il sistema sarà completamente funzionante!**
