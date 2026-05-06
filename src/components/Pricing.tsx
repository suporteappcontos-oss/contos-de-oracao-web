import React from 'react';
import { stripe } from '@/lib/stripe';
import PricingCardsClient from './PricingCardsClient';

export default async function Pricing() {
  const prices = await stripe.prices.list({ active: true, limit: 10, expand: ['data.product'] })

  const groupedProducts = new Map<string, any>()

  if (prices.data.length > 0) {
    prices.data
      .filter((price) => (price.product as any).active === true)
      .forEach((price) => {
        const prod = price.product as any
        const isAnual = price.recurring?.interval === 'year'
        
        if (!groupedProducts.has(prod.id)) {
          groupedProducts.set(prod.id, {
            id: prod.id,
            nome: prod.name,
            descricao: prod.description || 'Acesso completo à plataforma',
            badge: prod.metadata?.etiqueta || null,
            cor: prod.metadata?.cor || (isAnual ? 'text-[#D4AF37]' : 'text-[#8197a4]'),
            destaque: isAnual || false, // Se tiver plano anual, o card ganha destaque
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
            priceAnual: null,
          })
        }
        
        const g = groupedProducts.get(prod.id)
        const valor = price.unit_amount! / 100
        
        if (isAnual) {
           g.priceAnual = { id: price.id, valor }
           g.destaque = true // Garante que se tiver anual, é destaque
           g.cor = 'text-[#D4AF37]' // Atualiza cor se for destaque
           if (!g.badge) g.badge = 'Mais Popular' // Fallback
        } else {
           g.priceMensal = { id: price.id, valor }
        }
      })
  }

  let produtosArray = Array.from(groupedProducts.values())
  
  // Ordena para que os em destaque fiquem por último ou numa ordem legal
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

