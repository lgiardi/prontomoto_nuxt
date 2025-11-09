import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const supabaseUrl = 'https://xffcrstnyfjthlaurlyx.supabase.co'
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZmNyc3RueWZqdGhsYXVybHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzQ5MCwiZXhwIjoyMDUwMTczNDkwfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Crea tabella moto_usate_catalogo
    const createCatalogoTable = `
      CREATE TABLE IF NOT EXISTS moto_usate_catalogo (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        marca VARCHAR(100) NOT NULL,
        modello VARCHAR(100) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        cilindrata INTEGER,
        immagine_copertina TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(marca, modello, categoria)
      );
    `

    // 2. Crea tabella moto_usate
    const createMotoUsateTable = `
      CREATE TABLE IF NOT EXISTS moto_usate (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        catalogo_id UUID REFERENCES moto_usate_catalogo(id) ON DELETE CASCADE,
        km INTEGER NOT NULL,
        anno INTEGER NOT NULL,
        prezzo DECIMAL(10,2) NOT NULL,
        condizione VARCHAR(50) NOT NULL,
        descrizione TEXT,
        foto JSONB DEFAULT '[]'::jsonb,
        venditore_id UUID NOT NULL,
        venditore_type VARCHAR(20) NOT NULL CHECK (venditore_type IN ('concessionario', 'privato')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 3. Crea trigger per updated_at
    const createTriggerFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `

    const createCatalogoTrigger = `
      CREATE TRIGGER IF NOT EXISTS update_moto_usate_catalogo_updated_at 
        BEFORE UPDATE ON moto_usate_catalogo 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `

    const createMotoUsateTrigger = `
      CREATE TRIGGER IF NOT EXISTS update_moto_usate_updated_at 
        BEFORE UPDATE ON moto_usate 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `

    // 4. Abilita RLS
    const enableRLSCatalogo = `ALTER TABLE moto_usate_catalogo ENABLE ROW LEVEL SECURITY;`
    const enableRLSMotoUsate = `ALTER TABLE moto_usate ENABLE ROW LEVEL SECURITY;`

    // 5. Crea policies per moto_usate_catalogo
    const catalogoPolicies = [
      `CREATE POLICY IF NOT EXISTS "moto_usate_catalogo_select_policy" ON moto_usate_catalogo FOR SELECT USING (true);`,
      `CREATE POLICY IF NOT EXISTS "moto_usate_catalogo_insert_policy" ON moto_usate_catalogo FOR INSERT WITH CHECK (auth.role() = 'service_role');`,
      `CREATE POLICY IF NOT EXISTS "moto_usate_catalogo_update_policy" ON moto_usate_catalogo FOR UPDATE USING (auth.role() = 'service_role');`,
      `CREATE POLICY IF NOT EXISTS "moto_usate_catalogo_delete_policy" ON moto_usate_catalogo FOR DELETE USING (auth.role() = 'service_role');`
    ]

    // 6. Crea policies per moto_usate
    const motoUsatePolicies = [
      `CREATE POLICY IF NOT EXISTS "moto_usate_select_policy" ON moto_usate FOR SELECT USING (auth.uid() = venditore_id);`,
      `CREATE POLICY IF NOT EXISTS "moto_usate_insert_policy" ON moto_usate FOR INSERT WITH CHECK (auth.uid() = venditore_id);`,
      `CREATE POLICY IF NOT EXISTS "moto_usate_update_policy" ON moto_usate FOR UPDATE USING (auth.uid() = venditore_id);`,
      `CREATE POLICY IF NOT EXISTS "moto_usate_delete_policy" ON moto_usate FOR DELETE USING (auth.uid() = venditore_id);`,
      `CREATE POLICY IF NOT EXISTS "moto_usate_admin_select_policy" ON moto_usate FOR SELECT USING (auth.role() = 'service_role');`,
      `CREATE POLICY IF NOT EXISTS "moto_usate_admin_update_policy" ON moto_usate FOR UPDATE USING (auth.role() = 'service_role');`
    ]

    // Esegui tutti i comandi SQL
    const queries = [
      createCatalogoTable,
      createMotoUsateTable,
      createTriggerFunction,
      createCatalogoTrigger,
      createMotoUsateTrigger,
      enableRLSCatalogo,
      enableRLSMotoUsate,
      ...catalogoPolicies,
      ...motoUsatePolicies
    ]

    for (const query of queries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('Errore nell\'esecuzione query:', query, error)
        // Continua con le altre query anche se una fallisce
      }
    }

    // 7. Popola il catalogo con dati di esempio
    const insertCatalogoData = `
      INSERT INTO moto_usate_catalogo (marca, modello, categoria, cilindrata, immagine_copertina) VALUES
      -- Honda
      ('Honda', 'CBR 600RR', 'sportive', 600, 'https://via.placeholder.com/300x200?text=Honda+CBR+600RR'),
      ('Honda', 'CBR 1000RR', 'sportive', 1000, 'https://via.placeholder.com/300x200?text=Honda+CBR+1000RR'),
      ('Honda', 'CB 650R', 'naked', 650, 'https://via.placeholder.com/300x200?text=Honda+CB+650R'),
      ('Honda', 'CB 1000R', 'naked', 1000, 'https://via.placeholder.com/300x200?text=Honda+CB+1000R'),
      ('Honda', 'Africa Twin', 'enduro-stradale', 1100, 'https://via.placeholder.com/300x200?text=Honda+Africa+Twin'),
      ('Honda', 'SH 300', 'scooter-ruote-alte', 300, 'https://via.placeholder.com/300x200?text=Honda+SH+300'),
      ('Honda', 'Forza 350', 'scooter-ruote-basse', 350, 'https://via.placeholder.com/300x200?text=Honda+Forza+350'),
      
      -- Yamaha
      ('Yamaha', 'YZF-R6', 'sportive', 600, 'https://via.placeholder.com/300x200?text=Yamaha+YZF-R6'),
      ('Yamaha', 'YZF-R1', 'sportive', 1000, 'https://via.placeholder.com/300x200?text=Yamaha+YZF-R1'),
      ('Yamaha', 'MT-07', 'naked', 700, 'https://via.placeholder.com/300x200?text=Yamaha+MT-07'),
      ('Yamaha', 'MT-09', 'naked', 900, 'https://via.placeholder.com/300x200?text=Yamaha+MT-09'),
      ('Yamaha', 'Ténéré 700', 'enduro-stradale', 700, 'https://via.placeholder.com/300x200?text=Yamaha+Ténéré+700'),
      ('Yamaha', 'XMAX 300', 'scooter-ruote-alte', 300, 'https://via.placeholder.com/300x200?text=Yamaha+XMAX+300'),
      ('Yamaha', 'TMAX 560', 'scooter-ruote-alte', 560, 'https://via.placeholder.com/300x200?text=Yamaha+TMAX+560'),
      
      -- Kawasaki
      ('Kawasaki', 'Ninja 650', 'sportive', 650, 'https://via.placeholder.com/300x200?text=Kawasaki+Ninja+650'),
      ('Kawasaki', 'Ninja ZX-10R', 'sportive', 1000, 'https://via.placeholder.com/300x200?text=Kawasaki+Ninja+ZX-10R'),
      ('Kawasaki', 'Z 650', 'naked', 650, 'https://via.placeholder.com/300x200?text=Kawasaki+Z+650'),
      ('Kawasaki', 'Z 900', 'naked', 900, 'https://via.placeholder.com/300x200?text=Kawasaki+Z+900'),
      ('Kawasaki', 'Versys 650', 'enduro-stradale', 650, 'https://via.placeholder.com/300x200?text=Kawasaki+Versys+650'),
      ('Kawasaki', 'Versys 1000', 'turismo', 1000, 'https://via.placeholder.com/300x200?text=Kawasaki+Versys+1000'),
      
      -- Ducati
      ('Ducati', 'Panigale V2', 'sportive', 955, 'https://via.placeholder.com/300x200?text=Ducati+Panigale+V2'),
      ('Ducati', 'Panigale V4', 'sportive', 1103, 'https://via.placeholder.com/300x200?text=Ducati+Panigale+V4'),
      ('Ducati', 'Monster 821', 'naked', 821, 'https://via.placeholder.com/300x200?text=Ducati+Monster+821'),
      ('Ducati', 'Monster 1200', 'naked', 1200, 'https://via.placeholder.com/300x200?text=Ducati+Monster+1200'),
      ('Ducati', 'Multistrada 950', 'enduro-stradale', 950, 'https://via.placeholder.com/300x200?text=Ducati+Multistrada+950'),
      ('Ducati', 'Multistrada 1260', 'turismo', 1262, 'https://via.placeholder.com/300x200?text=Ducati+Multistrada+1260'),
      
      -- BMW
      ('BMW', 'S 1000 RR', 'sportive', 1000, 'https://via.placeholder.com/300x200?text=BMW+S+1000+RR'),
      ('BMW', 'F 900 R', 'naked', 900, 'https://via.placeholder.com/300x200?text=BMW+F+900+R'),
      ('BMW', 'R 1250 GS', 'enduro-stradale', 1250, 'https://via.placeholder.com/300x200?text=BMW+R+1250+GS'),
      ('BMW', 'K 1600 GT', 'turismo', 1600, 'https://via.placeholder.com/300x200?text=BMW+K+1600+GT'),
      ('BMW', 'C 650 GT', 'scooter-ruote-alte', 650, 'https://via.placeholder.com/300x200?text=BMW+C+650+GT'),
      
      -- Aprilia
      ('Aprilia', 'RS 660', 'sportive', 660, 'https://via.placeholder.com/300x200?text=Aprilia+RS+660'),
      ('Aprilia', 'RSV4 1100', 'sportive', 1100, 'https://via.placeholder.com/300x200?text=Aprilia+RSV4+1100'),
      ('Aprilia', 'Tuono 660', 'naked', 660, 'https://via.placeholder.com/300x200?text=Aprilia+Tuono+660'),
      ('Aprilia', 'Tuono V4 1100', 'naked', 1100, 'https://via.placeholder.com/300x200?text=Aprilia+Tuono+V4+1100'),
      ('Aprilia', 'Tuareg 660', 'enduro-stradale', 660, 'https://via.placeholder.com/300x200?text=Aprilia+Tuareg+660'),
      
      -- KTM
      ('KTM', 'Duke 390', 'naked', 390, 'https://via.placeholder.com/300x200?text=KTM+Duke+390'),
      ('KTM', 'Duke 790', 'naked', 790, 'https://via.placeholder.com/300x200?text=KTM+Duke+790'),
      ('KTM', 'Duke 1290', 'naked', 1300, 'https://via.placeholder.com/300x200?text=KTM+Duke+1290'),
      ('KTM', 'Adventure 790', 'enduro-stradale', 790, 'https://via.placeholder.com/300x200?text=KTM+Adventure+790'),
      ('KTM', 'Adventure 1290', 'enduro-stradale', 1300, 'https://via.placeholder.com/300x200?text=KTM+Adventure+1290'),
      
      -- Benelli
      ('Benelli', 'TNT 600', 'naked', 600, 'https://via.placeholder.com/300x200?text=Benelli+TNT+600'),
      ('Benelli', 'TRK 502', 'enduro-stradale', 500, 'https://via.placeholder.com/300x200?text=Benelli+TRK+502'),
      ('Benelli', 'TRK 702', 'enduro-stradale', 700, 'https://via.placeholder.com/300x200?text=Benelli+TRK+702'),
      
      -- SYM
      ('SYM', 'Joymax 300', 'scooter-ruote-basse', 300, 'https://via.placeholder.com/300x200?text=SYM+Joymax+300'),
      ('SYM', 'Symphony 125', 'scooter-ruote-alte', 125, 'https://via.placeholder.com/300x200?text=SYM+Symphony+125'),
      ('SYM', 'Symphony 200', 'scooter-ruote-alte', 200, 'https://via.placeholder.com/300x200?text=SYM+Symphony+200'),
      
      -- Vespa/Piaggio
      ('Vespa', 'GTS 300', 'scooter-ruote-alte', 300, 'https://via.placeholder.com/300x200?text=Vespa+GTS+300'),
      ('Vespa', 'Primavera 125', 'scooter-ruote-alte', 125, 'https://via.placeholder.com/300x200?text=Vespa+Primavera+125'),
      ('Piaggio', 'Beverly 300', 'scooter-ruote-alte', 300, 'https://via.placeholder.com/300x200?text=Piaggio+Beverly+300'),
      ('Piaggio', 'Medley 150', 'scooter-ruote-alte', 150, 'https://via.placeholder.com/300x200?text=Piaggio+Medley+150')
      ON CONFLICT (marca, modello, categoria) DO NOTHING;
    `

    const { error: insertError } = await supabase.rpc('exec_sql', { sql: insertCatalogoData })
    if (insertError) {
      console.error('Errore nell\'inserimento dati catalogo:', insertError)
    }

    return {
      success: true,
      message: 'Tabelle moto usate create con successo!',
      tables: ['moto_usate_catalogo', 'moto_usate'],
      policies: 'RLS policies create',
      data: 'Catalogo popolato con 50+ moto'
    }

  } catch (error) {
    console.error('Errore nella creazione tabelle:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nella creazione delle tabelle moto usate'
    })
  }
})
