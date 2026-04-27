import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const prices = await stripe.prices.list({ active: true, limit: 10, expand: ['data.product'] })
    
    const planos = prices.data
      .filter(price => (price.product as any).active === true)
      .map(price => ({
        id: price.id,
        valor: price.unit_amount,
        intervalo: price.recurring?.interval,
        produto: {
          id: (price.product as any).id,
          nome: (price.product as any).name,
          beneficios: (price.product as any).metadata?.beneficios
        }
      }))

    // Ordenar do maior para o menor valor (Premium primeiro)
    planos.sort((a, b) => (b.valor || 0) - (a.valor || 0))

    return NextResponse.json({ planos })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 })
  }
}
