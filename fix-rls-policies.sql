-- Fix per le RLS policies mancanti
-- Esegui questo nel SQL Editor di Supabase

-- Aggiungi la policy INSERT per concessionari
CREATE POLICY "Concessionari can insert own data" ON concessionari
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Aggiungi la policy INSERT per lead
CREATE POLICY "Concessionari can insert own lead" ON lead
  FOR INSERT WITH CHECK (auth.uid() = concessionario_id);

-- Verifica che le policies esistano
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('concessionari', 'utenti', 'lead', 'moto_concessionari', 'preferiti_utenti', 'ricerche_utenti')
ORDER BY tablename, policyname;



