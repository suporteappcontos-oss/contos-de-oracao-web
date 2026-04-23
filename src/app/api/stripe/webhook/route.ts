import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

function formatarNomeCurto(nomeCompleto: string): string {
  const preposicoes = ['de', 'do', 'da', 'dos', 'das', 'e', 'di', 'del']
  const palavras = nomeCompleto.trim().split(/\s+/).filter(Boolean)
  if (palavras.length <= 2) return palavras.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
  const resultado = [palavras[0], palavras[1]]
  if (preposicoes.includes(palavras[1].toLowerCase()) && palavras[2]) resultado.push(palavras[2])
  return resultado.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
}

async function criarOuAtivarUsuario(email: string, nome: string) {
  // Verifica se já existe
  const { data: existente } = await supabaseAdmin.auth.admin.getUserByEmail(email)

  if (existente?.user) {
    // Reativa plano existente
    await supabaseAdmin.auth.admin.updateUserById(existente.user.id, {
      user_metadata: { plano_ativo: true, nome },
    })
    console.log(`🔄 Plano Stripe reativado: ${email}`)
    return
  }

  // Cria novo usuário
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { nome, plano_ativo: true },
  })

  if (error) {
    console.error('❌ Erro ao criar usuário:', error.message)
    return
  }

  // Envia e-mail para criar senha
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.online'
  await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/atualizar-senha`,
  })

  console.log(`🎉 Usuário Stripe criado: ${email}`)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('⛔ Assinatura Stripe inválida:', err)
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  console.log(`🔔 Evento Stripe: ${event.type}`)

  // ── PAGAMENTO APROVADO / ASSINATURA CRIADA ──
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as import('stripe').Stripe.Checkout.Session
    const email = session.customer_email || session.metadata?.email || ''
    const nomeRaw = session.metadata?.nome || session.customer_details?.name || 'Cliente'
    const nome = formatarNomeCurto(nomeRaw)

    if (email) await criarOuAtivarUsuario(email, nome)
  }

  // ── PAGAMENTO RENOVADO ──
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as import('stripe').Stripe.Invoice
    const email = (invoice as { customer_email?: string }).customer_email || ''
    if (email) {
      const { data } = await supabaseAdmin.auth.admin.getUserByEmail(email)
      if (data?.user) {
        await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
          user_metadata: { plano_ativo: true },
        })
        console.log(`✅ Renovação confirmada: ${email}`)
      }
    }
  }

  // ── ASSINATURA CANCELADA / PAGAMENTO FALHOU ──
  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'invoice.payment_failed'
  ) {
    const obj = event.data.object as { customer?: string }
    if (obj.customer) {
      const customer = await stripe.customers.retrieve(obj.customer as string) as import('stripe').Stripe.Customer
      const email = customer.email || ''
      if (email) {
        const { data } = await supabaseAdmin.auth.admin.getUserByEmail(email)
        if (data?.user) {
          await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
            user_metadata: { plano_ativo: false },
          })
          console.log(`🔒 Acesso bloqueado (Stripe): ${email}`)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
