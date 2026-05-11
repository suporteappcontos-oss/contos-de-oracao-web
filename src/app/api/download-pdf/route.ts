import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileUrl = searchParams.get('url')

  if (!fileUrl) {
    return new NextResponse('URL não fornecida', { status: 400 })
  }

  // Garante que só aceita URLs do nosso CDN (segurança)
  if (!fileUrl.includes('contos-apks.b-cdn.net')) {
    return new NextResponse('URL não autorizada', { status: 403 })
  }

  // Redireciona diretamente para o CDN — sem carregar o arquivo na memória.
  // O navegador vai baixar o arquivo diretamente do Bunny com velocidade total.
  const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'material.pdf'
  
  return NextResponse.redirect(fileUrl, {
    status: 302,
    headers: {
      // Sugestão de nome para o download (o navegador pode ignorar em redirect, mas ajuda)
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
