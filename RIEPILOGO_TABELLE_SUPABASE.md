# 📊 Riepilogo Tabelle Supabase - ProntoMoto

## Tabelle Principali

### 1. `concessionari`
- **ID**: `UUID` (corrisponde a `auth.users(id)`)
- **Campi rilevanti**:
  - `id UUID PRIMARY KEY` → riferimento a `auth.users(id)`
  - `nome VARCHAR(255)`
  - `email VARCHAR(255)`
  - `telefono VARCHAR(50)`
  - **`citta VARCHAR(100) NOT NULL`** ← CITTÀ QUI
  - `provincia VARCHAR(10)`
  - `status VARCHAR(20)`
- **RLS**: Abilitato (concessionari vedono solo i propri dati)

### 2. `moto_concessionari` (per MOTO NUOVE)
- **Scopo**: Relazione many-to-many tra `moto` e `concessionari`
- **Campi**:
  - `moto_id VARCHAR(255)` → riferimento a `moto.id`
  - `concessionario_id UUID` → riferimento a `concessionari.id`
  - `disponibile BOOLEAN`
  - `prezzo_speciale DECIMAL(10,2)`
  - ecc.

### 3. `moto_usate`
- **Campi rilevanti**:
  - `id UUID PRIMARY KEY`
  - `catalogo_id UUID` → riferimento a `moto_usate_catalogo(id)`
  - `km INTEGER`
  - `anno INTEGER`
  - `prezzo DECIMAL(10,2)`
  - `foto JSONB`
  - **`venditore_id UUID NOT NULL`** ← ID del venditore (concessionario o privato)
  - **`venditore_type VARCHAR(20)`** ← 'concessionario' o 'privato'
  - `status VARCHAR(20)` → 'pending', 'approved', 'rejected'
- **Relazione con concessionari**:
  - Quando `venditore_type = 'concessionario'`, allora:
    - `venditore_id` dovrebbe corrispondere a `concessionari.id`
  - **⚠️ NON c'è una FOREIGN KEY esplicita definita!**

### 4. `moto_usate_catalogo`
- **Scopo**: Catalogo delle moto usate (marca/modello)
- **Campi**:
  - `id UUID PRIMARY KEY`
  - `marca VARCHAR(100)`
  - `modello VARCHAR(100)`
  - **❌ NON ha il campo `categoria`** (il campo esiste solo in `moto_usate`)

## 🔍 Relazione Città per Moto Usate

### Per Moto da Concessionario:
```
moto_usate.venditore_id → concessionari.id → concessionari.citta
```

**Problema identificato**:
- `moto_usate.venditore_id` NON ha una foreign key esplicita
- La relazione si basa su corrispondenza UUID
- Se `venditore_id` non corrisponde a un `concessionari.id` valido, la città non viene trovata

### Per Moto da Privato:
- La città dovrebbe essere in `moto_usate.venditore_citta` o `moto_usate.citta`

## 🔧 Query Attuale (server/api/moto-usate.get.ts)

```typescript
// Per ogni moto con venditore_type = 'concessionario':
const { data: concessionario } = await supabaseService
  .from('concessionari')
  .select('id, citta, provincia, nome')
  .eq('id', moto.venditore_id)
  .maybeSingle()
```

## ⚠️ Possibili Problemi

1. **Dati inconsistenti**: `venditore_id` potrebbe non corrispondere a un `concessionari.id` esistente
2. **RLS Policies**: Le policy RLS potrebbero bloccare la lettura anche con service role (da verificare)
3. **UUID mismatch**: Il formato UUID potrebbe non corrispondere esattamente

## ✅ Soluzione Proposta

1. Verificare che i `venditore_id` nelle `moto_usate` corrispondano a `concessionari.id` esistenti
2. Aggiungere logging dettagliato per tracciare i valori di `venditore_id` e `concessionari.id`
3. Verificare che il service role key bypassi correttamente le RLS policies



