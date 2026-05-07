import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';

const BUNNY_STORAGE_KEY = '5513bf80-0970-4a66-a4e06d748364-2d6f-4522';
const BUNNY_STORAGE_URL = 'https://br.storage.bunnycdn.com/contos-apks';
const BUNNY_CDN_URL = 'https://contos-apks.b-cdn.net';
// Chave da API do Bunny (Account API Key) — usada para Purge
// Mesma chave do storage serve para purge via API pública
const BUNNY_API_KEY = BUNNY_STORAGE_KEY;

async function verificarAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminClient = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: perfil } = await adminClient
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single();

  if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') return null;
  return user;
}

export async function POST(req: NextRequest) {
  // 1. Verificar autenticação de admin
  const user = await verificarAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // 2. Ler o arquivo do FormData (API Routes suportam até 100MB no Vercel)
    const formData = await req.formData();
    const file = formData.get('backgroundImage') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo recebido.' }, { status: 400 });
    }

    // 3. Gerar nome ÚNICO com timestamp — resolve o cache do CDN!
    const extensao = file.name.split('.').pop() || 'jpg';
    const fileName = `background_${Date.now()}.${extensao}`;
    const arrayBuffer = await file.arrayBuffer();

    console.log(`[upload-fundo] Enviando ${fileName} (${(file.size / 1024).toFixed(1)} KB) para Bunny...`);

    // 4. Fazer upload da imagem nova para o Bunny Storage
    const resImage = await fetch(`${BUNNY_STORAGE_URL}/${fileName}`, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_STORAGE_KEY,
        'Content-Type': file.type || 'image/jpeg',
      },
      body: arrayBuffer,
    });

    if (!resImage.ok) {
      const errText = await resImage.text();
      throw new Error(`Falha no upload da imagem [${resImage.status}]: ${errText}`);
    }

    const bgUrl = `${BUNNY_CDN_URL}/${fileName}`;
    console.log(`[upload-fundo] ✅ Imagem enviada: ${bgUrl}`);

    // 5. Atualizar o config.json apontando para o novo arquivo
    const config = {
      background_url: bgUrl,
      updated_at: new Date().toISOString(),
    };

    const resConf = await fetch(`${BUNNY_STORAGE_URL}/config.json`, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_STORAGE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!resConf.ok) {
      const errText = await resConf.text();
      throw new Error(`Falha ao atualizar config.json [${resConf.status}]: ${errText}`);
    }

    console.log(`[upload-fundo] ✅ config.json atualizado`);

    // 6. Invalidar o cache do Bunny CDN para o config.json
    // Isso força o CDN a servir a versão nova imediatamente
    try {
      const purgeUrl = `https://api.bunny.net/purge?url=${encodeURIComponent(`${BUNNY_CDN_URL}/config.json`)}&async=false`;
      const resPurge = await fetch(purgeUrl, {
        method: 'POST',
        headers: {
          'AccessKey': BUNNY_API_KEY,
        },
      });
      if (resPurge.ok) {
        console.log(`[upload-fundo] ✅ Cache do config.json purgado com sucesso`);
      } else {
        // Não falha se o purge não funcionar — o timestamp no fileName já resolve
        console.warn(`[upload-fundo] ⚠️ Purge retornou ${resPurge.status} — mas o timestamp no nome do arquivo já evita cache`);
      }
    } catch (purgeErr) {
      console.warn('[upload-fundo] ⚠️ Erro no purge (não crítico):', purgeErr);
    }

    return NextResponse.json({
      success: true,
      background_url: bgUrl,
      message: 'Fundo atualizado com sucesso!',
    });

  } catch (error: any) {
    console.error('[upload-fundo] ❌ Erro:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
