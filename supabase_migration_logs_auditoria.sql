-- ─────────────────────────────────────────────────────────────────────
-- CRIAÇÃO DA TABELA DE LOGS DE AUDITORIA DO ADMINISTRADOR
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.logs_auditoria_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    acao TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.logs_auditoria_admin ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DROP POLICY IF EXISTS "Leitura de logs para admins" ON public.logs_auditoria_admin;
CREATE POLICY "Leitura de logs para admins" 
    ON public.logs_auditoria_admin FOR SELECT 
    TO authenticated
    USING (
        (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
        OR auth.jwt()->>'email' = 'suporte.appcontos@gmail.com'
    );

DROP POLICY IF EXISTS "Inserção livre de logs" ON public.logs_auditoria_admin;
CREATE POLICY "Inserção livre de logs" 
    ON public.logs_auditoria_admin FOR INSERT 
    WITH CHECK (true);
