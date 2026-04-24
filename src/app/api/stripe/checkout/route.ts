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
      // Opcional: Se ele digitou senha, podemos atualizar a senha dele? 
      // Por segurança, se já existe, nós NÃO sobrescrevemos a senha sem login. 
      // Apenas pegamos o ID.
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

    // O frontend agora envia diretamente o 'plan' como o priceId (ex: price_123)
    let priceId = plano

    // Valida se o priceId existe no Stripe
    if (!priceId || !priceId.startsWith('price_')) {
      return NextResponse.json({ error: `ID de plano inválido: ${priceId}` }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.online'

    // Cria sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',

      customer_email: email,
      client_reference_id: userId,
      locale: 'pt-BR',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { nome, email, plano },
      subscription_data: {
        metadata: { nome, email, plano },
      },
      success_url: `${siteUrl}/sucesso`,
      cancel_url: `${siteUrl}/assinar?cancelado=true`,
      allow_promotion_codes: true, // Permite cupons de desconto
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('❌ Erro ao criar sessão Stripe:', error)
    return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 })
  }
}
