import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const BUNNY_STORAGE_URL = 'https://br.storage.bunnycdn.com/contos-midia-app/versao.json';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Verifica admin
    const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single();
    if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { versao, link_download, mensagem, obrigatorio } = body;

    if (!versao || !link_download) {
      return NextResponse.json({ error: 'versao e link_download são obrigatórios' }, { status: 400 });
    }

    const dados = {
      versao_atual: versao,
      link_download,
      obrigatorio: obrigatorio || false,
      mensagem: mensagem || `🙏 Nova versão ${versao} disponível!`,
      data_lancamento: new Date().toISOString(),
    };

    const ACCESS_KEY = process.env.BUNNY_API_KEY;
    if (!ACCESS_KEY) {
      return NextResponse.json({ error: 'Chave BUNNY_API_KEY não configurada no servidor' }, { status: 500 });
    }

    const res = await fetch(BUNNY_STORAGE_URL, {
      method: 'PUT',
      headers: {
        'AccessKey': ACCESS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });

    if (!res.ok) {
      throw new Error(`Bunny CDN retornou ${res.status}: ${res.statusText}`);
    }

    return NextResponse.json({ success: true, dados });
  } catch (error: any) {
    console.error('Erro ao atualizar versao.json:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
