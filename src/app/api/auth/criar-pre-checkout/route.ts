import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 })
    }

    const existente = await buscarUsuarioPorEmail(email)

    if (existente) {
      // Usuário já existe, apenas prossegue para o checkout Kiwify
      return NextResponse.json({ success: true, userId: existente.id })
    }

    // Cria o usuário com a senha escolhida antes de ir para Kiwify
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Já confirma o e-mail para facilitar
      user_metadata: { nome, plano_ativo: false } // Inicia inativo, o webhook ativará
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: newUser.user.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
