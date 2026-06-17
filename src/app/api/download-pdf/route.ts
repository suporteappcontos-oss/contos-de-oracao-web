import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileUrl = searchParams.get('url')

  if (!fileUrl) {
    return new NextResponse('URL não fornecida', { status: 400 })
  }

  let validUrl: URL;
  try {
    validUrl = new URL(fileUrl);
    if (validUrl.hostname !== 'contos-midia-app.b-cdn.net' && !validUrl.hostname.endsWith('.b-cdn.net')) {
      return new NextResponse('URL não autorizada', { status: 403 })
    }
  } catch {
    return new NextResponse('URL inválida', { status: 400 })
  }

  try {
    const upstream = await fetch(validUrl.href)
    if (!upstream.ok) {
      return new NextResponse('Arquivo não encontrado no CDN', { status: 502 })
    }

    const fileName = decodeURIComponent(
      fileUrl.split('/').pop()?.split('?')[0] || 'material.pdf'
    )

    // ✅ Usa response.body (ReadableStream) — sem carregar o arquivo na memória
    // Isso força o download sem timeout, não importa o tamanho do PDF
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': upstream.headers.get('Content-Length') ?? '',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err: any) {
    console.error('Erro no proxy de download:', err)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
