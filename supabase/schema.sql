-- =====================================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS (SUPABASE)
-- =====================================================================
-- Este arquivo documenta a estrutura atual de todas as tabelas do 
-- projeto "Contos de Oração" em ambiente de produção.

-- 1. TABELA: perfis
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'membro' CHECK (role IN ('admin', 'membro')),
    nome TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    push_token TEXT
);

-- 2. TABELA: videos
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT DEFAULT 'Geral',
    thumbnail_url TEXT,
    bunny_video_id TEXT,
    bunny_library_id TEXT NOT NULL DEFAULT '642831',
    duracao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ativo BOOLEAN DEFAULT true,
    em_breve BOOLEAN DEFAULT false,
    temporada_nome TEXT,
    episodio_numero INTEGER
);

-- 3. TABELA: favoritos
CREATE TABLE IF NOT EXISTS public.favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, video_id)
);

-- 4. TABELA: materiais
CREATE TABLE IF NOT EXISTS public.materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL CHECK (categoria IN ('hq', 'jogo', 'desenho', 'livro', 'adesivo')),
    capa_url TEXT,
    link_pdf TEXT,
    planos_acesso TEXT[] DEFAULT ARRAY['Essencial'::text, 'Pro'::text],
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. TABELA: notificacoes
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. TABELA: anuncios_pausa
CREATE TABLE IF NOT EXISTS public.anuncios_pausa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    imagem_url TEXT,
    link_destino TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. TABELA: qr_sessions (Utilizada no login da TV)
CREATE TABLE IF NOT EXISTS public.qr_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN DEFAULT false,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. TABELA: sessoes_ativas (Controle de dispositivos simultâneos)
CREATE TABLE IF NOT EXISTS public.sessoes_ativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL,
    video_id TEXT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. TABELA: visualizacoes
CREATE TABLE IF NOT EXISTS public.visualizacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
