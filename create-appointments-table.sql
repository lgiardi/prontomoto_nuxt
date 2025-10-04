-- Tabella per gli appuntamenti
CREATE TABLE IF NOT EXISTS appuntamenti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dati utente
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  note TEXT,
  
  -- Dati appuntamento
  data_appuntamento DATE NOT NULL,
  orario_appuntamento TIME NOT NULL,
  stato VARCHAR(20) DEFAULT 'pending' CHECK (stato IN ('pending', 'confirmed', 'completed', 'cancelled')),
  
  -- Riferimenti
  concessionario_id UUID NOT NULL REFERENCES concessionari(id) ON DELETE CASCADE,
  moto_id VARCHAR(100), -- ID della moto da Sanity
  servizio VARCHAR(100), -- Tipo di servizio (es. "Benelli TRK 702")
  
  -- Metadati
  ip_address INET,
  user_agent TEXT,
  
  -- Indici
  UNIQUE(concessionario_id, data_appuntamento, orario_appuntamento)
);

-- Tabella per gli slot disponibili dei concessionari
CREATE TABLE IF NOT EXISTS slot_disponibili (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  concessionario_id UUID NOT NULL REFERENCES concessionari(id) ON DELETE CASCADE,
  giorno_settimana INTEGER NOT NULL CHECK (giorno_settimana >= 0 AND giorno_settimana <= 6), -- 0=domenica, 1=lunedì, etc.
  orario_inizio TIME NOT NULL,
  orario_fine TIME NOT NULL,
  slot_durata INTEGER DEFAULT 60, -- durata slot in minuti
  attivo BOOLEAN DEFAULT true,
  
  UNIQUE(concessionario_id, giorno_settimana, orario_inizio)
);

-- Tabella per le eccezioni (giorni di chiusura, ferie, etc.)
CREATE TABLE IF NOT EXISTS eccezioni_slot (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  concessionario_id UUID NOT NULL REFERENCES concessionari(id) ON DELETE CASCADE,
  data_inizio DATE NOT NULL,
  data_fine DATE NOT NULL,
  motivo VARCHAR(255),
  attivo BOOLEAN DEFAULT true
);

-- Inserisci slot predefiniti per i concessionari esistenti
INSERT INTO slot_disponibili (concessionario_id, giorno_settimana, orario_inizio, orario_fine, slot_durata)
SELECT 
  c.id,
  gs.giorno,
  '09:00'::TIME,
  '18:00'::TIME,
  60
FROM concessionari c
CROSS JOIN (
  SELECT 1 as giorno UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) gs
WHERE NOT EXISTS (
  SELECT 1 FROM slot_disponibili s 
  WHERE s.concessionario_id = c.id 
  AND s.giorno_settimana = gs.giorno
);

-- Funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_appuntamenti_updated_at 
  BEFORE UPDATE ON appuntamenti 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slot_disponibili_updated_at 
  BEFORE UPDATE ON slot_disponibili 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indici per performance
CREATE INDEX idx_appuntamenti_concessionario ON appuntamenti(concessionario_id);
CREATE INDEX idx_appuntamenti_data ON appuntamenti(data_appuntamento);
CREATE INDEX idx_appuntamenti_stato ON appuntamenti(stato);
CREATE INDEX idx_slot_concessionario ON slot_disponibili(concessionario_id);
CREATE INDEX idx_eccezioni_concessionario ON eccezioni_slot(concessionario_id);

-- RLS (Row Level Security)
ALTER TABLE appuntamenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_disponibili ENABLE ROW LEVEL SECURITY;
ALTER TABLE eccezioni_slot ENABLE ROW LEVEL SECURITY;

-- Policy per appuntamenti (concessionari possono vedere solo i loro)
CREATE POLICY "Concessionari possono vedere i propri appuntamenti" ON appuntamenti
  FOR ALL USING (concessionario_id IN (
    SELECT id FROM concessionari WHERE id = auth.uid()
  ));

-- Policy per slot (concessionari possono gestire solo i propri)
CREATE POLICY "Concessionari possono gestire i propri slot" ON slot_disponibili
  FOR ALL USING (concessionario_id IN (
    SELECT id FROM concessionari WHERE id = auth.uid()
  ));

-- Policy per eccezioni (concessionari possono gestire solo le proprie)
CREATE POLICY "Concessionari possono gestire le proprie eccezioni" ON eccezioni_slot
  FOR ALL USING (concessionario_id IN (
    SELECT id FROM concessionari WHERE id = auth.uid()
  ));
