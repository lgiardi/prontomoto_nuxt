-- ============================================
-- ESTENSIONE TABELLA LEAD PER SISTEMA GLOBALE
-- ============================================
-- Questo script estende la tabella lead per supportare:
-- - Moto nuove
-- - Moto usate  
-- - Servizi
-- 
-- IMPORTANTE: Lo script verifica l'esistenza delle colonne
-- prima di aggiungerle, quindi è sicuro eseguirlo più volte

DO $$
BEGIN
    -- 1. Aggiungi tipo_richiesta se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'tipo_richiesta'
    ) THEN
        ALTER TABLE lead ADD COLUMN tipo_richiesta VARCHAR(20) DEFAULT 'moto_nuova';
        ALTER TABLE lead ADD CONSTRAINT lead_tipo_richiesta_check 
            CHECK (tipo_richiesta IN ('moto_nuova', 'moto_usata', 'servizio'));
        RAISE NOTICE 'Colonna "tipo_richiesta" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "tipo_richiesta" esiste già nella tabella "lead".';
        
        -- Aggiorna il constraint se esiste già ma non ha tutti i valori
        BEGIN
            ALTER TABLE lead DROP CONSTRAINT IF EXISTS lead_tipo_richiesta_check;
            ALTER TABLE lead ADD CONSTRAINT lead_tipo_richiesta_check 
                CHECK (tipo_richiesta IN ('moto_nuova', 'moto_usata', 'servizio'));
            RAISE NOTICE 'Constraint "tipo_richiesta" aggiornato.';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Constraint già corretto o errore nell''aggiornamento: %', SQLERRM;
        END;
    END IF;

    -- 2. Rendi moto_id nullable (per supportare anche moto usate e servizi)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' 
        AND column_name = 'moto_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE lead ALTER COLUMN moto_id DROP NOT NULL;
        RAISE NOTICE 'Colonna "moto_id" resa nullable.';
    ELSE
        RAISE NOTICE 'Colonna "moto_id" è già nullable o non esiste.';
    END IF;

    -- 3. Aggiungi moto_usata_id se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'moto_usata_id'
    ) THEN
        ALTER TABLE lead ADD COLUMN moto_usata_id UUID REFERENCES moto_usate(id) ON DELETE CASCADE;
        RAISE NOTICE 'Colonna "moto_usata_id" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "moto_usata_id" esiste già nella tabella "lead".';
    END IF;

    -- 4. Aggiungi servizio_concessionario_id se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'servizio_concessionario_id'
    ) THEN
        ALTER TABLE lead ADD COLUMN servizio_concessionario_id UUID REFERENCES servizi_concessionari(id) ON DELETE CASCADE;
        RAISE NOTICE 'Colonna "servizio_concessionario_id" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "servizio_concessionario_id" esiste già nella tabella "lead".';
    END IF;

    -- 5. Aggiungi moto_marca se non esiste (generico per tutti i tipi)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'moto_marca'
    ) THEN
        ALTER TABLE lead ADD COLUMN moto_marca VARCHAR(255);
        RAISE NOTICE 'Colonna "moto_marca" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "moto_marca" esiste già nella tabella "lead".';
    END IF;

    -- 6. Aggiungi moto_modello se non esiste (generico per tutti i tipi)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'moto_modello'
    ) THEN
        ALTER TABLE lead ADD COLUMN moto_modello VARCHAR(255);
        RAISE NOTICE 'Colonna "moto_modello" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "moto_modello" esiste già nella tabella "lead".';
    END IF;

    -- 7. Verifica esistenza colonne opzionali (potrebbero già esistere dal codice esistente)
    
    -- priorita
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'priorita'
    ) THEN
        ALTER TABLE lead ADD COLUMN priorita VARCHAR(20) DEFAULT 'media';
        RAISE NOTICE 'Colonna "priorita" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "priorita" esiste già nella tabella "lead".';
    END IF;

    -- fonte
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'fonte'
    ) THEN
        ALTER TABLE lead ADD COLUMN fonte VARCHAR(50) DEFAULT 'sito_web';
        RAISE NOTICE 'Colonna "fonte" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "fonte" esiste già nella tabella "lead".';
    END IF;

    -- note_internal
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'note_internal'
    ) THEN
        ALTER TABLE lead ADD COLUMN note_internal TEXT;
        RAISE NOTICE 'Colonna "note_internal" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "note_internal" esiste già nella tabella "lead".';
    END IF;

    -- risposta_concessionario
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'risposta_concessionario'
    ) THEN
        ALTER TABLE lead ADD COLUMN risposta_concessionario TEXT;
        RAISE NOTICE 'Colonna "risposta_concessionario" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "risposta_concessionario" esiste già nella tabella "lead".';
    END IF;

    -- data_risposta
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'data_risposta'
    ) THEN
        ALTER TABLE lead ADD COLUMN data_risposta TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonna "data_risposta" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "data_risposta" esiste già nella tabella "lead".';
    END IF;

    -- 8. Aggiungi conversazione_id se non esiste (collegamento a conversazioni)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'conversazione_id'
    ) THEN
        ALTER TABLE lead ADD COLUMN conversazione_id UUID REFERENCES conversazioni(id) ON DELETE SET NULL;
        RAISE NOTICE 'Colonna "conversazione_id" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'Colonna "conversazione_id" esiste già nella tabella "lead".';
    END IF;

    RAISE NOTICE '✅ Estensione tabella LEAD completata con successo!';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Errore durante l''estensione: %', SQLERRM;
    RAISE;
END $$;

-- Verifica finale della struttura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'lead'
ORDER BY ordinal_position;



