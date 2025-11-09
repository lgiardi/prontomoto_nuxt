-- Aggiungi campo foto_gallery alla tabella moto_usate
ALTER TABLE moto_usate ADD COLUMN IF NOT EXISTS foto_gallery JSONB DEFAULT '[]'::jsonb;

-- Aggiungi campo immagine_copertina se non esiste
ALTER TABLE moto_usate ADD COLUMN IF NOT EXISTS immagine_copertina TEXT;

-- Migra i dati esistenti dal campo foto ai nuovi campi
UPDATE moto_usate 
SET 
  immagine_copertina = CASE 
    WHEN foto IS NOT NULL AND jsonb_array_length(foto) > 0 
    THEN foto->>0 
    ELSE NULL 
  END,
  foto_gallery = CASE 
    WHEN foto IS NOT NULL AND jsonb_array_length(foto) > 1 
    THEN foto->1 
    ELSE '[]'::jsonb 
  END
WHERE immagine_copertina IS NULL;
