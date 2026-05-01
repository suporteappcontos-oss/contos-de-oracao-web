import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !email.trim()) {
    return NextResponse.json({ ok: false, error: 'E-mail inválido.' }, { status: 400 })
  }

  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://contos-de-oracao-web.vercel.app'

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${siteUrl}/api/auth/callback?next=/atualizar-senha`,
  })

  if (error) {
    console.error('🔴 ERRO RESET SENHA:', error)
    let msg = 'Erro interno ao tentar enviar o e-mail.'
    if (error.status === 429) msg = 'Muitas tentativas. Aguarde alguns minutos.'
    else if (error.status === 400) msg = 'E-mail inválido.'
    else if (error.status && error.status >= 500) msg = 'Erro no servidor de e-mail.'
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
