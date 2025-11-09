-- ============================================
-- SCRIPT DI VERIFICA STRUTTURA TABELLE
-- ============================================
-- Esegui questo script nel SQL Editor di Supabase
-- per verificare cosa esiste già nel database

-- 1. Verifica esistenza e struttura tabella LEAD
SELECT 
    'LEAD' as tabella,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'lead'
ORDER BY ordinal_position;

-- 2. Verifica esistenza e struttura tabella APPOINTMENTI
SELECT 
    'APPOINTMENTI' as tabella,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appuntamenti'
ORDER BY ordinal_position;

-- 3. Verifica esistenza e struttura tabella SLOT_DISPONIBILI
SELECT 
    'SLOT_DISPONIBILI' as tabella,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'slot_disponibili'
ORDER BY ordinal_position;

-- 4. Verifica esistenza e struttura tabella CONVERSAZIONI
SELECT 
    'CONVERSAZIONI' as tabella,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'conversazioni'
ORDER BY ordinal_position;

-- 5. Verifica esistenza e struttura tabella MESSAGGI
SELECT 
    'MESSAGGI' as tabella,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messaggi'
ORDER BY ordinal_position;

-- 6. Verifica Foreign Keys della tabella LEAD
SELECT
    'LEAD FOREIGN KEYS' as info,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'lead';

-- 7. Verifica Foreign Keys della tabella APPOINTMENTI
SELECT
    'APPOINTMENTI FOREIGN KEYS' as info,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'appuntamenti';

-- 8. Verifica CHECK Constraints per vedere valori permessi
SELECT
    'CHECK CONSTRAINTS' as info,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('lead', 'appuntamenti', 'conversazioni')
    AND tc.constraint_type = 'CHECK';

-- 9. Verifica se esistono le tabelle (conta righe se esistono)
SELECT 
    'ESISTENZA TABELLE' as info,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lead') THEN 'ESISTE' ELSE 'NON ESISTE' END as lead,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appuntamenti') THEN 'ESISTE' ELSE 'NON ESISTE' END as appuntamenti,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'slot_disponibili') THEN 'ESISTE' ELSE 'NON ESISTE' END as slot_disponibili,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversazioni') THEN 'ESISTE' ELSE 'NON ESISTE' END as conversazioni,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messaggi') THEN 'ESISTE' ELSE 'NON ESISTE' END as messaggi;

-- 10. Conta record esistenti (se le tabelle esistono)
SELECT 
    'CONTA RECORD' as info,
    (SELECT COUNT(*) FROM lead) as lead_count,
    (SELECT COUNT(*) FROM appuntamenti) as appuntamenti_count,
    (SELECT COUNT(*) FROM slot_disponibili) as slot_disponibili_count,
    (SELECT COUNT(*) FROM conversazioni) as conversazioni_count,
    (SELECT COUNT(*) FROM messaggi) as messaggi_count;







