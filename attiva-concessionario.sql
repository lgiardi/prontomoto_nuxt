-- Script SQL per attivare il concessionario luca.giardina1980@gmail.com
-- Esegui questo script nel SQL Editor di Supabase

UPDATE concessionari
SET status = 'active'
WHERE email = 'luca.giardina1980@gmail.com';

-- Verifica l'aggiornamento
SELECT id, nome, email, status, updated_at
FROM concessionari
WHERE email = 'luca.giardina1980@gmail.com';
