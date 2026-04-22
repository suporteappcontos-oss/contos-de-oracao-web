import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Essa rota processa o link que o Supabase manda no e-mail
// Quando o usuário clica no link de "recuperar senha" ou "confirmar conta"
// o Supabase redireciona para cá com um `code` na URL
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
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

    // Troca o código por uma sessão ativa
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redireciona para a próxima página (ex: /atualizar-senha)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se o link for inválido ou expirado
  return NextResponse.redirect(`${origin}/login?error=link_invalido`)
}
