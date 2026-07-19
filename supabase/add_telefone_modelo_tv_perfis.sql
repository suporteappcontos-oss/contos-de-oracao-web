-- =====================================================================
-- ADICIONAR COLUNAS DE WHATSAPP E MODELO DE TV NA TABELA DE PERFIS
-- =====================================================================
-- Esta migração adiciona o campo de contato telefônico e modelo de Smart TV
-- para que possamos mapear o uso de Smart TVs no futuro e melhorar o contato.

-- 1. Adiciona as colunas de whatsapp e modelo_tv se não existirem
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS modelo_tv TEXT;

-- 2. Atualiza a função que sincroniza os metadados de autenticação para incluir os novos campos
CREATE OR REPLACE FUNCTION public.sync_user_avatar_and_name()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.perfis
    SET avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        nome = COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', public.perfis.nome),
        whatsapp = NEW.raw_user_meta_data->>'whatsapp',
        modelo_tv = NEW.raw_user_meta_data->>'modelo_tv'
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atualiza os perfis existentes com os dados que possam já estar nos metadados
UPDATE public.perfis p
SET whatsapp = u.raw_user_meta_data->>'whatsapp',
    modelo_tv = u.raw_user_meta_data->>'modelo_tv'
FROM auth.users u
WHERE p.id = u.id;
