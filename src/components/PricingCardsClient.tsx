'use client';

import React, { useState } from 'react';
import { Monitor, Check } from 'lucide-react';

type PriceInfo = { id: string; valor: number };

type ProdutoInfo = {
  id: string;
  nome: string;
  descricao: string;
  badge: string | null;
  cor: string;
  maxTelas: number;
  beneficios: string[];
  priceMensal: PriceInfo | null;
  priceAnual: PriceInfo | null;
  destaque: boolean;
};

export default function PricingCardsClient({ produtos }: { produtos: ProdutoInfo[] }) {
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal');

  if (produtos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-white/50">
        Nenhum plano configurado no momento.
      </div>
    );
  }

  const temPlanoAnual = produtos.some(p => p.priceAnual !== null);
  const temPlanoMensal = produtos.some(p => p.priceMensal !== null);

  // Auto-selecionar anual se não tiver mensal
  if (!temPlanoMensal && ciclo === 'mensal' && temPlanoAnual) {
    setCiclo('anual');
  }

  return (
    <>
      {temPlanoAnual && temPlanoMensal && (
        <div className="flex justify-center mb-12">
          <div className="bg-[#111827] p-1.5 rounded-full border border-white/10 flex items-center shadow-lg relative">
            <button
              onClick={() => setCiclo('mensal')}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors ${
                ciclo === 'mensal' ? 'text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setCiclo('anual')}
              className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${
                ciclo === 'anual' ? 'text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Anual
              <span className={`text-[0.65rem] px-2.5 py-0.5 rounded-full font-black ${ciclo === 'anual' ? 'bg-black text-white' : 'bg-[#22c55e] text-white'}`}>
                + Econômico
              </span>
            </button>
            
            {/* Fundo Animado do Switch */}
            <div 
              className={`absolute top-1.5 bottom-1.5 bg-[#D4AF37] rounded-full transition-transform duration-300 ease-out`}
              style={{ 
                width: 'calc(50% - 6px)',
                transform: ciclo === 'mensal' ? 'translateX(0)' : 'translateX(100%)' 
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch flex-wrap gap-6 md:gap-8">
        {produtos.map((plano) => {
          const isAnual = ciclo === 'anual' && plano.priceAnual ? true : !plano.priceMensal;
          const precoExibido = isAnual ? plano.priceAnual : plano.priceMensal;
          
          if (!precoExibido) return null;

          return (
            <div
              key={plano.id}
              className={`relative flex flex-col p-8 rounded-[24px] w-full max-w-[340px] transition-all duration-300 border-2 hover:-translate-y-2 ${
                plano.destaque
                  ? 'bg-gradient-to-b from-[#1a1a2e] to-[#0f1423] border-[#D4AF37] shadow-[0_15px_50px_rgba(212,175,55,0.15)] md:scale-105 z-10'
                  : 'bg-[#111827] border-white/5 hover:border-white/20'
              }`}
            >
              {plano.badge && (
                <div
                  className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[0.75rem] font-bold tracking-[1px] uppercase whitespace-nowrap shadow-md"
                  style={{ background: '#22c55e', color: '#fff' }}
                >
                  ✦ {plano.badge}
                </div>
              )}

              <div className="text-left mb-6">
                <h3 className={`text-2xl font-extrabold mb-1 ${plano.cor}`}>{plano.nome}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{plano.descricao}</p>
              </div>

              <div className="text-left mb-6 min-h-[60px]">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white tracking-tight">
                    R$ {precoExibido.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/40 text-sm font-medium mb-1">
                    /{isAnual ? 'ano' : 'mês'}
                  </span>
                </div>
                {isAnual && plano.priceMensal && (
                  <div className="text-[#D4AF37] text-[0.8rem] font-bold mt-2">
                    Equivale a R$ {(precoExibido.valor / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /mês
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6 text-left">
                <div
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg w-full"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
                >
                  <Monitor size={14} style={{ color: '#D4AF37' }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D4AF37' }}>
                    {plano.maxTelas} tela{plano.maxTelas > 1 ? 's' : ''} simult{plano.maxTelas > 1 ? 'âneas' : 'ânea'}
                  </span>
                </div>
              </div>

              {/* Lista de Benefícios */}
              <div className="text-left mb-8 flex-1">
                <ul className="space-y-3.5">
                  {plano.beneficios.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/90 text-[0.9rem] leading-snug">
                      <Check size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`/assinar?plan=${precoExibido.id}`}
                className={`flex items-center justify-center w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95 ${
                  plano.destaque
                    ? 'bg-[#D4AF37] text-black shadow-[0_5px_20px_rgba(212,175,55,0.3)] hover:brightness-110'
                    : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                }`}
              >
                Assinar Agora →
              </a>
            </div>
          );
        })}
      </div>
    </>
  );
}
