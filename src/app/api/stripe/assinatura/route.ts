import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plano, nome, email, senha, avatarUrl, pedidoSanto, whatsapp, modeloTv, dispositivoCelular, testadorAndroidCelular, testadorAndroidTv } = body

    // Verifica se o usuário está logado
    const supabaseClient = await createClient()
    const { data: { session } } = await supabaseClient.auth.getSession()
    const isLogged = !!session

    if (process.env.NEXT_PUBLIC_PAUSAR_ASSINATURAS !== 'false') {
      return NextResponse.json({ error: 'As novas assinaturas estão temporariamente pausadas para reformulação dos planos. Em breve reabriremos!' }, { status: 400 })
    }

    if (!plano || !email) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    if (!isLogged && !senha) {
      return NextResponse.json({ error: 'A senha é obrigatória para criar uma nova conta' }, { status: 400 })
    }

    // ── CRIA OU ATUALIZA O USUÁRIO NO SUPABASE ──
    const existente = await buscarUsuarioPorEmail(email)
    let userId = ''

    if (existente) {
      if (!isLogged) {
         // O email existe, mas a pessoa não está logada. Não podemos deixá-la avançar sem provar que é dona da conta.
         return NextResponse.json({ error: 'Este e-mail já possui uma conta cadastrada. Faça login para continuar.' }, { status: 400 })
      }
      userId = existente.id

      // Atualiza metadados do usuário existente se novos dados forem fornecidos
      const metadataAtual = existente.user_metadata || {}
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...metadataAtual,
          whatsapp: whatsapp || metadataAtual.whatsapp,
          modelo_tv: modeloTv || metadataAtual.modelo_tv,
          dispositivo_celular: dispositivoCelular || metadataAtual.dispositivo_celular,
          testador_android_celular: testadorAndroidCelular ?? metadataAtual.testador_android_celular,
          testador_android_tv: testadorAndroidTv ?? metadataAtual.testador_android_tv
        }
      })
    } else {
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
        return NextResponse.json({ error: 'Erro ao criar conta: ' + createError.message }, { status: 400 })
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
        console.error('Erro ao registrar pedido de santo:', dbErr)
      }
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.com.br'

    // Em vez de manipular faturas manualmente, usamos o novo "Checkout Embutido" do Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page' as any,
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

    if (!stripeSession.client_secret) {
       console.error("DEBUG STRIPE SESSION:", JSON.stringify(stripeSession, null, 2));
       return NextResponse.json({ error: 'Não foi possível gerar a sessão de checkout embutida.' }, { status: 500 })
    }

    return NextResponse.json({ clientSecret: stripeSession.client_secret })
  } catch (error: any) {
    console.error('❌ Erro ao criar sessão Stripe Embutida:', error)
    return NextResponse.json({ error: error.message || 'Erro interno ao processar assinatura' }, { status: 500 })
  }
}
