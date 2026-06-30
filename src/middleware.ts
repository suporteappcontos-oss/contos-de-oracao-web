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


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Rate Limiting nas APIs ──
  if (pathname.startsWith('/api/')) {
    // Tenta pegar o IP nativo do Next.js, senão cai para os headers, senão 127.0.0.1 (local)
    const ip = request.ip
      || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1'

    // Usa o limitador rigoroso para webhooks ou login, caso contrário usa o padrão
    const ratelimit = (pathname.includes('/webhook') || pathname.includes('/auth') || pathname.includes('/login')) 
      ? strictRatelimit 
      : globalRatelimit

    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
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
