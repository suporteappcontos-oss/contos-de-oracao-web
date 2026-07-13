-- ─────────────────────────────────────────────────────────────────────
-- CRIAÇÃO DA TABELA DE LOGS DE ERROS DO WHATSAPP (WHATS AUTO)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.logs_automacoes_whatsapp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automacao_id UUID REFERENCES public.automacoes_whatsapp(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'erro',
    seguidor VARCHAR(255),
    comentario TEXT,
    resposta_enviada TEXT,
    detalhe_erro TEXT,
    resolvido BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.logs_automacoes_whatsapp ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DROP POLICY IF EXISTS "Leitura de logs de Whats para admins" ON public.logs_automacoes_whatsapp;
CREATE POLICY "Leitura de logs de Whats para admins" 
    ON public.logs_automacoes_whatsapp FOR SELECT 
    TO authenticated
    USING (
        (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
        OR auth.jwt()->>'email' = 'suporte.appcontos@gmail.com'
    );

DROP POLICY IF EXISTS "Permitir inserções públicas de logs de Whats" ON public.logs_automacoes_whatsapp;
CREATE POLICY "Permitir inserções públicas de logs de Whats" 
    ON public.logs_automacoes_whatsapp FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins alteram logs de Whats" ON public.logs_automacoes_whatsapp;
CREATE POLICY "Admins alteram logs de Whats" 
    ON public.logs_automacoes_whatsapp FOR ALL 
    TO authenticated
    USING (
        (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
        OR auth.jwt()->>'email' = 'suporte.appcontos@gmail.com'
    );
