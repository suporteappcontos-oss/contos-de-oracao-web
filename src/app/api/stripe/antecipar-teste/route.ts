import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    let email = ''
    let userId = ''

    // 1. Tenta autenticação via Sessão Supabase (Web)
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        email = user.email.toLowerCase()
        userId = user.id
      }
    } catch (e) {
      // Ignora erro de sessão e tenta via body/header
    }

    // 2. Se não encontrou por sessão, verifica se veio no body (App Mobile com Auth)
    if (!email) {
      try {
        const body = await request.json()
        if (body.email) {
          email = body.email.toLowerCase().trim()
        }
      } catch (e) {
        // Ignora erro de body
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Usuário não autenticado ou e-mail não informado' }, { status: 401 })
    }

    const usuario = await buscarUsuarioPorEmail(email)
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    userId = usuario.id

    // 3. Busca cliente na Stripe
    const customers = await stripe.customers.list({ email, limit: 1 })
    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'Assinatura Stripe não localizada para este e-mail' }, { status: 404 })
    }

    const customerId = customers.data[0].id

    // 4. Busca assinaturas em período de teste (`trialing`)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'trialing',
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      // Se não há assinatura em trialing, verifica se já está ativa
      const activeSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      })

      if (activeSubs.data.length > 0) {
        // Já está ativa! Atualiza o Supabase por garantia
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { ...usuario.user_metadata, em_teste: false, plano_ativo: true },
        })
        return NextResponse.json({
          sucesso: true,
          mensagem: 'Sua assinatura já está ativa e cobrada! Downloads liberados.',
        })
      }

      return NextResponse.json(
        { error: 'Nenhuma assinatura em período de teste encontrada para encerrar.' },
        { status: 400 }
      )
    }

    const assinaturaEmTeste = subscriptions.data[0]

    // 5. Encerra o período de teste AGORA (trial_end: 'now') -> Força cobrança imediata
    const assinaturaAtualizada = await stripe.subscriptions.update(assinaturaEmTeste.id, {
      trial_end: 'now',
    })

    // 6. Atualiza o metadata no Supabase marcando que NÃO está mais em teste
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...usuario.user_metadata,
        em_teste: false,
        plano_ativo: true,
        status_stripe: assinaturaAtualizada.status,
      },
    })

    console.log(`⚡ Teste antecipado e cobrança efetuada com sucesso para: ${email}`)

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Cobrança efetuada com sucesso! Período de teste encerrado e todos os downloads estão liberados.',
      status: assinaturaAtualizada.status,
    })
  } catch (error: any) {
    console.error('❌ Erro ao antecipar teste no Stripe:', error.message || error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar cobrança imediata no Stripe. Verifique os dados do cartão.' },
      { status: 500 }
    )
  }
}
