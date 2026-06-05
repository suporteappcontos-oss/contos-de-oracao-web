import React from 'react';
import { stripe } from '@/lib/stripe';
import PricingCardsClient from './PricingCardsClient';

export default async function Pricing() {
  const prices = await stripe.prices.list({ active: true, limit: 30, expand: ['data.product'] })

  const groupedProducts = new Map<string, any>()

  if (prices.data.length > 0) {
    prices.data
      .filter((price) => (price.product as any).active === true)
      .forEach((price) => {
        const prod = price.product as any
        const isAnual = price.recurring?.interval === 'year'
        const isSemestral = price.recurring?.interval === 'month' && (price.recurring?.interval_count ?? 1) === 6
        const isMensal = price.recurring?.interval === 'month' && (price.recurring?.interval_count ?? 1) === 1

        if (!groupedProducts.has(prod.id)) {
          groupedProducts.set(prod.id, {
            id: prod.id,
            nome: prod.name,
            descricao: prod.description || 'Acesso completo à plataforma',
            badge: prod.metadata?.etiqueta || null,
            cor: prod.metadata?.cor || (isAnual ? 'text-[#D4AF37]' : 'text-[#8197a4]'),
            destaque: isAnual || false,
            maxTelas: Number(prod.metadata?.max_telas || 1),
            beneficios: prod.metadata?.beneficios
              ? prod.metadata.beneficios.split(/\|/).map((b: string) => b.trim()).filter(Boolean)
              : [
                'Acesso ilimitado ao catálogo',
                'Assista em qualquer dispositivo',
                'Vídeos em Full HD (1080p)',
                'Suporte prioritário'
              ],
            priceMensal: null,
            priceSemestral: null,
            priceAnual: null,
          })
        }

        const g = groupedProducts.get(prod.id)
        const valor = price.unit_amount! / 100

        if (isAnual) {
          g.priceAnual = { id: price.id, valor }
          g.destaque = true
          g.cor = 'text-[#D4AF37]'
          if (!g.badge) g.badge = 'Mais Popular'
        } else if (isSemestral) {
          g.priceSemestral = { id: price.id, valor }
        } else if (isMensal) {
          g.priceMensal = { id: price.id, valor }
        }
      })
  }

  let produtosArray = Array.from(groupedProducts.values())

  // Destaque no plano com preço anual ou em seu defeito mensal (de acordo com quantidade de telas)
  produtosArray.sort((a, b) => (a.destaque === b.destaque ? 0 : a.destaque ? 1 : -1))

  return (
    <section
      id="planos"
      className="py-6 md:py-12 px-[4%] text-center w-full"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      <PricingCardsClient produtos={produtosArray} />
    </section>
  )
}
