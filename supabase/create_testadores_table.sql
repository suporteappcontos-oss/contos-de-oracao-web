-- Criação da tabela de testadores da Play Store
CREATE TABLE IF NOT EXISTS public.testadores_playstore (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    whatsapp VARCHAR(50) NOT NULL,
    modelo_tv VARCHAR(255) NOT NULL,
    aceitou_termos BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.testadores_playstore ENABLE ROW LEVEL SECURITY;

-- Excluir políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir insercoes publicas" ON public.testadores_playstore;
DROP POLICY IF EXISTS "Permitir leitura apenas para admin" ON public.testadores_playstore;

-- Política de inserção pública (permite que qualquer visitante insira seu cadastro)
CREATE POLICY "Permitir insercoes publicas" 
ON public.testadores_playstore 
FOR INSERT 
WITH CHECK (true);

-- Política de leitura apenas para administradores/autenticados
CREATE POLICY "Permitir leitura apenas para admin" 
ON public.testadores_playstore 
FOR SELECT 
USING (auth.role() = 'authenticated');
