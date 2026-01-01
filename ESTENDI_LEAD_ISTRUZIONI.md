# 📝 Estensione Tabella LEAD - Istruzioni

## Cosa fa questo script

Lo script `estendi-tabella-lead.sql` estende la tabella `lead` per supportare:
- ✅ **Moto nuove** (già supportato)
- ✅ **Moto usate** (nuovo)
- ✅ **Servizi** (nuovo)

## Modifiche apportate

1. **Aggiunge `tipo_richiesta`** (ENUM: moto_nuova, moto_usata, servizio)
2. **Rende `moto_id` nullable** (non più obbligatorio)
3. **Aggiunge `moto_usata_id`** (FK a moto_usate)
4. **Aggiunge `servizio_concessionario_id`** (FK a servizi_concessionari)
5. **Aggiunge `moto_marca` e `moto_modello`** (generici per tutti i tipi)
6. **Aggiunge campi opzionali** (priorita, fonte, note_internal, risposta_concessionario, data_risposta)

## Sicurezza

✅ **Sicuro da eseguire più volte** - Lo script verifica l'esistenza delle colonne prima di aggiungerle

✅ **Non elimina dati** - Solo aggiunge colonne, non modifica o rimuove dati esistenti

✅ **Compatibile con dati esistenti** - I lead esistenti continueranno a funzionare

## Come eseguire

1. Vai su **Supabase Dashboard** > **SQL Editor**
2. Copia e incolla il contenuto di `estendi-tabella-lead.sql`
3. Clicca **Run**
4. Verifica che compaia il messaggio "✅ Estensione tabella LEAD completata con successo!"

## Verifica

Dopo l'esecuzione, verifica che:
- [ ] La colonna `tipo_richiesta` esiste
- [ ] La colonna `moto_id` è nullable
- [ ] Le nuove colonne (`moto_usata_id`, `servizio_concessionario_id`) esistono
- [ ] I lead esistenti sono ancora visibili

## Prossimo step

Dopo aver eseguito questo script, dimmi se tutto è ok e procederò con:
- Estensione tabella `appuntamenti`
- Aggiornamento API `/api/lead/create.post.ts`











