-- Criação da tabela de automações do WhatsApp (Whats Auto)
CREATE TABLE IF NOT EXISTS public.automacoes_whatsapp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palavra_chave VARCHAR(255) DEFAULT '', -- Conexão com a regra do Instagram (pode ser vazia no fallback)
    mensagem_link TEXT NOT NULL DEFAULT 'Quero conhecer a Biblioteca', -- Texto do link wa.me
    prompt_ia TEXT NOT NULL, -- O Prompt do Gemini para essa regra
    link_vendas VARCHAR(255) DEFAULT '', -- Link de checkout
    ativo BOOLEAN DEFAULT TRUE,
    is_fallback BOOLEAN DEFAULT FALSE, -- Indica se é o prompt de suporte geral
    envios_sucesso INTEGER DEFAULT 0,
    envios_erro INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.automacoes_whatsapp ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (para o n8n ou o app carregarem as regras)
DROP POLICY IF EXISTS "Permitir leitura publica de automacoes_whatsapp" ON public.automacoes_whatsapp;
CREATE POLICY "Permitir leitura publica de automacoes_whatsapp" 
ON public.automacoes_whatsapp 
FOR SELECT 
USING (true);

-- Política de modificação apenas para administradores autenticados
DROP POLICY IF EXISTS "Permitir modificacoes apenas para admin em automacoes_whatsapp" ON public.automacoes_whatsapp;
CREATE POLICY "Permitir modificacoes apenas para admin em automacoes_whatsapp" 
ON public.automacoes_whatsapp 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Inserir a regra padrão de suporte (Fallback) inicial
INSERT INTO public.automacoes_whatsapp (palavra_chave, mensagem_link, prompt_ia, is_fallback)
VALUES (
    '', 
    'Suporte Geral', 
    'Você é o Gabriel, atendente de suporte da Contos de Oração. Fale de forma acolhedora e tire dúvidas gerais dos clientes sobre acesso.', 
    TRUE
) ON CONFLICT DO NOTHING;
