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

/**
 * Busca usuário por número de telefone / WhatsApp no Supabase (auth.users ou testadores_playstore)
 */
export async function buscarUsuarioPorTelefone(telefone: string) {
  try {
    const digits = telefone.replace(/\D/g, '')
    if (digits.length < 8) return null

    const lastDigits = digits.slice(-9)

    // 1. Tentar localizar na tabela testadores_playstore
    const { data: testadores } = await supabaseAdmin
      .from('testadores_playstore')
      .select('email, whatsapp')

    if (testadores && testadores.length > 0) {
      const testador = testadores.find(t => {
        if (!t.whatsapp) return false
        const wDigits = t.whatsapp.replace(/\D/g, '')
        return wDigits.endsWith(lastDigits) || wDigits.includes(lastDigits)
      })

      if (testador?.email) {
        const user = await buscarUsuarioPorEmail(testador.email)
        if (user) return user
      }
    }

    // 2. Buscar nos usuários do Auth pelo metadata de telefone/whatsapp ou campo phone
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (error || !users) return null

    const foundUser = users.find(u => {
      const userPhone = u.phone ? u.phone.replace(/\D/g, '') : ''
      const metaWhatsapp = u.user_metadata?.whatsapp ? String(u.user_metadata.whatsapp).replace(/\D/g, '') : ''
      const metaTelefone = u.user_metadata?.telefone ? String(u.user_metadata.telefone).replace(/\D/g, '') : ''

      return (
        (userPhone && userPhone.includes(lastDigits)) ||
        (metaWhatsapp && metaWhatsapp.includes(lastDigits)) ||
        (metaTelefone && metaTelefone.includes(lastDigits))
      )
    })

    return foundUser ?? null
  } catch (err) {
    console.error('Erro ao buscar usuário por telefone:', err)
    return null
  }
}

