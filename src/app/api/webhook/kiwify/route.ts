import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente Admin do Supabase (com poderes totais para criar usuários)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Chave secreta de Admin
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🔔 Webhook Kiwify recebido:', JSON.stringify(body, null, 2))

    // Identificar tipo de evento da Kiwify
    const evento = body?.data?.status || body?.event || ''
    const email = body?.data?.customer?.email || body?.customer?.email || ''
    const nome = body?.data?.customer?.name || body?.customer?.name || 'Cliente'
    const produto = body?.data?.product?.name || 'Contos de Oração'

    // Se não tem email, ignorar
    if (!email) {
      return NextResponse.json({ message: 'Email não encontrado, ignorado.' }, { status: 200 })
    }

    // Evento de compra aprovada (paid) ou assinatura ativa
    if (evento === 'paid' || evento === 'active' || evento === 'order_approved') {
      console.log(`✅ Compra aprovada para: ${email}`)

      // Tentar criar o usuário no Supabase Auth
      const { data: usuarioExistente } = await supabaseAdmin.auth.admin.listUsers()
      const jaExiste = usuarioExistente?.users?.find(u => u.email === email)

      if (!jaExiste) {
        // Criar usuário novo com senha temporária
        const senhaTemporal = `Contos@${Math.random().toString(36).slice(2, 10)}`
        
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: senhaTemporal,
          email_confirm: true, // Confirmar email automaticamente
          user_metadata: {
            nome,
            produto,
            plano_ativo: true,
          }
        })

        if (error) {
          console.error('❌ Erro ao criar usuário:', error.message)
        } else {
          console.log(`🎉 Usuário criado com sucesso: ${email}`)
        }
      } else {
        // Usuário já existe — atualizar metadados de assinatura ativa
        await supabaseAdmin.auth.admin.updateUserById(jaExiste.id, {
          user_metadata: { plano_ativo: true }
        })
        console.log(`🔄 Assinatura reativada para: ${email}`)
      }
    }

    // Evento de cancelamento ou reembolso
    if (evento === 'refunded' || evento === 'canceled' || evento === 'subscription_canceled') {
      console.log(`🚫 Cancelamento para: ${email}`)

      const { data: usuarioExistente } = await supabaseAdmin.auth.admin.listUsers()
      const usuario = usuarioExistente?.users?.find(u => u.email === email)

      if (usuario) {
        await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
          user_metadata: { plano_ativo: false }
        })
        console.log(`🔒 Acesso bloqueado para: ${email}`)
      }
    }

    return NextResponse.json({ received: true, status: 'ok' }, { status: 200 })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
