import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Inicializando o Redis do Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Criando diferentes limitadores para diferentes necessidades
// Padrão: 300 requisições por minuto por IP (navegação normal)
const globalRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(300, '1 m'),
  analytics: true,
})

// Rigoroso: 60 requisições por minuto por IP (webhooks, logins, pagamentos)
const strictRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
})

// Administrativo: 10 requisições por minuto por IP (painel secreto e APIs admin)
const adminRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
})


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isApi = pathname.startsWith('/api/')
  const isSecretAdmin = pathname.startsWith('/painel-equipe-cod')

  // ── Rate Limiting ──
  if (isApi || isSecretAdmin) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1'

    let ratelimit = globalRatelimit

    if (isSecretAdmin || pathname.startsWith('/api/admin')) {
      ratelimit = adminRatelimit
    } else if (pathname.includes('/webhook') || pathname.includes('/auth') || pathname.includes('/login')) {
      ratelimit = strictRatelimit
    }

    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      if (isSecretAdmin) {
        return new NextResponse(
          'Muitas tentativas de acesso detectadas. Acesso bloqueado temporariamente.',
          { 
            status: 429, 
            headers: { 
              'Content-Type': 'text/plain; charset=utf-8',
              'Retry-After': reset.toString() 
            } 
          }
        )
      }

      return NextResponse.json(
        { error: 'Muitas requisições detectadas. Por favor, aguarde alguns instantes antes de tentar novamente.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      )
    }
  }

  // ── Atualiza sessão e protege rotas ──
  const response = await updateSession(request)

  // ── Headers de Segurança HTTP ──
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
