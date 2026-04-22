import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// ✅ Next.js 16 usa a convenção "proxy" — o arquivo deve se chamar src/proxy.ts
// e a função exportada deve se chamar "proxy" (mudança em relação ao Next.js 13-15)
export async function proxy(request: NextRequest) {
  // Verifica sessão e protege a rota /watch para usuários não autenticados
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

