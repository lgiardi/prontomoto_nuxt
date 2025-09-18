-- Schema per il database Supabase
-- Esegui questi comandi nel SQL Editor di Supabase

-- Tabella concessionari
CREATE TABLE IF NOT EXISTS concessionari (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(50),
  citta VARCHAR(100) NOT NULL,
  provincia VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella moto_concessionari (relazione many-to-many)
CREATE TABLE IF NOT EXISTS moto_concessionari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moto_id VARCHAR(255) NOT NULL, -- ID della moto da Sanity
  concessionario_id UUID REFERENCES concessionari(id) ON DELETE CASCADE,
  disponibile BOOLEAN DEFAULT true,
  prezzo_speciale DECIMAL(10,2),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(moto_id, concessionario_id)
);

-- Tabella lead (richieste di appuntamento)
CREATE TABLE IF NOT EXISTS lead (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  concessionario_id UUID REFERENCES concessionari(id) ON DELETE CASCADE,
  moto_id VARCHAR(255) NOT NULL,
  nome_cliente VARCHAR(255) NOT NULL,
  email_cliente VARCHAR(255) NOT NULL,
  telefono_cliente VARCHAR(50),
  messaggio TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella utenti (clienti finali)
CREATE TABLE IF NOT EXISTS utenti (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(50),
  citta_preferita VARCHAR(100),
  user_type VARCHAR(20) DEFAULT 'cliente' CHECK (user_type IN ('cliente', 'concessionario')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella preferiti utenti
CREATE TABLE IF NOT EXISTS preferiti_utenti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  utente_id UUID REFERENCES utenti(id) ON DELETE CASCADE,
  moto_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(utente_id, moto_id)
);

-- Tabella ricerche utenti
CREATE TABLE IF NOT EXISTS ricerche_utenti (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  utente_id UUID REFERENCES utenti(id) ON DELETE CASCADE,
  query_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
CREATE TRIGGER update_concessionari_updated_at BEFORE UPDATE ON concessionari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_moto_concessionari_updated_at BEFORE UPDATE ON moto_concessionari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_updated_at BEFORE UPDATE ON lead FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_utenti_updated_at BEFORE UPDATE ON utenti FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE concessionari ENABLE ROW LEVEL SECURITY;
ALTER TABLE moto_concessionari ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferiti_utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE ricerche_utenti ENABLE ROW LEVEL SECURITY;

-- Policy per concessionari (possono vedere solo i propri dati)
CREATE POLICY "Concessionari can view own data" ON concessionari
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Concessionari can update own data" ON concessionari
  FOR UPDATE USING (auth.uid() = id);

-- Policy per moto_concessionari
CREATE POLICY "Concessionari can manage own moto" ON moto_concessionari
  FOR ALL USING (auth.uid() = concessionario_id);

-- Policy per lead (concessionari vedono solo i propri lead)
CREATE POLICY "Concessionari can view own lead" ON lead
  FOR SELECT USING (auth.uid() = concessionario_id);

CREATE POLICY "Concessionari can update own lead" ON lead
  FOR UPDATE USING (auth.uid() = concessionario_id);

-- Policy per utenti (possono vedere solo i propri dati)
CREATE POLICY "Users can view own data" ON utenti
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON utenti
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON utenti
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy per preferiti_utenti
CREATE POLICY "Users can manage own favorites" ON preferiti_utenti
  FOR ALL USING (auth.uid() = utente_id);

-- Policy per ricerche_utenti
CREATE POLICY "Users can manage own searches" ON ricerche_utenti
  FOR ALL USING (auth.uid() = utente_id);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_concessionari_status ON concessionari(status);
CREATE INDEX IF NOT EXISTS idx_concessionari_citta ON concessionari(citta);
CREATE INDEX IF NOT EXISTS idx_moto_concessionari_concessionario ON moto_concessionari(concessionario_id);
CREATE INDEX IF NOT EXISTS idx_moto_concessionari_moto ON moto_concessionari(moto_id);
CREATE INDEX IF NOT EXISTS idx_lead_concessionario ON lead(concessionario_id);
CREATE INDEX IF NOT EXISTS idx_lead_status ON lead(status);
CREATE INDEX IF NOT EXISTS idx_lead_created_at ON lead(created_at);
CREATE INDEX IF NOT EXISTS idx_preferiti_utente ON preferiti_utenti(utente_id);
CREATE INDEX IF NOT EXISTS idx_ricerche_utente ON ricerche_utenti(utente_id);
CREATE INDEX IF NOT EXISTS idx_utenti_user_type ON utenti(user_type);



