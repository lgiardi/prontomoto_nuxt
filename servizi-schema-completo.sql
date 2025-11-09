-- ============================================
-- SCHEMA DATABASE SERVIZI - ProntoMoto
-- ============================================
-- Esegui questi comandi nel SQL Editor di Supabase

-- ============================================
-- 1. TABELLA SERVIZI_CATALOGO
-- ============================================
-- Servizi predefiniti dall'admin (come moto_usate_catalogo)

CREATE TABLE IF NOT EXISTS servizi_catalogo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  categoria VARCHAR(100) NOT NULL,
  descrizione_breve TEXT,
  icona VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. TABELLA SERVIZI_CONCESSIONARI
-- ============================================
-- Servizi offerti dai singoli concessionari

CREATE TABLE IF NOT EXISTS servizi_concessionari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  servizio_catalogo_id UUID REFERENCES servizi_catalogo(id) ON DELETE CASCADE NOT NULL,
  concessionario_id UUID REFERENCES concessionari(id) ON DELETE CASCADE NOT NULL,
  
  -- Dati base (SEMPLIFICATI per ora)
  prezzo_da DECIMAL(10,2) NOT NULL,
  prezzo_a DECIMAL(10,2),
  durata_minuti INTEGER,
  descrizione TEXT,
  disponibile BOOLEAN DEFAULT true,
  
  -- Immagine singola per ora
  immagine_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: un concessionario può offrire lo stesso servizio una sola volta
  UNIQUE(servizio_catalogo_id, concessionario_id)
);

-- ============================================
-- 3. ESTENSIONE TABELLA CONVERSAZIONI
-- ============================================
-- Aggiunge supporto per servizi al sistema conversazioni esistente

-- Aggiungi servizio_concessionario_id se non esiste
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversazioni' AND column_name = 'servizio_concessionario_id'
  ) THEN
    ALTER TABLE conversazioni ADD COLUMN servizio_concessionario_id UUID REFERENCES servizi_concessionari(id) ON DELETE CASCADE;
  END IF;

  -- Aggiungi tipo_richiesta se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversazioni' AND column_name = 'tipo_richiesta'
  ) THEN
    ALTER TABLE conversazioni ADD COLUMN tipo_richiesta VARCHAR(20) DEFAULT 'moto_nuova' CHECK (tipo_richiesta IN ('moto_nuova', 'moto_usata', 'servizio'));
  END IF;
END $$;

-- ============================================
-- 4. TRIGGER PER UPDATED_AT
-- ============================================

-- Trigger per servizi_catalogo
DROP TRIGGER IF EXISTS update_servizi_catalogo_updated_at ON servizi_catalogo;
CREATE TRIGGER update_servizi_catalogo_updated_at 
  BEFORE UPDATE ON servizi_catalogo 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger per servizi_concessionari
DROP TRIGGER IF EXISTS update_servizi_concessionari_updated_at ON servizi_concessionari;
CREATE TRIGGER update_servizi_concessionari_updated_at 
  BEFORE UPDATE ON servizi_concessionari 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. RLS (ROW LEVEL SECURITY)
-- ============================================

-- Abilita RLS
ALTER TABLE servizi_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE servizi_concessionari ENABLE ROW LEVEL SECURITY;

-- SERVIZI_CATALOGO: Lettura pubblica, scrittura solo admin
DROP POLICY IF EXISTS "Servizi catalogo visibili a tutti" ON servizi_catalogo;
CREATE POLICY "Servizi catalogo visibili a tutti" 
  ON servizi_catalogo FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Solo admin può modificare catalogo servizi" ON servizi_catalogo;
CREATE POLICY "Solo admin può modificare catalogo servizi" 
  ON servizi_catalogo FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- SERVIZI_CONCESSIONARI: Lettura pubblica, scrittura solo owner
DROP POLICY IF EXISTS "Servizi concessionari visibili a tutti" ON servizi_concessionari;
CREATE POLICY "Servizi concessionari visibili a tutti" 
  ON servizi_concessionari FOR SELECT 
  USING (disponibile = true OR concessionario_id = auth.uid());

DROP POLICY IF EXISTS "Concessionari possono inserire propri servizi" ON servizi_concessionari;
CREATE POLICY "Concessionari possono inserire propri servizi" 
  ON servizi_concessionari FOR INSERT 
  WITH CHECK (concessionario_id = auth.uid());

DROP POLICY IF EXISTS "Concessionari possono modificare propri servizi" ON servizi_concessionari;
CREATE POLICY "Concessionari possono modificare propri servizi" 
  ON servizi_concessionari FOR UPDATE 
  USING (concessionario_id = auth.uid());

DROP POLICY IF EXISTS "Concessionari possono eliminare propri servizi" ON servizi_concessionari;
CREATE POLICY "Concessionari possono eliminare propri servizi" 
  ON servizi_concessionari FOR DELETE 
  USING (concessionario_id = auth.uid());

-- ============================================
-- 6. INDICI PER PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_servizi_concessionari_catalogo ON servizi_concessionari(servizio_catalogo_id);
CREATE INDEX IF NOT EXISTS idx_servizi_concessionari_dealer ON servizi_concessionari(concessionario_id);
CREATE INDEX IF NOT EXISTS idx_servizi_concessionari_disponibile ON servizi_concessionari(disponibile);
CREATE INDEX IF NOT EXISTS idx_servizi_catalogo_slug ON servizi_catalogo(slug);
CREATE INDEX IF NOT EXISTS idx_servizi_catalogo_categoria ON servizi_catalogo(categoria);
CREATE INDEX IF NOT EXISTS idx_conversazioni_servizio ON conversazioni(servizio_concessionario_id) WHERE servizio_concessionario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversazioni_tipo ON conversazioni(tipo_richiesta);

-- ============================================
-- 7. DATI INIZIALI
-- ============================================
-- Inserisci servizi predefiniti

INSERT INTO servizi_catalogo (nome, slug, categoria, descrizione_breve, icona) VALUES
  ('Tagliando', 'tagliando', 'Manutenzione', 'Tagliando completo con cambio olio, filtri e controlli generali', '🔧'),
  ('Manutenzione Ordinaria', 'manutenzione-ordinaria', 'Manutenzione', 'Manutenzione periodica programmata secondo libretto', '⚙️'),
  ('Riparazione Meccanica', 'riparazione-meccanica', 'Riparazione', 'Diagnosi e riparazione guasti meccanici', '🔨'),
  ('Riparazione Carrozzeria', 'riparazione-carrozzeria', 'Riparazione', 'Riparazione danni carrozzeria e verniciatura', '🎨'),
  ('Revisione Tecnica', 'revisione-tecnica', 'Revisione', 'Revisione obbligatoria con certificazione', '📋'),
  ('Cambio Gomme', 'cambio-gomme', 'Pneumatici', 'Sostituzione pneumatici con bilanciatura', '🛞'),
  ('Lavaggio e Lucidatura', 'lavaggio-lucidatura', 'Estetica', 'Lavaggio completo e lucidatura professionale', '✨'),
  ('Sostituzione Batteria', 'sostituzione-batteria', 'Manutenzione', 'Sostituzione batteria con smaltimento vecchia', '🔋'),
  ('Controllo Freni', 'controllo-freni', 'Sicurezza', 'Controllo e sostituzione pastiglie/dischi freno', '🛑'),
  ('Preparazione Invernale', 'preparazione-invernale', 'Manutenzione', 'Preparazione moto per rimessaggio invernale', '❄️')
ON CONFLICT (slug) DO NOTHING;
