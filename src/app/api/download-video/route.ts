import { NextRequest, NextResponse } from 'next/server'

// Rota de download do vídeo temático — força o browser a baixar o arquivo
// Usa a API do Bunny Stream para pegar a URL direta do CDN
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')

  if (!videoId) {
    return new NextResponse('Video ID obrigatório', { status: 400 })
  }

  const libraryId = process.env.BUNNY_INSTAGRAM_LIBRARY_ID || '678138'
  const apiKey = process.env.BUNNY_INSTAGRAM_API_KEY

  if (!apiKey) {
    // Fallback: redireciona para o play URL caso não tenha API key
    return NextResponse.redirect(
      `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`
    )
  }

  try {
    // Busca informações do vídeo na API do Bunny Stream
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        headers: {
          AccessKey: apiKey,
          accept: 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return new NextResponse('Vídeo não encontrado', { status: 404 })
    }

    const data = await res.json()

    // Monta URL direta do CDN para download
    const cdnHostname = data.storageSize > 0
      ? `${data.guid}.b-cdn.net`
      : null

    // URL de download: CDN direto se disponível, senão usa pull zone do Bunny
    const pullZone = process.env.NEXT_PUBLIC_BUNNY_INSTAGRAM_CDN_URL
    const baseUrl = pullZone
      ? `https://${pullZone}`
      : `https://iframe.mediadelivery.net/play/${libraryId}`

    if (pullZone) {
      // Redireciona para CDN com header de download
      const downloadUrl = `${baseUrl}/${videoId}/original`
      return NextResponse.redirect(downloadUrl)
    }

    // Se não tem CDN configurado, redireciona para play
    return NextResponse.redirect(
      `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`
    )
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
