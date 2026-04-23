import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Rotas que só admin pode acessar
const ROTAS_ADMIN = ['/admin']

// Rate limiting simples em memória (para produção use Upstash Redis)
const requestCounts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = requestCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs })
    return true // OK
  }

  if (entry.count >= limit) return false // Bloqueado

  entry.count++
  return true // OK
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Rate Limiting nas APIs ──
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    // Limite mais estrito para o webhook (30 req/min)
    const limite = pathname.includes('/webhook') ? 30 : 100

    if (!checkRateLimit(ip, limite)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
        { status: 429 }
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

  // ── Proteção extra do /admin ──
  if (ROTAS_ADMIN.some(r => pathname.startsWith(r))) {
    // Se não há sessão, redireciona para login
    const sessionCookie = request.cookies.get('sb-simlfedsforfwwtlmshy-auth-token')
      || request.cookies.get('sb-access-token')

    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
