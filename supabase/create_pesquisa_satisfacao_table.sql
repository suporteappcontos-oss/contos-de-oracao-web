-- Criação da tabela de pesquisa de satisfação
CREATE TABLE IF NOT EXISTS public.pesquisa_satisfacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telefone VARCHAR(50) NOT NULL,
    nome_cliente VARCHAR(255),
    nota VARCHAR(50) NOT NULL, -- 'nota_excelente', 'nota_bom', 'nota_regular'
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.pesquisa_satisfacao ENABLE ROW LEVEL SECURITY;

-- Política de inserção pública (permite inserções externas do webhook/n8n)
CREATE POLICY "Permitir insercoes publicas" 
ON public.pesquisa_satisfacao 
FOR INSERT 
WITH CHECK (true);

-- Política de leitura apenas para administradores/autenticados
CREATE POLICY "Permitir leitura apenas para admin" 
ON public.pesquisa_satisfacao 
FOR SELECT 
USING (auth.role() = 'authenticated');
