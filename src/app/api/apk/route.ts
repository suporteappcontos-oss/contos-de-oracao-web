import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Lê o versao.json do próprio site (public/versao.json)
    // Atualizado automaticamente pelo gerar-apk-local.bat via git push
    const versaoPath = join(process.cwd(), 'public', 'versao.json');
    const data = JSON.parse(readFileSync(versaoPath, 'utf-8'));

    if (!data.versao_atual || !data.link_download) {
      throw new Error('versao.json inválido ou incompleto');
    }

    return NextResponse.json({
      versao_atual: data.versao_atual,
      link_download: data.link_download,
      mensagem: data.mensagem || '',
      obrigatorio: data.obrigatorio || false,
      nome: `ContosDeOracao_v${data.versao_atual}.apk`,
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });

  } catch (error: any) {
    console.error('Erro na API /api/apk:', error);
    return NextResponse.json({
      versao_atual: '1.0.27',
      link_download: 'https://contos-apks.b-cdn.net/contos-de-oracao-v1.0.27.apk',
      nome: 'ContosDeOracao_v1.0.27.apk',
    });
  }
}
