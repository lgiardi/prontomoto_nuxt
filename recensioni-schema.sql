-- ============================================
-- SCHEMA RECENSIONI - ProntoMoto
-- ============================================
-- Tabella per le recensioni dei concessionari

CREATE TABLE IF NOT EXISTS recensioni_concessionari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  concessionario_id UUID REFERENCES concessionari(id) ON DELETE CASCADE NOT NULL,
  utente_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Opzionale, può essere anonimo
  nome_utente VARCHAR(255) NOT NULL, -- Nome del recensore (può essere anonimo)
  email_utente VARCHAR(255), -- Email del recensore (opzionale)
  voto INTEGER NOT NULL CHECK (voto >= 1 AND voto <= 5), -- Voto da 1 a 5 stelle
  titolo VARCHAR(255), -- Titolo della recensione (opzionale)
  commento TEXT, -- Testo della recensione (opzionale)
  verificata BOOLEAN DEFAULT false, -- Se la recensione è verificata (acquisto effettivo)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')), -- Moderazione
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice per performance sulle query per concessionario
CREATE INDEX IF NOT EXISTS idx_recensioni_concessionario_id ON recensioni_concessionari(concessionario_id);
CREATE INDEX IF NOT EXISTS idx_recensioni_status ON recensioni_concessionari(status);
CREATE INDEX IF NOT EXISTS idx_recensioni_created_at ON recensioni_concessionari(created_at DESC);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_recensioni_updated_at 
BEFORE UPDATE ON recensioni_concessionari 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Funzione per calcolare il rating medio di un concessionario
CREATE OR REPLACE FUNCTION get_concessionario_rating(concessionario_uuid UUID)
RETURNS TABLE (
  rating_medio NUMERIC,
  numero_recensioni BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(voto)::NUMERIC, 1), 0) as rating_medio,
    COUNT(*)::BIGINT as numero_recensioni
  FROM recensioni_concessionari
  WHERE concessionario_id = concessionario_uuid
    AND status = 'approved';
END;
$$ LANGUAGE plpgsql;

