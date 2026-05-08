import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Configurações do Bunny CDN — fallback hardcoded para garantir funcionamento
    const bunnyKey = process.env.BUNNY_API_KEY || '5513bf80-0970-4a66-a4e06d748364-2d6f-4522';
    const bunnyStorageUrl = process.env.BUNNY_STORAGE_URL || 'https://br.storage.bunnycdn.com/contos-apks/';
    const bunnyPullZone = process.env.BUNNY_PULL_ZONE || 'https://contos-apks.b-cdn.net';


    // Faz a listagem dos arquivos da pasta do Bunny
    const response = await fetch(bunnyStorageUrl, {
      method: 'GET',
      headers: {
        'AccessKey': bunnyKey,
        'Accept': 'application/json'
      },
      cache: 'no-store' // Sempre busca o mais atualizado
    });

    if (!response.ok) {
       return NextResponse.json({ error: 'Falha ao acessar BunnyCDN: ' + response.statusText }, { status: response.status });
    }

    const files = await response.json();
    
    // Filtra para pegar apenas os arquivos que terminam com .apk
    const apks = files.filter((f: any) => !f.IsDirectory && f.ObjectName.endsWith('.apk'));

    if (apks && apks.length > 0) {
      // Ordena pelos mais recentes (se houver mais de um)
      apks.sort((a: any, b: any) => new Date(b.DateCreated).getTime() - new Date(a.DateCreated).getTime());
      
      const latestApk = apks[0];
      
      // Extrair versão do nome (ex: ContosDeOracao-v1.0.5.apk -> 1.0.5)
      let versao = "1.0.0";
      const versaoMatch = latestApk.ObjectName?.match(/v?(\d+\.\d+\.\d+)/);
      if (versaoMatch) {
        versao = versaoMatch[1];
      }
      
      // O link final maravilhoso para o usuário!
      return NextResponse.json({
        link_download: `${bunnyPullZone}/${latestApk.ObjectName}`,
        versao_atual: versao,
        nome: latestApk.ObjectName
      });
    }
    
    return NextResponse.json({ error: 'Nenhum APK encontrado no Bunny' }, { status: 404 });
  } catch (error: any) {
    console.error("Erro na API do Bunny APK:", error);
    return NextResponse.json({ error: 'Erro interno', details: error?.message || String(error) }, { status: 500 });
  }
}
    

