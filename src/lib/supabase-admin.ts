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
    // Tenta primeiro listar os usuários para achar o email
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })
    
    if (error || !users) return null
    return users.find(u => u.email === email) ?? null
  } catch {
    return null
  }
}
