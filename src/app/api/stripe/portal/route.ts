import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.online'

    // Busca ou cria o customer Stripe pelo email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 })
    const customerId = customers.data[0]?.id

    if (!customerId) {
      return NextResponse.json({ error: 'Cliente não encontrado no Stripe' }, { status: 404 })
    }

    // Cria sessão do portal do cliente (gerenciar plano, trocar cartão, cancelar)
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/perfil`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('❌ Erro ao criar portal Stripe:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
