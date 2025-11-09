-- Script SQL per aggiungere campo foto alla tabella servizi_concessionari
-- Esegui questo script nel SQL Editor di Supabase

-- Aggiungi campo foto come JSONB se non esiste
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'servizi_concessionari' AND column_name = 'foto'
  ) THEN
    ALTER TABLE servizi_concessionari ADD COLUMN foto JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Campo foto aggiunto alla tabella servizi_concessionari';
  ELSE
    RAISE NOTICE 'Campo foto già esistente nella tabella servizi_concessionari';
  END IF;
END $$;

-- Verifica che il campo sia stato aggiunto
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'servizi_concessionari' 
  AND column_name IN ('foto', 'immagine_url')
ORDER BY column_name;







