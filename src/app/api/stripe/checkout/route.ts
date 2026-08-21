import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'
import { CircuitBreaker } from '@/lib/circuit-breaker'

// Instanciado fora do escopo da requisição para persistir na memória (estado quente do serverless)
const stripeCircuitBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 10000 });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plano, nome, email, senha } = body

    if (process.env.NEXT_PUBLIC_PAUSAR_ASSINATURAS !== 'false') {
      return NextResponse.json({ error: 'As novas assinaturas estão temporariamente pausadas para reformulação dos planos. Em breve reabriremos!' }, { status: 400 })
    }

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

    let priceId = plano

    if (!priceId || !priceId.startsWith('price_')) {
      return NextResponse.json({ error: `ID de plano inválido: ${priceId}` }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.com.br'

    // Usa o Circuit Breaker para proteger a chamada externa à Stripe
    try {
      const session = await stripeCircuitBreaker.execute(() => 
        stripe.checkout.sessions.create({
          mode: 'subscription',
          customer_email: email,
          client_reference_id: userId,
          locale: 'pt-BR',
          line_items: [{ price: priceId, quantity: 1 }],
          metadata: { nome, email, plano },
          subscription_data: {
            trial_period_days: 7,
            metadata: { nome, email, plano },
          },
          success_url: `${siteUrl}/sucesso`,
          cancel_url: `${siteUrl}/assinar?cancelado=true`,
          allow_promotion_codes: true,
        })
      );

      return NextResponse.json({ url: session.url })
    } catch (cbError: any) {
      if (cbError.message === 'CircuitBreaker is OPEN') {
        console.warn('⚠️ Requisição rejeitada pelo Circuit Breaker. Serviço temporariamente congestionado.');
        return NextResponse.json(
          { error: 'Sistema de pagamento temporariamente congestionado. Por favor, tente novamente em alguns instantes.' },
          { status: 503 }
        );
      }
      throw cbError; // Repassa para o catch principal se não for erro de circuito aberto
    }
  } catch (error) {
    console.error('❌ Erro ao processar requisição de checkout:', error)
    return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 })
  }
}
