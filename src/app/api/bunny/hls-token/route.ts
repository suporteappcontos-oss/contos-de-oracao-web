import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const libraryId = searchParams.get('libraryId');
  const platform = searchParams.get('platform');

  if (!videoId || !libraryId || !/^[a-zA-Z0-9-]+$/.test(videoId) || !/^[0-9]+$/.test(libraryId)) {
    return NextResponse.json({ error: 'Parâmetros inválidos ou obrigatórios' }, { status: 400 });
  }

  let securityKey = process.env.BUNNY_STREAM_TOKEN_KEY;
  let cdnUrl = process.env.BUNNY_CDN_URL;

  // Usa as credenciais corretas dependendo de qual biblioteca o vídeo pertence
  if (libraryId === process.env.BUNNY_INSTAGRAM_LIBRARY_ID) {
    securityKey = process.env.BUNNY_INSTAGRAM_TOKEN_KEY;
    cdnUrl = process.env.BUNNY_INSTAGRAM_CDN_URL;
  }

  if (!securityKey || !cdnUrl) {
    return NextResponse.json({ error: 'Configurações de CDN não encontradas' }, { status: 500 });
  }

  // Define tempo de expiração: 24 horas para garantir estabilidade e evitar expirações precoces
  const expires = Math.floor(Date.now() / 1000) + (3600 * 24);

  // O caminho da assinatura para "Directory Authentication"
  const signaturePath = `/${videoId}/`;

  // Mensagem a ser assinada (path + expires + signingData)
  const message = signaturePath + expires + `token_path=${signaturePath}`;
  
  // HMAC-SHA256 usando o securityKey como chave secreta
  const hmac = crypto.createHmac('sha256', securityKey);
  hmac.update(message);
  const hashBase64 = hmac.digest('base64');
  
  // Transformar base64 em URL-Safe Base64
  const base64Url = hashBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const token = `HS256-${base64Url}`;

  // URL Master HLS padrão
  let targetFile = 'playlist.m3u8';

  // Se a plataforma for TV, limitamos a resolução máxima para no máximo 1080p (evitando 4K/1440p que travam codecs de TVs antigas)
  if (platform === 'tv') {
    try {
      const masterUrl = `https://${cdnUrl}/bcdn_token=${token}&expires=${expires}&token_path=%2F${videoId}%2F/${videoId}/playlist.m3u8`;
      const response = await fetch(masterUrl, {
        headers: { 'Referer': 'https://contosdeoracao.com.br' }
      });
      if (response.ok) {
        const text = await response.text();
        
        // Filtrar as resoluções
        const resolutions: { res: number; path: string }[] = [];
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('#EXT-X-STREAM-INF:')) {
            const match = lines[i].match(/RESOLUTION=\d+x(\d+)/);
            if (match && i + 1 < lines.length) {
              const height = parseInt(match[1]);
              const path = lines[i + 1].trim();
              resolutions.push({ res: height, path });
            }
          }
        }

        // Filtra resoluções <= 1080p
        const safeResolutions = resolutions.filter(r => r.res <= 1080);
        if (safeResolutions.length > 0) {
          // Ordena decrescente para pegar a melhor disponível
          safeResolutions.sort((a, b) => b.res - a.res);
          targetFile = safeResolutions[0].path;
        }
      }
    } catch (e) {
      console.error('Erro ao analisar playlist master para a TV:', e);
    }
  }

  // URL de PullZone completa montada
  const hlsUrl = `https://${cdnUrl}/bcdn_token=${token}&expires=${expires}&token_path=%2F${videoId}%2F/${videoId}/${targetFile}`;

  return NextResponse.json({ 
    token, 
    expires, 
    hlsUrl,
    cdnUrl
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    }
  });
}
