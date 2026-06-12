import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const libraryId = searchParams.get('libraryId');

  if (!videoId || !libraryId) {
    return NextResponse.json({ error: 'videoId e libraryId são obrigatórios' }, { status: 400 });
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

  // Define tempo de expiração: 6 horas a partir de agora
  const expires = Math.floor(Date.now() / 1000) + (3600 * 6);

  // O caminho da assinatura para "Directory Authentication"
  const signaturePath = `/${videoId}/`;

  // String a ser hashada (no formato padrão Bunny CDN)
  // Normalmente é SecurityKey + Path + Expires + IP
  const hashableBase = securityKey + signaturePath + expires;
  
  // Hash padrão SHA256 do Bunny CDN
  const hashBase64 = crypto.createHash('sha256').update(hashableBase).digest('base64');
  
  // Transformar base64 em URL-Safe Base64
  const token = hashBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // URL de PullZone completa montada
  const hlsUrl = `https://${cdnUrl}/bcdn_token=${token}&expires=${expires}&token_path=%2F${videoId}%2F/${videoId}/playlist.m3u8`;

  return NextResponse.json({ 
    token, 
    expires, 
    hlsUrl,
    cdnUrl
  });
}
