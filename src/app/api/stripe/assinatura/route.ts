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

    // Cria a assinatura interrompida (default_incomplete) para coletar o pagamento via Elements
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
      metadata: { nome, email, plano, userId }
    })

    let clientSecret = null

    // Pode ser um setup intent (se tiver trial) ou payment intent (cobrança imediata)
    if (subscription.pending_setup_intent) {
      const setupIntent = subscription.pending_setup_intent as import('stripe').Stripe.SetupIntent
      clientSecret = setupIntent.client_secret
    } else {
      const invoice = subscription.latest_invoice as import('stripe').Stripe.Invoice
      if (invoice && invoice.payment_intent) {
         const paymentIntent = invoice.payment_intent as import('stripe').Stripe.PaymentIntent
         clientSecret = paymentIntent.client_secret
      }
    }

    if (!clientSecret) {
       return NextResponse.json({ error: 'Não foi possível gerar a chave de pagamento segura.' }, { status: 500 })
    }

    return NextResponse.json({ clientSecret })
  } catch (error: any) {
    console.error('❌ Erro ao criar assinatura Stripe:', error)
    return NextResponse.json({ error: error.message || 'Erro interno ao processar assinatura' }, { status: 500 })
  }
}
