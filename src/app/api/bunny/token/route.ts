import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  }

  const securityKey = process.env.BUNNY_STREAM_TOKEN_KEY;
  if (!securityKey) {
    // Se não tiver chave de segurança configurada, não precisa gerar token
    return NextResponse.json({ token: null, expires: null });
  }

  const expires = Math.floor(Date.now() / 1000) + (3600 * 6); // 6 horas
  const hashString = securityKey + videoId + expires;
  const token = crypto.createHash('sha256').update(hashString).digest('hex');

  return NextResponse.json({ token, expires });
}
