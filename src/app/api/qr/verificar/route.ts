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

  // BURLA: Ao invés de mandar a TV abrir o link no navegador, nós consumimos o link aqui no servidor
  // O Supabase retorna um 303 Redirect com o access_token no header Location.
  let tokens = null
  const actionLink = linkData.properties?.action_link
  
  if (actionLink) {
    try {
      const res = await fetch(actionLink, { method: 'GET', redirect: 'manual' })
      const location = res.headers.get('Location')
      
      if (location && location.includes('#')) {
        const fragment = location.split('#')[1]
        // Substituir os "&" pra poder usar no URLSearchParams ou parse nativo
        const params = new URLSearchParams(fragment)
        if (params.get('access_token')) {
          tokens = {
            access_token: params.get('access_token'),
            refresh_token: params.get('refresh_token')
          }
        }
      }
    } catch (e) {
      console.error('Falha ao extrair tokens do magic link', e)
    }
  }

  return NextResponse.json({
    status: 'confirmed',
    email: userEmail,
    loginUrl: actionLink,
    tokens // Passa os tokens diretamente para a TV
  })
}
