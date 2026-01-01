-- ============================================
-- AGGIUNGI conversazione_id ALLA TABELLA LEAD
-- ============================================
-- Questo script aggiunge la colonna conversazione_id se non esiste

DO $$
BEGIN
    -- Aggiungi conversazione_id se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lead' AND column_name = 'conversazione_id'
    ) THEN
        ALTER TABLE lead ADD COLUMN conversazione_id UUID REFERENCES conversazioni(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Colonna "conversazione_id" aggiunta alla tabella "lead".';
    ELSE
        RAISE NOTICE 'ℹ️ Colonna "conversazione_id" esiste già nella tabella "lead".';
    END IF;
END $$;

-- Verifica
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'lead' 
AND column_name = 'conversazione_id';

