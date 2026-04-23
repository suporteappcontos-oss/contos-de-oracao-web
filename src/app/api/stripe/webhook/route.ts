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

async function criarOuAtivarUsuario(email: string, nome: string) {
  const existente = await buscarUsuarioPorEmail(email)

  if (existente) {
    await supabaseAdmin.auth.admin.updateUserById(existente.id, {
      user_metadata: { plano_ativo: true, nome },
    })
    console.log(`🔄 Plano Stripe reativado: ${email}`)
    return
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { nome, plano_ativo: true },
  })

  if (error) {
    console.error('❌ Erro ao criar usuário Stripe:', error.message)
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.online'
  await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/atualizar-senha`,
  })
  console.log(`🎉 Usuário Stripe criado: ${email}`)
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
    if (email) await criarOuAtivarUsuario(email, formatarNomeCurto(nomeRaw))
  }

  // ── RENOVAÇÃO DE ASSINATURA ──
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as import('stripe').Stripe.Invoice & { customer_email?: string }
    const email = invoice.customer_email ?? ''
    if (email) {
      const usuario = await buscarUsuarioPorEmail(email)
      if (usuario) {
        await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
          user_metadata: { plano_ativo: true },
        })
        console.log(`✅ Renovação Stripe confirmada: ${email}`)
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
