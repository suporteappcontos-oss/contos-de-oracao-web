import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Rota de download direto — busca o vídeo no CDN do Bunny e serve com header de download
// Funciona igual ao PDF: um clique → baixa direto no dispositivo
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')
  const titulo = searchParams.get('titulo') || 'video'

  if (!videoId || !/^[a-zA-Z0-9-]+$/.test(videoId)) {
    return new NextResponse('Video ID inválido ou obrigatório', { status: 400 })
  }

  // Verifica se o usuário está em período de teste de 7 dias
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const isTrial = user.user_metadata?.em_teste === true || user.user_metadata?.status_stripe === 'trialing'
      const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).maybeSingle()
      const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'

      if (isTrial && !isAdmin) {
        return new NextResponse(
          'Downloads de vídeos são liberados apenas após a confirmação da assinatura (fim do teste de 7 dias).',
          { status: 403 }
        )
      }
    }
  } catch (e) {
    // Continua se falhar verificação pontual
  }

  const cdnHostname = process.env.BUNNY_INSTAGRAM_CDN_URL || 'vz-f8cf772c-1bd.b-cdn.net'

  // Tenta baixar o arquivo original primeiro, depois fallback para 720p
  const urls = [
    `https://${cdnHostname}/${videoId}/original`,
    `https://${cdnHostname}/${videoId}/play_720p.mp4`,
    `https://${cdnHostname}/${videoId}/play_480p.mp4`,
  ]

  let response: Response | null = null

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        response = res
        break
      }
    } catch {
      continue
    }
  }

  if (!response || !response.body) {
    return new NextResponse('Vídeo não encontrado. Tente novamente.', { status: 404 })
  }

  // Nome do arquivo limpo para download
  const nomeArquivo = titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 60)

  const contentLength = response.headers.get('content-length')
  const contentType = response.headers.get('content-type') || 'video/mp4'

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${nomeArquivo}.mp4"`,
    'Cache-Control': 'no-cache',
  }

  if (contentLength) {
    headers['Content-Length'] = contentLength
  }

  return new NextResponse(response.body, { headers })
}
