-- =====================================================================
-- SCRIPT PARA OBTER O SCHEMA DAS TABELAS DO BANCO DE DADOS (SUPABASE)
-- =====================================================================
--
-- Instruções:
-- 1. Abra o painel do seu Supabase (https://supabase.com/dashboard)
-- 2. Vá em "SQL Editor" no menu lateral esquerdo
-- 3. Clique em "New Query" (Nova Consulta)
-- 4. Cole este código abaixo e clique em "Run" (Executar)
-- 5. Copie os resultados gerados e cole aqui no chat para mim!

SELECT 
    t.table_name AS "Tabela",
    c.column_name AS "Coluna",
    CASE 
        WHEN c.data_type = 'character varying' THEN 'varchar(' || c.character_maximum_length || ')'
        WHEN c.data_type = 'numeric' AND c.numeric_precision IS NOT NULL THEN 'numeric(' || c.numeric_precision || ',' || c.numeric_scale || ')'
        ELSE c.data_type
    END AS "Tipo de Dado",
    c.is_nullable AS "Aceita Nulo?",
    c.column_default AS "Valor Padrão"
FROM 
    information_schema.tables t
INNER JOIN 
    information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE 
    t.table_schema = 'public'
ORDER BY 
    t.table_name, c.ordinal_position;
