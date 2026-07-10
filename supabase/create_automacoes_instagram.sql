-- Criação da tabela de automações do Instagram
CREATE TABLE IF NOT EXISTS public.automacoes_instagram (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palavra_chave VARCHAR(255) NOT NULL,
    resposta TEXT NOT NULL,
    video_id VARCHAR(255) DEFAULT '', -- ID do post/vídeo no Instagram (opcional, se vazio aplica-se a qualquer post)
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.automacoes_instagram ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (para que o N8N ou qualquer cliente consuma as regras)
DROP POLICY IF EXISTS "Permitir leitura publica de automacoes" ON public.automacoes_instagram;
CREATE POLICY "Permitir leitura publica de automacoes" 
ON public.automacoes_instagram 
FOR SELECT 
USING (true);

-- Política de modificação apenas para administradores autenticados
DROP POLICY IF EXISTS "Permitir modificacoes apenas para admin" ON public.automacoes_instagram;
CREATE POLICY "Permitir modificacoes apenas para admin" 
ON public.automacoes_instagram 
FOR ALL 
USING (auth.role() = 'authenticated');
