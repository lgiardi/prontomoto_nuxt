-- Creazione tabella catalogo moto usate
CREATE TABLE moto_usate_catalogo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,
  modello VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creazione tabella moto usate
CREATE TABLE moto_usate (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogo_id UUID REFERENCES moto_usate_catalogo(id) ON DELETE RESTRICT,
  -- Dati specifici usato (inseriti manualmente)
  km INTEGER NOT NULL,
  anno INTEGER NOT NULL,
  prezzo DECIMAL(10,2) NOT NULL,
  condizione VARCHAR(50) NOT NULL CHECK (condizione IN ('ottima', 'buona', 'discreta', 'da-ristrutturare')),
  descrizione TEXT,
  foto JSONB DEFAULT '[]'::jsonb,
  -- Dati venditore
  venditore_id UUID NOT NULL,
  venditore_type VARCHAR(20) NOT NULL CHECK (venditore_type IN ('concessionario', 'privato')),
  -- Status approvazione
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger per aggiornare 'updated_at'
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_moto_usate_catalogo_timestamp
BEFORE UPDATE ON moto_usate_catalogo
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_moto_usate_timestamp
BEFORE UPDATE ON moto_usate
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- RLS Policies for moto_usate_catalogo (read-only for all)
ALTER TABLE moto_usate_catalogo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON moto_usate_catalogo FOR SELECT USING (TRUE);

-- RLS Policies for moto_usate
ALTER TABLE moto_usate ENABLE ROW LEVEL SECURITY;

-- Concessionari can insert, select, update, delete their own used motos
CREATE POLICY "Concessionari can manage their own used motos" ON moto_usate
FOR ALL
USING (venditore_id = auth.uid())
WITH CHECK (venditore_id = auth.uid() AND venditore_type = 'concessionario');

-- Privati can insert, select, update, delete their own used motos (status pending/rejected)
CREATE POLICY "Privati can manage their own used motos" ON moto_usate
FOR ALL
USING (venditore_id = auth.uid())
WITH CHECK (venditore_id = auth.uid() AND venditore_type = 'privato');

-- All users can read approved used motos
CREATE POLICY "Enable read access for approved used motos" ON moto_usate
FOR SELECT
USING (status = 'approved');

-- Inserimento dati iniziali nel catalogo
INSERT INTO moto_usate_catalogo (marca, modello) VALUES
('Honda', 'CBR 600RR'),
('Honda', 'CBR 1000RR'),
('Honda', 'CB 650R'),
('Honda', 'CB 1000R'),
('Honda', 'Africa Twin'),
('Honda', 'CRF 450L'),
('Yamaha', 'YZF-R1'),
('Yamaha', 'YZF-R6'),
('Yamaha', 'MT-07'),
('Yamaha', 'MT-09'),
('Yamaha', 'MT-10'),
('Yamaha', 'Ténéré 700'),
('Kawasaki', 'Ninja ZX-10R'),
('Kawasaki', 'Ninja ZX-6R'),
('Kawasaki', 'Z 900'),
('Kawasaki', 'Z 1000'),
('Kawasaki', 'Versys 1000'),
('Kawasaki', 'KLR 650'),
('Suzuki', 'GSX-R1000'),
('Suzuki', 'GSX-R600'),
('Suzuki', 'GSX-S1000'),
('Suzuki', 'V-Strom 1000'),
('Suzuki', 'DR-Z400'),
('Ducati', 'Panigale V4'),
('Ducati', 'Monster 821'),
('Ducati', 'Multistrada 1260'),
('Ducati', 'Scrambler 1100'),
('BMW', 'S 1000 RR'),
('BMW', 'R 1250 GS'),
('BMW', 'F 850 GS'),
('BMW', 'K 1600 GT'),
('Aprilia', 'RSV4 1100'),
('Aprilia', 'Tuono V4'),
('Aprilia', 'Shiver 900'),
('KTM', '1290 Super Duke R'),
('KTM', '890 Duke R'),
('KTM', '1290 Super Adventure'),
('KTM', '390 Duke'),
('Triumph', 'Speed Triple 1200'),
('Triumph', 'Street Triple 765'),
('Triumph', 'Tiger 1200'),
('Triumph', 'Bonneville T120');
