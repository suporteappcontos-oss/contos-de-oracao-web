import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    let { data: { user } } = await supabase.auth.getUser()
    
    // Se não encontrou pelo cookie, tenta extrair do cabeçalho Authorization (para TV/App)
    if (!user) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        const { data: { user: jwtUser } } = await supabase.auth.getUser(token)
        user = jwtUser
      }
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { tipo } = body // 'site' ou 'app'

    if (tipo !== 'site' && tipo !== 'app') {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    // Busca o perfil atual do usuário para obter os acessos atuais
    const { data: perfil, error: fetchError } = await supabaseAdmin
      .from('perfis')
      .select('acessos_site, acessos_app')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', fetchError)
      return NextResponse.json({ error: 'Erro ao registrar acesso' }, { status: 500 })
    }

    // Incrementa o respectivo contador
    const updates: any = {}
    if (tipo === 'site') {
      updates.acessos_site = (perfil?.acessos_site || 0) + 1
    } else {
      updates.acessos_app = (perfil?.acessos_app || 0) + 1
    }

    const { error: updateError } = await supabaseAdmin
      .from('perfis')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar acessos:', updateError)
      return NextResponse.json({ error: 'Erro ao registrar acesso' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Erro interno ao registrar acesso:', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
