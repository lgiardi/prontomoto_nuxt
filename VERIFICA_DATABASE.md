# 🔍 Verifica Struttura Database

## Istruzioni

1. Vai su **Supabase Dashboard** > **SQL Editor**
2. Copia e incolla il contenuto di `verifica-struttura-tabelle.sql`
3. Esegui la query
4. Copia i risultati e condividili per analisi

## Cosa verifica lo script

Lo script verifica:

1. ✅ **Struttura colonne** di tutte le tabelle (lead, appuntamenti, slot_disponibili, conversazioni, messaggi)
2. ✅ **Foreign Keys** esistenti
3. ✅ **CHECK constraints** (valori permessi per enum/status)
4. ✅ **Esistenza tabelle** (se esistono o no)
5. ✅ **Numero record** esistenti

## Cosa cercare nei risultati

### Tabella LEAD
- [ ] Esiste?
- [ ] Ha `moto_id` come VARCHAR?
- [ ] Ha `tipo_richiesta`?
- [ ] Supporta moto_usate_id o servizio_concessionario_id?

### Tabella APPOINTMENTI
- [ ] Esiste?
- [ ] Quali colonne ha? (nome/cognome o cliente_nome/cliente_email?)
- [ ] Ha `lead_id`?
- [ ] Ha `tipo_richiesta`?
- [ ] Ha `moto_usata_id` e `servizio_concessionario_id`?
- [ ] Quali valori supporta per `stato`?

### Tabella SLOT_DISPONIBILI
- [ ] Esiste?
- [ ] Quali colonne ha?

### Tabella CONVERSAZIONI
- [ ] Ha tutti i campi per moto_usata e servizi?
- [ ] Ha `tipo_richiesta`?

## Dopo la verifica

Una volta ottenuti i risultati, potremo:
1. Creare gli script SQL di estensione/modifica necessari
2. Verificare compatibilità con codice esistente
3. Pianificare migrazioni senza perdere dati







