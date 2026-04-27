import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'

function formatarNomeCurto(nomeCompleto: string): string {
  const preposicoes = ['de', 'do', 'da', 'dos', 'das', 'e', 'di', 'del']
  const palavras = nomeCompleto.trim().split(/\s+/).filter(Boolean)
  if (palavras.length <= 2) return palavras.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
  const resultado = [palavras[0], palavras[1]]
  if (preposicoes.includes(palavras[1].toLowerCase()) && palavras[2]) resultado.push(palavras[2])
  return resultado.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
}

async function criarOuAtivarUsuario(
  email: string,
  nome: string,
  maxTelas: number = 1,
  productId: string = ''
) {
  const existente = await buscarUsuarioPorEmail(email)
  const metaAtualizado = { plano_ativo: true, nome, max_telas: maxTelas, stripe_product_id: productId }

  if (existente) {
    await supabaseAdmin.auth.admin.updateUserById(existente.id, {
      user_metadata: metaAtualizado,
    })
    console.log(`🔄 Plano Stripe reativado: ${email} | max_telas: ${maxTelas}`)
    return
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: metaAtualizado,
  })

  if (error) {
    console.error('❌ Erro ao criar usuário Stripe:', error.message)
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.online'
  await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/atualizar-senha`,
  })
  console.log(`🎉 Usuário Stripe criado: ${email} | max_telas: ${maxTelas}`)
}

// Importante: o Stripe envia o body como raw text para validar a assinatura HMAC

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  let event: import('stripe').Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('⛔ Assinatura Stripe inválida:', err)
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  console.log(`🔔 Evento Stripe: ${event.type}`)

  // ── CHECKOUT CONCLUÍDO (primeira compra) ──
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as import('stripe').Stripe.Checkout.Session
    const email = session.customer_email || session.metadata?.email || ''
    const nomeRaw = session.metadata?.nome || session.customer_details?.name || 'Cliente'

    // Busca max_telas do produto comprado
    let maxTelas = 1
    let productId = ''
    try {
      const priceId = (session as any).line_items?.data?.[0]?.price?.id
        || session.metadata?.plano || ''
      if (priceId && priceId.startsWith('price_')) {
        const price = await stripe.prices.retrieve(priceId, { expand: ['product'] })
        const product = price.product as import('stripe').Stripe.Product
        maxTelas = Number(product.metadata?.max_telas || 1)
        productId = product.id
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível buscar max_telas, usando 1 como padrão.')
    }

    if (email) await criarOuAtivarUsuario(email, formatarNomeCurto(nomeRaw), maxTelas, productId)
  }

  // ── ASSINATURA CONCLUÍDA (Stripe Elements) ou RENOVAÇÃO ──
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as import('stripe').Stripe.Invoice & { customer_email?: string }
    const email = invoice.customer_email ?? ''
    if (email) {
      const usuario = await buscarUsuarioPorEmail(email)
      if (usuario) {
        let maxTelas = 1;
        let productId = '';
        try {
          const priceId = (invoice.lines?.data?.[0] as any)?.price?.id;
          if (priceId) {
            const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
            const product = price.product as import('stripe').Stripe.Product;
            maxTelas = Number(product.metadata?.max_telas || 1);
            productId = product.id;
          }
        } catch (e) { console.warn('Erro ao buscar metadados do plano') }

        await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
          user_metadata: { plano_ativo: true, max_telas: maxTelas, stripe_product_id: productId },
        })
        console.log(`✅ Pagamento Stripe confirmado (Acesso Liberado): ${email}`)
      }
    }
  }

  // ── CANCELAMENTO / PAGAMENTO FALHOU ──
  if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
    const obj = event.data.object as { customer?: string }
    if (obj.customer) {
      const customer = await stripe.customers.retrieve(obj.customer as string) as import('stripe').Stripe.Customer
      const email = customer.email ?? ''
      if (email) {
        const usuario = await buscarUsuarioPorEmail(email)
        if (usuario) {
          await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
            user_metadata: { plano_ativo: false },
          })
          console.log(`🔒 Acesso Stripe bloqueado: ${email}`)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
