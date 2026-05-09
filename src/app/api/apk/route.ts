import { NextResponse } from 'next/server';

const BUNNY_CDN = 'https://contos-apks.b-cdn.net';

export async function GET() {
  try {
    // Lê o versao.json — fonte única de verdade, atualizada pelo painel Admin
    const res = await fetch(`${BUNNY_CDN}/versao.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });

    if (!res.ok) {
      throw new Error(`Bunny CDN retornou ${res.status}`);
    }

    const data = await res.json();

    // Garante que temos os campos esperados
    if (!data.versao_atual || !data.link_download) {
      throw new Error('versao.json inválido ou incompleto');
    }

    return NextResponse.json({
      versao_atual: data.versao_atual,
      link_download: data.link_download,
      mensagem: data.mensagem || '',
      obrigatorio: data.obrigatorio || false,
      nome: `contos-de-oracao-v${data.versao_atual}.apk`,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });

  } catch (error: any) {
    console.error('Erro na API /api/apk:', error);
    // Fallback para não quebrar o botão de download
    return NextResponse.json({
      versao_atual: '1.0.25',
      link_download: `${BUNNY_CDN}/contos-de-oracao-v1.0.25.apk`,
      nome: 'contos-de-oracao-v1.0.25.apk',
    });
  }
}
