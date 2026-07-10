-- 1. Adiciona a coluna avatar_url na tabela pública de perfis se não existir
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Retroalimenta os dados (backfill) copiando os avatares já definidos nas contas
UPDATE public.perfis p
SET avatar_url = u.raw_user_meta_data->>'avatar_url',
    nome = COALESCE(u.raw_user_meta_data->>'nome', u.raw_user_meta_data->>'name', p.nome)
FROM auth.users u
WHERE p.id = u.id;

-- 3. Cria a função que sincroniza o avatar do metadado de autenticação para o perfil público
CREATE OR REPLACE FUNCTION public.sync_user_avatar_and_name()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.perfis
    SET avatar_url = NEW.raw_user_meta_data->>'avatar_url',
        nome = COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'name', public.perfis.nome)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Cria o gatilho (trigger) na tabela auth.users para monitorar atualizações de metadata
DROP TRIGGER IF EXISTS on_auth_user_avatar_update ON auth.users;
CREATE TRIGGER on_auth_user_avatar_update
    AFTER UPDATE OF raw_user_meta_data ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_avatar_and_name();
