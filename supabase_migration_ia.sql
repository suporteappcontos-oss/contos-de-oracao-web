-- ─────────────────────────────────────────────────────────────────────
-- TABELAS PARA A CONFIGURAÇÃO DINÂMICA DA IA (WHATSAPP AGENT)
-- ─────────────────────────────────────────────────────────────────────

-- 1. Histórico de Conversas (Memória do Atendente)
CREATE TABLE IF NOT EXISTS public.whatsapp_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_phone VARCHAR(50) NOT NULL,
    author VARCHAR(20) CHECK (author IN ('user', 'assistant')) NOT NULL,
    message_text TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_chat_history ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para o Histórico
DROP POLICY IF EXISTS "Leitura de histórico para admins" ON public.whatsapp_chat_history;
CREATE POLICY "Leitura de histórico para admins"
    ON public.whatsapp_chat_history FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
        OR auth.jwt()->>'email' = 'suporte.appcontos@gmail.com'
    );

DROP POLICY IF EXISTS "Permitir inserções públicas no histórico" ON public.whatsapp_chat_history;
CREATE POLICY "Permitir inserções públicas no histórico"
    ON public.whatsapp_chat_history FOR INSERT
    WITH CHECK (true);


-- 2. Configurações Globais da IA (Prompt, Modelo, Temperatura)
CREATE TABLE IF NOT EXISTS public.ia_configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave VARCHAR(50) UNIQUE NOT NULL,
    prompt_sistema TEXT NOT NULL,
    modelo_ia VARCHAR(50) DEFAULT 'gemini-1.5-flash' NOT NULL,
    temperatura NUMERIC(3,2) DEFAULT 0.30 NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.ia_configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Configurações
DROP POLICY IF EXISTS "Leitura de configurações da IA" ON public.ia_configuracoes;
CREATE POLICY "Leitura de configurações da IA"
    ON public.ia_configuracoes FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
        OR auth.jwt()->>'email' = 'suporte.appcontos@gmail.com'
    );

DROP POLICY IF EXISTS "Escrita de configurações da IA para admins" ON public.ia_configuracoes;
CREATE POLICY "Escrita de configurações da IA para admins"
    ON public.ia_configuracoes FOR ALL
    TO authenticated
    USING (
        (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
        OR auth.jwt()->>'email' = 'suporte.appcontos@gmail.com'
    );

-- Inserir registro inicial se não existir
INSERT INTO public.ia_configuracoes (chave, prompt_sistema, modelo_ia, temperatura)
VALUES (
    'whatsapp_atendente',
    'Você é o atendente de vendas virtual e suporte do Contos de Oração (plataforma católica infantil). Seu tom de voz é alegre, muito católico, educado e acolhedor. Responda sempre de forma curta (máximo 2 a 3 parágrafos) e humanizada. Use emojis católicos (🙏, ✨, ⛪, 👼).',
    'gemini-1.5-flash',
    0.25
) ON CONFLICT (chave) DO NOTHING;


-- 3. Base de Conhecimento da IA (Dúvidas frequentes, Links, FAQs)
CREATE TABLE IF NOT EXISTS public.ia_base_conhecimento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR(50) NOT NULL,
    pergunta VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.ia_base_conhecimento ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Base de Conhecimento
DROP POLICY IF EXISTS "Leitura de base de conhecimento da IA" ON public.ia_base_conhecimento;
CREATE POLICY "Leitura de base de conhecimento da IA"
    ON public.ia_base_conhecimento FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
        OR auth.jwt()->>'email' = 'suporte.appcontos@gmail.com'
    );

DROP POLICY IF EXISTS "Escrita de base de conhecimento para admins" ON public.ia_base_conhecimento;
CREATE POLICY "Escrita de base de conhecimento para admins"
    ON public.ia_base_conhecimento FOR ALL
    TO authenticated
    USING (
        (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
        OR auth.jwt()->>'email' = 'suporte.appcontos@gmail.com'
    );

-- Inserir itens padrão de FAQ
INSERT INTO public.ia_base_conhecimento (categoria, pergunta, conteudo) VALUES
('Preços', 'Valores dos Planos', 'Plano Anual: R$ 197,00 (acesso total). Plano Mensal: R$ 29,90. Link de assinatura: contosdeoracao.com.br/planos'),
('Suporte', 'Como funciona o acesso?', 'O acesso é imediato após a confirmação do pagamento. O usuário recebe os dados por e-mail.'),
('Conteúdo', 'O que tem na plataforma?', 'Desenhos bíblicos, Histórias em Quadrinhos católicas, atividades infantis e materiais pedagógicos para catequese.')
ON CONFLICT DO NOTHING;
