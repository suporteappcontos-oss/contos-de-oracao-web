import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// O site fica fazendo polling nessa rota para saber se foi confirmado
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) return NextResponse.json({ status: 'invalid' }, { status: 400 })

  const admin = getAdminClient()

  const { data: session } = await admin
    .from('qr_sessions')
    .select('*')
    .eq('token', token.toUpperCase())
    .single()

  if (!session) return NextResponse.json({ status: 'invalid' })

  // Expirado
  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ status: 'expired' })
  }

  // Ainda aguardando o scan
  if (!session.usado || !session.user_id) {
    return NextResponse.json({ status: 'waiting' })
  }

  // Confirmado! Retorna o user_id para o site criar a sessão
  // O site usará o magic link / token admin para logar automaticamente
  const { data: userResponse } = await admin.auth.admin.getUserById(session.user_id)
  const userEmail = userResponse?.user?.email

  if (!userEmail) return NextResponse.json({ status: 'error' })

  // Gera um magic link de 1 uso para o site fazer o login automático
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: userEmail,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.com.br'}/watch` }
  })

  if (linkError || !linkData) {
    return NextResponse.json({ status: 'error', message: linkError?.message })
  }

  // Apaga a sessão usada
  await admin.from('qr_sessions').delete().eq('token', token.toUpperCase())

  // Retorna para o site redirecionar o usuário
  return NextResponse.json({
    status: 'confirmed',
    email: userEmail,
    loginUrl: linkData.properties?.action_link
  })
}
