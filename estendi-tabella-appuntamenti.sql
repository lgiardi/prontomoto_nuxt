-- ============================================
-- ESTENSIONE TABELLA APPOINTMENTI PER SISTEMA GLOBALE
-- ============================================
-- Questo script estende la tabella appuntamenti per supportare:
-- - Moto nuove
-- - Moto usate  
-- - Servizi
-- - Collegamento a lead e conversazioni
-- 
-- IMPORTANTE: Lo script verifica l'esistenza delle colonne
-- prima di aggiungerle, quindi è sicuro eseguirlo più volte

DO $$
BEGIN
    -- 1. Crea la tabella appuntamenti se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'appuntamenti'
    ) THEN
        CREATE TABLE appuntamenti (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            concessionario_id UUID REFERENCES concessionari(id) ON DELETE CASCADE NOT NULL,
            
            -- Dati cliente (doppia nomenclatura per compatibilità)
            nome VARCHAR(255),
            cognome VARCHAR(255),
            email VARCHAR(255) NOT NULL,
            telefono VARCHAR(50),
            
            -- Dati cliente alternativa (per compatibilità con lead)
            cliente_nome VARCHAR(255),
            cliente_email VARCHAR(255),
            cliente_telefono VARCHAR(50),
            
            -- Dati appuntamento
            data_appuntamento DATE NOT NULL,
            orario_appuntamento TIME NOT NULL,
            tipo_appuntamento VARCHAR(50) DEFAULT 'visita',
            note TEXT,
            
            -- Stato appuntamento
            stato VARCHAR(20) DEFAULT 'pending' CHECK (stato IN ('pending', 'confirmed', 'completed', 'cancelled')),
            
            -- Tracking
            ip_address VARCHAR(45),
            user_agent TEXT,
            
            -- Timestamps
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Trigger per updated_at
        CREATE TRIGGER update_appuntamenti_updated_at 
            BEFORE UPDATE ON appuntamenti 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Tabella "appuntamenti" creata.';
    ELSE
        RAISE NOTICE 'Tabella "appuntamenti" esiste già.';
    END IF;

    -- 2. Aggiungi tipo_richiesta se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'tipo_richiesta'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN tipo_richiesta VARCHAR(20) DEFAULT 'moto_nuova';
        ALTER TABLE appuntamenti ADD CONSTRAINT appuntamenti_tipo_richiesta_check 
            CHECK (tipo_richiesta IN ('moto_nuova', 'moto_usata', 'servizio'));
        RAISE NOTICE 'Colonna "tipo_richiesta" aggiunta alla tabella "appuntamenti".';
    ELSE
        RAISE NOTICE 'Colonna "tipo_richiesta" esiste già. Aggiorno constraint se necessario.';
        BEGIN
            ALTER TABLE appuntamenti DROP CONSTRAINT IF EXISTS appuntamenti_tipo_richiesta_check;
            ALTER TABLE appuntamenti ADD CONSTRAINT appuntamenti_tipo_richiesta_check 
                CHECK (tipo_richiesta IN ('moto_nuova', 'moto_usata', 'servizio'));
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Constraint già corretto.';
        END;
    END IF;

    -- 3. Rendi moto_id nullable e aggiungi se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'moto_id'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN moto_id VARCHAR(255);
        RAISE NOTICE 'Colonna "moto_id" aggiunta alla tabella "appuntamenti".';
    ELSE
        -- Rendi nullable se non lo è già
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'appuntamenti' 
            AND column_name = 'moto_id' 
            AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE appuntamenti ALTER COLUMN moto_id DROP NOT NULL;
            RAISE NOTICE 'Colonna "moto_id" resa nullable.';
        END IF;
    END IF;

    -- 4. Aggiungi moto_usata_id se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'moto_usata_id'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN moto_usata_id UUID REFERENCES moto_usate(id) ON DELETE CASCADE;
        RAISE NOTICE 'Colonna "moto_usata_id" aggiunta alla tabella "appuntamenti".';
    ELSE
        RAISE NOTICE 'Colonna "moto_usata_id" esiste già.';
    END IF;

    -- 5. Aggiungi servizio_concessionario_id se non esiste (sostituisce campo servizio stringa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'servizio_concessionario_id'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN servizio_concessionario_id UUID REFERENCES servizi_concessionari(id) ON DELETE CASCADE;
        RAISE NOTICE 'Colonna "servizio_concessionario_id" aggiunta alla tabella "appuntamenti".';
    ELSE
        RAISE NOTICE 'Colonna "servizio_concessionario_id" esiste già.';
    END IF;

    -- 6. Mantieni campo servizio per retrocompatibilità (se esiste già, lo lasciamo)
    -- Se non esiste, non lo creiamo (useremo servizio_concessionario_id)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'servizio'
    ) THEN
        RAISE NOTICE 'Campo "servizio" (stringa) esiste già. Mantenuto per retrocompatibilità.';
    END IF;

    -- 7. Aggiungi lead_id se non esiste (collegamento a lead)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'lead_id'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN lead_id UUID REFERENCES lead(id) ON DELETE SET NULL;
        RAISE NOTICE 'Colonna "lead_id" aggiunta alla tabella "appuntamenti".';
    ELSE
        RAISE NOTICE 'Colonna "lead_id" esiste già.';
    END IF;

    -- 8. Aggiungi conversazione_id se non esiste (collegamento a conversazioni)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'conversazione_id'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN conversazione_id UUID REFERENCES conversazioni(id) ON DELETE SET NULL;
        RAISE NOTICE 'Colonna "conversazione_id" aggiunta alla tabella "appuntamenti".';
    ELSE
        RAISE NOTICE 'Colonna "conversazione_id" esiste già.';
    END IF;

    -- 9. Aggiungi campi moto_marca e moto_modello se non esistono (generici)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'moto_marca'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN moto_marca VARCHAR(255);
        RAISE NOTICE 'Colonna "moto_marca" aggiunta.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'moto_modello'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN moto_modello VARCHAR(255);
        RAISE NOTICE 'Colonna "moto_modello" aggiunta.';
    END IF;

    -- 10. Assicurati che i campi cliente_* esistano (per compatibilità con lead)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'cliente_nome'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN cliente_nome VARCHAR(255);
        RAISE NOTICE 'Colonna "cliente_nome" aggiunta.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'cliente_email'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN cliente_email VARCHAR(255);
        RAISE NOTICE 'Colonna "cliente_email" aggiunta.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'cliente_telefono'
    ) THEN
        ALTER TABLE appuntamenti ADD COLUMN cliente_telefono VARCHAR(50);
        RAISE NOTICE 'Colonna "cliente_telefono" aggiunta.';
    END IF;

    -- 11. Assicurati che il campo stato esista e abbia i valori corretti
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appuntamenti' AND column_name = 'stato'
    ) THEN
        -- Verifica/aggiorna il constraint
        BEGIN
            ALTER TABLE appuntamenti DROP CONSTRAINT IF EXISTS appuntamenti_stato_check;
            ALTER TABLE appuntamenti ADD CONSTRAINT appuntamenti_stato_check 
                CHECK (stato IN ('pending', 'confirmed', 'completed', 'cancelled'));
            RAISE NOTICE 'Constraint "stato" verificato/aggiornato.';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Errore aggiornamento constraint stato: %', SQLERRM;
        END;
    ELSE
        ALTER TABLE appuntamenti ADD COLUMN stato VARCHAR(20) DEFAULT 'pending';
        ALTER TABLE appuntamenti ADD CONSTRAINT appuntamenti_stato_check 
            CHECK (stato IN ('pending', 'confirmed', 'completed', 'cancelled'));
        RAISE NOTICE 'Colonna "stato" aggiunta.';
    END IF;

    RAISE NOTICE '✅ Estensione tabella APPOINTMENTI completata con successo!';

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
WHERE table_name = 'appuntamenti'
ORDER BY ordinal_position;











