import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single();
    if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'O arquivo deve ser uma imagem.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Nome do arquivo unico
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `produto_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Credenciais BunnyCDN
    const STORAGE_ZONE = 'contos-midia-app';
    const ACCESS_KEY = process.env.BUNNY_API_KEY;
    
    if (!ACCESS_KEY) {
      return NextResponse.json({ error: 'Chave BUNNY_API_KEY não configurada no servidor' }, { status: 500 });
    }

    const REGION_URL = 'br.storage.bunnycdn.com';
    const PULL_ZONE = 'https://contos-midia-app.b-cdn.net';
    
    // Faz o upload direto para o BunnyCDN na pasta produtos
    const response = await fetch(`https://${REGION_URL}/${STORAGE_ZONE}/produtos/${fileName}`, {
      method: 'PUT',
      headers: {
        'AccessKey': ACCESS_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`Erro no BunnyCDN: ${response.statusText}`);
    }

    // URL final publica no Bunny
    const fileUrl = `${PULL_ZONE}/produtos/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl
    });

  } catch (error: any) {
    console.error('Erro no upload de produto para o BunnyCDN:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload', details: error.message },
      { status: 500 }
    );
  }
}
