import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/push/enviar
 * Body: { titulo, mensagem, videoId? }
 * Envia push notification para todos os usuários com push_token cadastrado
 * Só admins podem chamar isso (verificado pelo Supabase)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verifica se é admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: perfil } = await supabase
      .from('perfis')
      .select('role')
      .eq('id', user.id)
      .single()

    if (perfil?.role !== 'admin') {
      return NextResponse.json({ error: 'Apenas admins podem enviar notificações' }, { status: 403 })
    }

    const { titulo, mensagem, videoId } = await request.json()

    if (!titulo || !mensagem) {
      return NextResponse.json({ error: 'titulo e mensagem são obrigatórios' }, { status: 400 })
    }

    // Busca todos os tokens push cadastrados
    const { data: perfis } = await supabase
      .from('perfis')
      .select('push_token')
      .not('push_token', 'is', null)

    const tokens = (perfis || [])
      .map(p => p.push_token)
      .filter(Boolean)

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, enviados: 0, mensagem: 'Nenhum token cadastrado ainda' })
    }

    // Envia para a API do Expo Push Service (gratuita até ~1M/mês)
    const messages = tokens.map(token => ({
      to: token,
      title: titulo,
      body: mensagem,
      sound: 'default',
      data: videoId ? { videoId } : {},
      channelId: 'default',
    }))

    // Expo aceita até 100 mensagens por request
    const chunks = []
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100))
    }

    let totalEnviados = 0
    for (const chunk of chunks) {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      })
      if (res.ok) totalEnviados += chunk.length
    }

    return NextResponse.json({
      success: true,
      enviados: totalEnviados,
      total: tokens.length,
    })

  } catch (error) {
    console.error('Erro ao enviar push:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
