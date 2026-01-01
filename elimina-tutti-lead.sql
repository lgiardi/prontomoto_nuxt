-- Script per eliminare tutti i lead dal database tranne quello con email marketing@palatifini.it
-- ATTENZIONE: Questa operazione è irreversibile!

-- Elimina tutti i lead tranne quello con email marketing@palatifini.it
DELETE FROM lead 
WHERE email_cliente != 'marketing@palatifini.it' 
   OR email_cliente IS NULL;

-- Verifica quanti lead rimangono
SELECT COUNT(*) as lead_rimanenti FROM lead;

-- Mostra il lead rimasto
SELECT * FROM lead WHERE email_cliente = 'marketing@palatifini.it';

