import React from 'react';
import { stripe } from '@/lib/stripe';
import { Monitor } from 'lucide-react';

export default async function Pricing() {
  const prices = await stripe.prices.list({ active: true, limit: 10, expand: ['data.product'] })

  let planosRenderizados: any[] = []

  if (prices.data.length > 0) {
    planosRenderizados = prices.data
      .filter((price) => (price.product as any).active === true)
      .map((price) => {
      const produto = price.product as any
      const isAnual = price.recurring?.interval === 'year'
      const valor = price.unit_amount! / 100
      const maxTelas = Number(produto.metadata?.max_telas || 1)

      const beneficios = produto.metadata?.beneficios
        ? produto.metadata.beneficios.split(',').map((b: string) => b.trim())
        : [
            'Acesso ilimitado ao catálogo',
            'Assista em qualquer dispositivo',
            'Vídeos em Full HD (1080p)',
            'Suporte prioritário',
            isAnual
              ? `Economia: 12 meses pelo preço de 10!`
              : 'Cancele quando quiser, sem multa',
          ]

      const precoDisplay = isAnual
        ? `R$ ${(valor / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

      return {
        id: price.id,
        nome: produto.name,
        preco: precoDisplay,
        subpreco: '/mês',
        descricao: produto.description || (isAnual ? 'Cobrado anualmente' : 'Assinatura mensal'),
        link: `/assinar?plan=${price.id}`,
        destaque: isAnual,
        badge: isAnual ? 'Mais Popular' : null,
        cor: isAnual ? 'text-[#D4AF37]' : 'text-[#8197a4]',
        beneficios,
        maxTelas,
      }
    })

    // Mensal primeiro, anual (destaque) por último
    planosRenderizados.sort((a, b) => (a.destaque === b.destaque ? 0 : a.destaque ? 1 : -1))
  } else {
    planosRenderizados = [
      {
        nome: 'Plano Padrão',
        preco: 'R$ --,--',
        subpreco: '/mês',
        descricao: 'Nenhum plano configurado no momento',
        link: '#',
        destaque: true,
        badge: 'Em breve',
        cor: 'text-[#D4AF37]',
        beneficios: ['Aguardando configuração do administrador'],
        maxTelas: 1,
      },
    ]
  }

  return (
    <section
      id="planos"
      className="py-12 md:py-16 px-[4%] text-center"
      style={{ background: '#090B10', borderTop: '1px solid rgba(212,175,55,0.1)', fontFamily: 'Outfit, sans-serif' }}
    >
      <p className="text-[#FFD700] uppercase tracking-widest text-xs font-semibold mb-2">Planos e Preços</p>
      <h2 className="text-2xl md:text-4xl mb-2 font-extrabold text-white">
        Escolha o plano ideal para você
      </h2>
      <p className="text-white/50 text-base mb-8">Cancele quando quiser. Sem taxas escondidas.</p>

      <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch flex-wrap gap-5">
        {planosRenderizados.map((plano) => (
          <div
            key={plano.id || plano.nome}
            className={`relative flex flex-col p-7 rounded-[20px] w-full max-w-[300px] transition-all duration-300 border-2 hover:-translate-y-1 ${
              plano.destaque
                ? 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#FFD700] shadow-[0_8px_40px_rgba(255,215,0,0.15)] md:scale-105 z-10'
                : 'bg-[#1E2E3E] border-white/5 hover:border-white/20'
            }`}
          >
            {/* Badge "Mais Popular" */}
            {plano.badge && (
              <div
                className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[0.8rem] font-bold tracking-[1px] whitespace-nowrap"
                style={{ background: '#22c55e', color: '#fff' }}
              >
                ✦ {plano.badge}
              </div>
            )}

            {/* Nome + descrição */}
            <div className="text-left mb-4">
              <h3 className={`text-[1.35rem] font-extrabold mb-0.5 ${plano.cor}`}>{plano.nome}</h3>
              <p className="text-white/40 text-xs">{plano.descricao}</p>
            </div>

            {/* Preço */}
            <div className="text-left mb-3">
              <span className="text-3xl font-extrabold text-white">{plano.preco}</span>
              <span className="text-white/40 text-sm ml-1">{plano.subpreco}</span>
            </div>

            {/* Badge de telas simultâneas */}
            <div className="flex items-center gap-2 mb-4 text-left">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <Monitor size={12} style={{ color: '#D4AF37' }} />
                <span className="text-[0.7rem] font-bold" style={{ color: '#D4AF37' }}>
                  {plano.maxTelas} tela{plano.maxTelas > 1 ? 's' : ''} simult{plano.maxTelas > 1 ? 'âneas' : 'ânea'}
                </span>
              </div>
            </div>

            {/* Benefícios */}
            <ul className="list-none mb-5 text-left grow space-y-2">
              {plano.beneficios.map((b: string, i: number) => (
                <li key={`${b}-${i}`} className="flex items-start gap-2 text-white/80 text-sm">
                  <span className="text-[#FFD700] font-bold mt-0.5 shrink-0">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            {/* Botão */}
            <a
              href={plano.link}
              className={`flex items-center justify-center w-full py-3 rounded-xl font-bold text-base no-underline transition-all active:scale-95 ${
                plano.destaque
                  ? 'bg-[#FFD700] text-black hover:brightness-110'
                  : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
              }`}
            >
              Assinar agora →
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

