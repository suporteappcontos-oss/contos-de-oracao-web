import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, avatarUrl, pedidoSanto } = await request.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 })
    }

    const existente = await buscarUsuarioPorEmail(email)
    let userId = ''

    if (existente) {
      // Usuário já existe, apenas prossegue para o checkout Kiwify
      userId = existente.id
    } else {
      // Cria o usuário com a senha escolhida antes de ir para Kiwify
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true, // Já confirma o e-mail para facilitar
        user_metadata: { 
          nome, 
          plano_ativo: false,
          avatar_url: avatarUrl || null
        } // Inicia inativo, o webhook ativará
      })

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 })
      }

      userId = newUser.user.id
    }

    // Se houver pedido de santo, insere na tabela pedidos_santos
    if (pedidoSanto && pedidoSanto.trim()) {
      try {
        await supabaseAdmin.from('pedidos_santos').insert({
          santo_nome: pedidoSanto.trim(),
          user_id: userId,
          user_email: email
        })
      } catch (dbErr) {
        console.error('Erro ao registrar pedido de santo pre-checkout:', dbErr)
      }
    }

    return NextResponse.json({ success: true, userId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
