import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente Admin do Supabase (com poderes totais para criar usuários)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Chave secreta de Admin
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ✅ HELPER: Busca um usuário pelo e-mail de forma eficiente (sem trazer todos)
async function buscarUsuarioPorEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error || !data) return null
  return data.users.find(u => u.email === email) ?? null
}

export async function POST(request: NextRequest) {
  try {
    // Verificar o token secreto da Kiwify
    const tokenRecebido = request.headers.get('x-kiwify-token') || request.nextUrl.searchParams.get('token') || ''
    const tokenEsperado = process.env.KIWIFY_WEBHOOK_TOKEN || ''

    if (tokenEsperado && tokenRecebido !== tokenEsperado) {
      console.warn('⛔ Token inválido recebido:', tokenRecebido)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

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

      const jaExiste = await buscarUsuarioPorEmail(email)

      if (!jaExiste) {
        // ✅ CORRIGIDO: Criar usuário SEM senha (o cliente vai criar a própria senha)
        // email_confirm: true = e-mail já confirmado automaticamente (não precisa clicar em link)
        const { error: erroCreate } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            nome,
            produto,
            plano_ativo: true,
          }
        })

        if (erroCreate) {
          console.error('❌ Erro ao criar usuário:', erroCreate.message)
        } else {
          console.log(`🎉 Usuário criado com sucesso: ${email}`)

          // ✅ CORRIGIDO: Enviar e-mail de "Configurar sua senha" para o cliente
          // O cliente recebe um link, clica, cria a própria senha e já acessa a plataforma
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contos-de-oracao-web.vercel.app'
          const { error: erroReset } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/login`,
          })

          if (erroReset) {
            console.warn('⚠️ Erro ao enviar e-mail de configuração de senha:', erroReset.message)
          } else {
            console.log(`📧 E-mail de "Configurar senha" enviado para: ${email}`)
          }
        }
      } else {
        // Usuário já existe — reativar assinatura
        await supabaseAdmin.auth.admin.updateUserById(jaExiste.id, {
          user_metadata: { plano_ativo: true }
        })
        console.log(`🔄 Assinatura reativada para: ${email}`)
      }
    }

    // Evento de cancelamento ou reembolso
    if (evento === 'refunded' || evento === 'canceled' || evento === 'subscription_canceled') {
      console.log(`🚫 Cancelamento para: ${email}`)

      const usuario = await buscarUsuarioPorEmail(email)

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
