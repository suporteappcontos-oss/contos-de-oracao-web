import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Configurações do Bunny CDN
    const bunnyKey = process.env.BUNNY_API_KEY;
    const bunnyStorageUrl = process.env.BUNNY_STORAGE_URL;
    const bunnyPullZone = process.env.BUNNY_PULL_ZONE;

    if (!bunnyKey || !bunnyStorageUrl || !bunnyPullZone) {
      return NextResponse.json({ error: 'Configuracoes do Bunny CDN nao encontradas na Vercel' }, { status: 500 });
    }

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
    

