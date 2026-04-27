import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plano, nome, email, senha } = body

    if (!plano || !email || !senha) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // ── CRIA OU ATUALIZA O USUÁRIO NO SUPABASE ──
    const existente = await buscarUsuarioPorEmail(email)
    let userId = ''

    if (existente) {
      userId = existente.id
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome, plano_ativo: false }
      })
      if (createError) {
        return NextResponse.json({ error: 'Erro ao criar conta: ' + createError.message }, { status: 400 })
      }
      userId = newUser.user.id
    }

    // Cria ou busca o cliente na Stripe
    let stripeCustomerId = ''
    const customers = await stripe.customers.list({ email: email, limit: 1 })
    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email,
        name: nome,
        metadata: { userId }
      })
      stripeCustomerId = customer.id
    }

    const priceId = plano

    if (!priceId || !priceId.startsWith('price_')) {
      return NextResponse.json({ error: `ID de plano inválido: ${priceId}` }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.online'

    // Em vez de manipular faturas manualmente, usamos o novo "Checkout Embutido" do Stripe
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded' as any,
      mode: 'subscription',
      customer_email: email,
      client_reference_id: userId,
      locale: 'pt-BR',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { nome, email, plano },
      subscription_data: {
        metadata: { nome, email, plano },
      },
      return_url: `${siteUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      allow_promotion_codes: true,
    })

    if (!session.client_secret) {
       console.error("DEBUG STRIPE SESSION:", JSON.stringify(session, null, 2));
       return NextResponse.json({ error: 'Não foi possível gerar a sessão de checkout embutida.' }, { status: 500 })
    }

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error: any) {
    console.error('❌ Erro ao criar sessão Stripe Embutida:', error)
    return NextResponse.json({ error: error.message || 'Erro interno ao processar assinatura' }, { status: 500 })
  }
}
