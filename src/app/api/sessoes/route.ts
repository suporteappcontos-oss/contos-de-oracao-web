import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ── POST — Registrar nova sessão (ou renovar se device_token já existe) ──
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // Admin nunca é bloqueado
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com') {
    return NextResponse.json({ ok: true, admin: true })
  }

  const { device_token, video_id } = await request.json()
  if (!device_token || !video_id) {
    return NextResponse.json({ error: 'device_token e video_id são obrigatórios' }, { status: 400 })
  }

  // Limite de telas do plano do usuário (salvo no user_metadata pelo webhook)
  const maxTelas = Number(user.user_metadata?.max_telas || 1)

  // Limpa sessões inativas (> 2 horas sem heartbeat) antes de contar
  await supabaseAdmin
    .from('sessoes_ativas')
    .delete()
    .eq('user_id', user.id)
    .lt('atualizado_em', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())

  // Verifica se este device_token já tem uma sessão ativa → apenas renovar (heartbeat)
  const { data: sessaoExistente } = await supabaseAdmin
    .from('sessoes_ativas')
    .select('id')
    .eq('user_id', user.id)
    .eq('device_token', device_token)
    .single()

  if (sessaoExistente) {
    // Apenas atualiza o timestamp para manter a sessão ativa
    await supabaseAdmin
      .from('sessoes_ativas')
      .update({ atualizado_em: new Date().toISOString(), video_id })
      .eq('id', sessaoExistente.id)
    return NextResponse.json({ ok: true, renovada: true })
  }

  // Conta quantas sessões ativas este usuário tem no momento
  const { count } = await supabaseAdmin
    .from('sessoes_ativas')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const totalAtivo = count ?? 0

  if (totalAtivo >= maxTelas) {
    return NextResponse.json(
      { error: 'limite_atingido', max_telas: maxTelas, telas_ativas: totalAtivo },
      { status: 429 }
    )
  }

  // Registra nova sessão
  await supabaseAdmin.from('sessoes_ativas').insert({
    user_id: user.id,
    device_token,
    video_id,
  })

  return NextResponse.json({ ok: true, telas_ativas: totalAtivo + 1, max_telas: maxTelas })
}

// ── PATCH — Heartbeat: mantém a sessão viva ──
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { device_token } = await request.json()
  if (!device_token) return NextResponse.json({ error: 'device_token obrigatório' }, { status: 400 })

  await supabaseAdmin
    .from('sessoes_ativas')
    .update({ atualizado_em: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('device_token', device_token)

  return NextResponse.json({ ok: true })
}

// ── DELETE — Remove a sessão ao sair ──
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { device_token } = await request.json()
  if (!device_token) return NextResponse.json({ error: 'device_token obrigatório' }, { status: 400 })

  await supabaseAdmin
    .from('sessoes_ativas')
    .delete()
    .eq('user_id', user.id)
    .eq('device_token', device_token)

  return NextResponse.json({ ok: true })
}
