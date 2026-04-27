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

    // Lógica defensiva para buscar o clientSecret mesmo se o expand falhar ou for string
    if (subscription.pending_setup_intent) {
      if (typeof subscription.pending_setup_intent === 'string') {
        const setupIntent = await stripe.setupIntents.retrieve(subscription.pending_setup_intent)
        clientSecret = setupIntent.client_secret
      } else {
        const setupIntent = subscription.pending_setup_intent as any
        clientSecret = setupIntent.client_secret
      }
    } else if (subscription.latest_invoice) {
      let invoice = subscription.latest_invoice as any
      if (typeof invoice === 'string') {
        invoice = await stripe.invoices.retrieve(invoice)
      }
      
      if (invoice && invoice.payment_intent) {
        if (typeof invoice.payment_intent === 'string') {
          const pi = await stripe.paymentIntents.retrieve(invoice.payment_intent)
          clientSecret = pi.client_secret
        } else {
          clientSecret = invoice.payment_intent.client_secret
        }
    if (!clientSecret) {
       console.error("DEBUG STRIPE API:", JSON.stringify(subscription, null, 2));
       return NextResponse.json({ 
         error: 'DEBUG: ' + JSON.stringify({
            status: subscription.status,
            invoice: typeof subscription.latest_invoice,
            pi: (subscription.latest_invoice as any)?.payment_intent,
            setup: subscription.pending_setup_intent
         }) 
       }, { status: 500 })
    }

    return NextResponse.json({ clientSecret })
  } catch (error: any) {
    console.error('❌ Erro ao criar assinatura Stripe:', error)
    return NextResponse.json({ error: error.message || 'Erro interno ao processar assinatura' }, { status: 500 })
  }
}
