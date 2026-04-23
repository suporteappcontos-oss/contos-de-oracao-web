import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * Busca usuário por email via REST API do Supabase Admin.
 * Eficiente e escalável — não carrega todos os usuários na memória.
 */
export async function buscarUsuarioPorEmail(email: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&per_page=1`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    const users = data.users as Array<{ id: string; email: string; user_metadata: Record<string, unknown> }>
    return users?.find(u => u.email === email) ?? null
  } catch {
    return null
  }
}
