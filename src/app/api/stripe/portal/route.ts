import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'
import { CircuitBreaker } from '@/lib/circuit-breaker'

// Instanciado fora do escopo da requisição
const portalCircuitBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 10000 });

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.com.br'

    try {
      const url = await portalCircuitBreaker.execute(async () => {
        // Busca ou cria o customer Stripe pelo email
        const customers = await stripe.customers.list({ email: user.email, limit: 1 })
        const customerId = customers.data[0]?.id

        if (!customerId) {
          throw new Error('NOT_FOUND');
        }

        // Cria sessão do portal do cliente (gerenciar plano, trocar cartão, cancelar)
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${siteUrl}/perfil`,
        })

        return session.url;
      });

      return NextResponse.json({ url })

    } catch (cbError: any) {
      if (cbError.message === 'CircuitBreaker is OPEN') {
        console.warn('⚠️ Requisição rejeitada pelo Circuit Breaker (Portal).');
        return NextResponse.json(
          { error: 'Sistema temporariamente indisponível. Tente acessar o portal em alguns minutos.' },
          { status: 503 }
        );
      }
      
      if (cbError.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Cliente não encontrado no Stripe' }, { status: 404 })
      }

      throw cbError; // Vai para o catch principal
    }

  } catch (error) {
    console.error('❌ Erro ao acessar portal Stripe:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
