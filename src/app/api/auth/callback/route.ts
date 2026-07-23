import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Essa rota processa o link que o Supabase manda no e-mail
// Quando o usuário clica no link de "recuperar senha" ou "confirmar conta"
// o Supabase redireciona para cá com um `code` na URL
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const errorParam = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // 1. Se o Supabase retornou erro nos parâmetros de busca (ex: otp_expired / link expirado)
  if (errorParam || errorCode || errorDescription) {
    console.error('🔴 Auth Callback Error from Supabase:', { errorParam, errorCode, errorDescription })
    const msg = errorCode === 'otp_expired' || errorDescription?.includes('expired')
      ? 'O link de recuperação expirou ou já foi utilizado. Por favor, solicite um novo link abaixo.'
      : 'Link de acesso inválido ou expirado. Solicite a recuperação novamente.'
    return NextResponse.redirect(`${origin}/esqueci-senha?erro=${encodeURIComponent(msg)}`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Tenta autenticar por token_hash (fluxo de e-mail OTP / recovery)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('🔴 ERRO verifyOtp:', error)
  }

  // 3. Tenta trocar o código PKCE por uma sessão ativa
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('🔴 ERRO exchangeCodeForSession:', error)
  }

  // Se o link for inválido, expirado ou pre-fetch por antivírus de e-mail
  const msg = 'O link de recuperação expirou ou foi clicado duas vezes. Por favor, solicite um novo link.'
  return NextResponse.redirect(`${origin}/esqueci-senha?erro=${encodeURIComponent(msg)}`)
}
