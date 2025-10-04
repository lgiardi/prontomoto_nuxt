-- Script per aggiungere i campi mancanti alla tabella moto_concessionari
-- Esegui questo script nel SQL Editor di Supabase

-- Aggiungi i campi mancanti alla tabella moto_concessionari
ALTER TABLE moto_concessionari 
ADD COLUMN IF NOT EXISTS quantita INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS colore VARCHAR(100),
ADD COLUMN IF NOT EXISTS promozioni JSONB,
ADD COLUMN IF NOT EXISTS foto_principale TEXT,
ADD COLUMN IF NOT EXISTS foto_gallery JSONB,
ADD COLUMN IF NOT EXISTS note TEXT,
ADD COLUMN IF NOT EXISTS offerte_finanziamento JSONB,
ADD COLUMN IF NOT EXISTS tasso_interesse DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS durata_mesi INTEGER,
ADD COLUMN IF NOT EXISTS anticipo_percentuale DECIMAL(5,2);

-- Crea una tabella per le promozioni personalizzate
CREATE TABLE IF NOT EXISTS promozioni_concessionario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moto_concessionario_id UUID REFERENCES moto_concessionari(id) ON DELETE CASCADE,
  titolo VARCHAR(255) NOT NULL,
  prezzo DECIMAL(10,2),
  descrizione TEXT,
  attiva BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea una tabella per i colori predefiniti
CREATE TABLE IF NOT EXISTS colori_disponibili (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  codice_hex VARCHAR(7),
  categoria VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserisci i colori predefiniti per le moto
INSERT INTO colori_disponibili (nome, codice_hex, categoria) VALUES
('Nero', '#000000', 'Classico'),
('Bianco', '#FFFFFF', 'Classico'),
('Rosso', '#FF0000', 'Classico'),
('Blu', '#0000FF', 'Classico'),
('Verde', '#00FF00', 'Classico'),
('Giallo', '#FFFF00', 'Classico'),
('Arancione', '#FFA500', 'Classico'),
('Grigio', '#808080', 'Classico'),
('Argento', '#C0C0C0', 'Metallico'),
('Oro', '#FFD700', 'Metallico'),
('Bronzo', '#CD7F32', 'Metallico'),
('Rame', '#B87333', 'Metallico'),
('Nero Opaco', '#1C1C1C', 'Moderno'),
('Bianco Perla', '#F8F8FF', 'Moderno'),
('Rosso Ferrari', '#DC143C', 'Sportivo'),
('Blu Metallic', '#4682B4', 'Sportivo'),
('Verde Lime', '#32CD32', 'Sportivo'),
('Giallo Fluorescente', '#FFFF00', 'Sportivo'),
('Arancione Fluorescente', '#FF4500', 'Sportivo'),
('Rosa', '#FFC0CB', 'Femminile'),
('Viola', '#800080', 'Femminile'),
('Turchese', '#40E0D0', 'Femminile'),
('Marrone', '#8B4513', 'Naturale'),
('Beige', '#F5F5DC', 'Naturale'),
('Cammello', '#C19A6B', 'Naturale')
ON CONFLICT (nome) DO NOTHING;

-- Aggiungi commenti per documentare i campi
COMMENT ON COLUMN moto_concessionari.quantita IS 'Quantità disponibile di questa moto per il concessionario';
COMMENT ON COLUMN moto_concessionari.colore IS 'Colore selezionato dal concessionario per questa moto';
COMMENT ON COLUMN moto_concessionari.promozioni IS 'Promozioni attive per questa moto (JSON)';
COMMENT ON COLUMN moto_concessionari.foto_principale IS 'URL della foto principale del concessionario';
COMMENT ON COLUMN moto_concessionari.foto_gallery IS 'Array di URL delle foto del concessionario (JSON)';
COMMENT ON COLUMN moto_concessionari.note IS 'Note aggiuntive del concessionario';

-- Crea un indice per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_moto_concessionari_colore ON moto_concessionari(colore);
CREATE INDEX IF NOT EXISTS idx_moto_concessionari_quantita ON moto_concessionari(quantita);

-- Aggiorna le policy RLS per i nuovi campi
-- Le policy esistenti dovrebbero già coprire questi campi

-- Verifica che i campi siano stati aggiunti correttamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'moto_concessionari' 
AND column_name IN ('quantita', 'colore', 'promozioni', 'foto_principale', 'foto_gallery', 'note')
ORDER BY column_name;
