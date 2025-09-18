# Setup Supabase per ProntoMoto

## 1. Crea un account Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Clicca "Start your project"
3. Crea un account o accedi con GitHub
4. Clicca "New Project"

## 2. Configura il progetto

1. **Nome progetto:** `prontomoto`
2. **Database Password:** Scegli una password sicura (salvala!)
3. **Regione:** Scegli la più vicina (Europe West)
4. Clicca "Create new project"

## 3. Configura il database

1. Vai su **SQL Editor** nel pannello Supabase
2. Copia e incolla il contenuto del file `supabase-schema.sql`
3. Clicca **Run** per eseguire lo schema

## 4. Configura l'autenticazione

1. Vai su **Authentication** > **Settings**
2. **Site URL:** `http://localhost:3002` (per sviluppo)
3. **Redirect URLs:** Aggiungi `http://localhost:3002/auth/callback`
4. **Email Auth:** Abilita "Enable email confirmations"

## 5. Ottieni le chiavi API

1. Vai su **Settings** > **API**
2. Copia:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)

## 6. Configura le variabili d'ambiente

Crea un file `.env` nella root del progetto:

```env
# Supabase Configuration
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here

# Sanity Configuration (existing)
SANITY_PROJECT_ID=1i1fbngf
SANITY_DATASET=production
```

## 7. Testa il sistema

1. Riavvia il server: `pnpm run dev`
2. Vai su `http://localhost:3002/auth/register`
3. Registra un concessionario di test
4. Controlla in Supabase > **Authentication** > **Users**

## 8. Approva i concessionari

1. Vai su **Table Editor** > **concessionari**
2. Cambia `status` da `pending` a `active` per i concessionari approvati

## Funzionalità implementate

✅ **Registrazione concessionari**
✅ **Login/Logout**
✅ **Dashboard concessionari**
✅ **Middleware di autenticazione**
✅ **Schema database completo**
✅ **Row Level Security (RLS)**
✅ **Gestione stati account**

## Prossimi passi

- [ ] Sistema di pagamenti (Stripe)
- [ ] Gestione moto per concessionari
- [ ] Sistema lead
- [ ] Registrazione utenti finali
- [ ] Sistema preferiti
- [ ] Analytics e reporting

## Supporto

Se hai problemi:
1. Controlla la console del browser per errori
2. Verifica le variabili d'ambiente
3. Controlla i log di Supabase
4. Assicurati che lo schema sia stato eseguito correttamente



