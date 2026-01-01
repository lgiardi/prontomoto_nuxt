# 📝 Estensione Tabella APPOINTMENTI - Istruzioni

## Cosa fa questo script

Lo script `estendi-tabella-appuntamenti.sql` estende (o crea) la tabella `appuntamenti` per:
- ✅ **Supportare tutti i tipi** (moto nuova, usata, servizio)
- ✅ **Collegarsi a lead e conversazioni**
- ✅ **Mantenere retrocompatibilità** con dati esistenti

## Modifiche apportate

1. **Crea la tabella** se non esiste (con struttura base)
2. **Aggiunge `tipo_richiesta`** (ENUM: moto_nuova, moto_usata, servizio)
3. **Rende `moto_id` nullable** (non più obbligatorio)
4. **Aggiunge `moto_usata_id`** (FK a moto_usate)
5. **Aggiunge `servizio_concessionario_id`** (FK a servizi_concessionari)
6. **Aggiunge `lead_id`** (FK a lead, opzionale)
7. **Aggiunge `conversazione_id`** (FK a conversazioni, opzionale)
8. **Aggiunge campi generici** (moto_marca, moto_modello)
9. **Supporta doppia nomenclatura** (nome/cognome e cliente_nome/cliente_email) per retrocompatibilità
10. **Verifica constraint `stato`** (pending, confirmed, completed, cancelled)

## Sicurezza

✅ **Sicuro da eseguire più volte** - Verifica esistenza colonne prima di aggiungerle

✅ **Non elimina dati** - Solo aggiunge colonne, mantiene dati esistenti

✅ **Retrocompatibilità** - Il campo `servizio` (stringa) viene mantenuto se esiste già

## Come eseguire

1. Vai su **Supabase Dashboard** > **SQL Editor**
2. Copia e incolla il contenuto di `estendi-tabella-appuntamenti.sql`
3. Clicca **Run**
4. Verifica che compaia "✅ Estensione tabella APPOINTMENTI completata con successo!"

## Verifica

Dopo l'esecuzione, verifica che:
- [ ] La tabella `appuntamenti` esiste
- [ ] La colonna `tipo_richiesta` esiste
- [ ] Le nuove colonne (`moto_usata_id`, `servizio_concessionario_id`, `lead_id`, `conversazione_id`) esistono
- [ ] Gli appuntamenti esistenti sono ancora visibili

## Note importanti

- **Doppia nomenclatura**: La tabella supporta sia `nome/cognome/email` che `cliente_nome/cliente_email/cliente_telefono` per compatibilità con entrambi i sistemi
- **Campo servizio**: Se esiste già come stringa, viene mantenuto per retrocompatibilità, ma si userà `servizio_concessionario_id` per i nuovi record
- **Foreign Keys**: Le FK a `lead` e `conversazioni` sono opzionali (ON DELETE SET NULL)

## Prossimo step

Dopo aver eseguito questo script, dimmi se tutto è ok e procederò con:
- Aggiornamento API `/api/lead/create.post.ts` per supportare tutti i tipi
- Aggiornamento API `/api/appointments/index.post.ts` per supportare tutti i tipi e collegarsi a lead/conversazioni











