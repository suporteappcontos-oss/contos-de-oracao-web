import React from 'react';
import { stripe } from '@/lib/stripe';

export default async function Pricing() {
  // Busca produto e preços do Stripe dinamicamente
  const prices = await stripe.prices.list({ active: true, limit: 10, expand: ['data.product'] })

  let planosRenderizados = []

  if (prices.data.length > 0) {
    planosRenderizados = prices.data.map((price, index) => {
      const produto = price.product as any
      const isAnual = price.recurring?.interval === 'year'
      const valor = price.unit_amount! / 100
      
      let precoDisplay = ''
      let subpreco = ''
      let beneficios = produto.metadata?.beneficios 
        ? produto.metadata.beneficios.split(',').map((b: string) => b.trim())
        : [
            'Acesso ilimitado ao catálogo',
            'Resolução Full HD',
            'Suporte prioritário',
            isAnual ? `Cobrança única de R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Cancele quando quiser'
          ]
      
      if (isAnual) {
        precoDisplay = `R$ ${(valor / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        subpreco = '/mês'
      } else {
        precoDisplay = `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        subpreco = '/mês'
      }
      
      return {
        id: price.id,
        nome: produto.name,
        preco: precoDisplay,
        subpreco: subpreco,
        descricao: produto.description || (isAnual ? 'Cobrado anualmente' : 'Assinatura mensal'),
        link: `/assinar?plan=${price.id}`,
        destaque: isAnual,
        badge: isAnual ? 'Melhor Opção' : null,
        cor: isAnual ? 'text-[#D4AF37]' : 'text-[#8197a4]',
        beneficios: beneficios
      }
    })
    
    // Opcional: ordenar para que os anuais fiquem por último, ou pelo valor
    planosRenderizados.sort((a, b) => a.destaque === b.destaque ? 0 : a.destaque ? 1 : -1)
  } else {
    // Fallback: se o Admin apagou todos os produtos
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
      }
    ]
  }

  return (
    <section id="planos" className="py-[80px] px-[4%] text-center" style={{ background: '#090B10', borderTop: '1px solid rgba(212,175,55,0.1)', fontFamily: 'Outfit, sans-serif' }}>
      <p className="text-[#FFD700] uppercase tracking-widest text-sm font-semibold mb-4">Planos e Preços</p>
      <h2 className="text-3xl md:text-[2.8rem] mb-4 font-extrabold text-white">
        Escolha o plano ideal para você
      </h2>
      <p className="text-white/50 text-lg mb-[60px]">Cancele quando quiser. Sem taxas escondidas.</p>

      <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch flex-wrap gap-[30px]">
        {planosRenderizados.map((plano) => (
          <div
            key={plano.nome}
            className={`relative flex flex-col p-[40px] rounded-[20px] w-full max-w-[320px] transition-all duration-300 border-2 hover:-translate-y-2 ${
              plano.destaque
                ? 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#FFD700] shadow-[0_8px_40px_rgba(255,215,0,0.15)] md:scale-105 z-10'
                : 'bg-[#1E2E3E] border-white/5 hover:border-white/20'
            }`}
          >
            {plano.badge && (
              <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-[#FFD700] text-black px-4 py-1 rounded-full text-[0.85rem] font-bold tracking-[1px] whitespace-nowrap">
                {plano.badge}
              </div>
            )}

            <div className="text-left mb-6">
              <h3 className={`text-[1.6rem] font-extrabold mb-1 ${plano.cor}`}>{plano.nome}</h3>
              <p className="text-white/40 text-sm">{plano.descricao}</p>
            </div>

            <div className="text-left mb-8">
              <span className="text-4xl font-extrabold text-white">{plano.preco}</span>
              <span className="text-white/40 text-base ml-1">{plano.subpreco}</span>
            </div>

            <ul className="list-none mb-8 text-left grow space-y-4">
              {plano.beneficios.map((b) => (
                <li key={b} className="flex items-start gap-3 text-white/80 text-[1rem]">
                  <span className="text-[#FFD700] font-bold mt-0.5">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            <a
              href={plano.link}
              className={`flex items-center justify-center w-full py-4 rounded-xl font-bold text-[1.1rem] no-underline transition-all active:scale-95 ${
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
  );
}
