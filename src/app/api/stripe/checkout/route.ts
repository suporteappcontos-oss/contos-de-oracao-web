import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plano, nome, email } = body

    if (!plano || !email) {
      return NextResponse.json({ error: 'Plano e email são obrigatórios' }, { status: 400 })
    }

    // Escolhe o Price ID correto (busca das variáveis ou dinamicamente do Stripe)
    let priceId = plano === 'anual' ? process.env.STRIPE_PRICE_ANUAL : process.env.STRIPE_PRICE_MENSAL

    // Se o preço ainda estiver pendente (variável padrão), busca o preço ativo no Stripe dinamicamente
    if (!priceId || priceId.includes('PENDENTE') || priceId === 'price_COLOQUE_AQUI') {
      const { data: prices } = await stripe.prices.list({
        active: true,
        limit: 10,
        expand: ['data.product']
      })
      
      const intervaloBuscado = plano === 'anual' ? 'year' : 'month'
      const priceAtivo = prices.find(p => p.recurring?.interval === intervaloBuscado)
      
      if (priceAtivo) {
        priceId = priceAtivo.id
      } else {
        return NextResponse.json({ error: `Nenhum plano ${plano} cadastrado no Stripe ainda.` }, { status: 400 })
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.online'

    // Cria sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      locale: 'pt-BR',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { nome, email, plano },
      subscription_data: {
        metadata: { nome, email, plano },
      },
      success_url: `${siteUrl}/atualizar-senha?checkout=sucesso&email=${encodeURIComponent(email)}`,
      cancel_url: `${siteUrl}/assinar?cancelado=true`,
      allow_promotion_codes: true, // Permite cupons de desconto
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('❌ Erro ao criar sessão Stripe:', error)
    return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 })
  }
}
