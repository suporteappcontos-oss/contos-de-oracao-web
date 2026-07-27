import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha, avatarUrl, pedidoSanto, whatsapp, modeloTv, dispositivoCelular, testadorAndroidCelular, testadorAndroidTv } = await request.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 })
    }

    const existente = await buscarUsuarioPorEmail(email)
    let userId = ''

    if (existente) {
      // Usuário já existe (Lead ou Conta anterior) — atualiza os dados e a senha caso a pessoa tenha alterado no formulário
      userId = existente.id
      const updateData: any = {
        user_metadata: {
          ...(existente.user_metadata || {}),
          nome: nome || existente.user_metadata?.nome,
          whatsapp: whatsapp || existente.user_metadata?.whatsapp,
          avatar_url: avatarUrl || existente.user_metadata?.avatar_url,
          modelo_tv: modeloTv || existente.user_metadata?.modelo_tv,
          dispositivo_celular: dispositivoCelular || existente.user_metadata?.dispositivo_celular,
          testador_android_celular: testadorAndroidCelular ?? existente.user_metadata?.testador_android_celular,
          testador_android_tv: testadorAndroidTv ?? existente.user_metadata?.testador_android_tv
        }
      }
      if (senha) {
        updateData.password = senha
      }
      await supabaseAdmin.auth.admin.updateUserById(userId, updateData)
    } else {
      // Cria o usuário com a senha escolhida antes de ir para Kiwify
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { 
          nome, 
          plano_ativo: false,
          avatar_url: avatarUrl || null,
          whatsapp: whatsapp || null,
          modelo_tv: modeloTv || null,
          dispositivo_celular: dispositivoCelular || null,
          testador_android_celular: !!testadorAndroidCelular,
          testador_android_tv: !!testadorAndroidTv
        }
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
