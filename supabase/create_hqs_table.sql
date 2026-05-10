-- =====================================================
-- TABELA: hqs (Histórias em Quadrinhos)
-- Execute este SQL no Supabase → SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS hqs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text NOT NULL UNIQUE,          -- ex: nossa-senhora-fatima
  titulo        text NOT NULL,                 -- ex: Nossa Senhora de Fátima
  descricao     text,                          -- descrição curta
  capa_url      text,                          -- URL da capa (HQ_01.png)
  total_paginas integer NOT NULL DEFAULT 1,
  planos_acesso text[] NOT NULL DEFAULT ARRAY['Essencial','Pro'],  -- quem pode LER
  planos_pdf    text[] NOT NULL DEFAULT ARRAY['Essencial','Pro'],  -- quem pode BAIXAR o PDF
  tem_pdf       boolean NOT NULL DEFAULT false,
  ativo         boolean NOT NULL DEFAULT true,
  criado_em     timestamptz DEFAULT now()
);

-- Segurança: qualquer usuário autenticado pode LER
ALTER TABLE hqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hqs_select_authenticated"
  ON hqs FOR SELECT
  TO authenticated
  USING (ativo = true);

CREATE POLICY "hqs_all_service_role"
  ON hqs FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- Inserir a HQ que já existe (nossa-senhora-fatima)
-- =====================================================
INSERT INTO hqs (slug, titulo, descricao, capa_url, total_paginas, planos_acesso, planos_pdf, tem_pdf, ativo)
VALUES (
  'nossa-senhora-fatima',
  'Nossa Senhora de Fátima',
  'A história das aparições de Nossa Senhora às três pastorinhas em Fátima, Portugal.',
  'https://contos-apks.b-cdn.net/hq/nossa-senhora-fatima/HQ_01.png',
  15,
  ARRAY['Essencial', 'Pro'],
  ARRAY['Essencial', 'Pro'],
  false,  -- mude para true depois de subir o PDF pelo admin
  true
)
ON CONFLICT (slug) DO NOTHING;
