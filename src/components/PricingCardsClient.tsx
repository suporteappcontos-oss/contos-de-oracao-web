'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Check, ChevronDown, ChevronUp } from 'lucide-react';

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

// Animação de partículas douradas simples via CSS inline
const ParticlesBanner = ({ destaque }: { destaque: boolean }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const particles = [
    { left: '10%', delay: '0s',   duration: '3s',   size: 3 },
    { left: '25%', delay: '0.5s', duration: '2.5s', size: 2 },
    { left: '40%', delay: '1s',   duration: '3.5s', size: 4 },
    { left: '55%', delay: '0.3s', duration: '2.8s', size: 2 },
    { left: '70%', delay: '1.2s', duration: '3.2s', size: 3 },
    { left: '85%', delay: '0.7s', duration: '2.6s', size: 2 },
  ];

  const color = destaque ? '#D4AF37' : 'rgba(255,255,255,0.3)';

  return (
    <div className="absolute top-0 left-0 w-full h-16 overflow-hidden rounded-t-[22px] pointer-events-none">
      {/* Linha de brilho no topo */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: destaque
            ? 'linear-gradient(90deg, transparent, #D4AF37, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        }}
      />

      {/* Brilho suave atrás */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '60px',
          background: destaque
            ? 'radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Partículas flutuantes */}
      {mounted && particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: '4px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: color,
            opacity: 0,
            animation: `floatUp ${p.duration} ${p.delay} infinite ease-in`,
          }}
        />
      ))}

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 0;   transform: translateY(0) scale(1); }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.3; }
          100% { opacity: 0;   transform: translateY(-48px) scale(0.5); }
        }
      `}</style>
    </div>
  );
};

export default function PricingCardsClient({ produtos }: { produtos: ProdutoInfo[] }) {
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal');
  const [allExpanded, setAllExpanded] = useState(false);

  // Expande ou recolhe todos de uma vez
  const toggleAll = () => {
    setAllExpanded(!allExpanded);
  };

  if (produtos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-white/50">
        Nenhum plano configurado no momento.
      </div>
    );
  }

  const temPlanoAnual = produtos.some(p => p.priceAnual !== null);
  const temPlanoMensal = produtos.some(p => p.priceMensal !== null);

  // Ordena do mais barato para o mais caro: BÁSICO → ESSENCIAL → PRO
  const produtosOrdenados = [...produtos].sort((a, b) => {
    const precoA = a.priceMensal?.valor ?? a.priceAnual?.valor ?? 0;
    const precoB = b.priceMensal?.valor ?? b.priceAnual?.valor ?? 0;
    return precoA - precoB;
  });

  return (
    <>
      {temPlanoAnual && temPlanoMensal && (
        <div className="flex justify-center mb-12">
          <div className="bg-[#111827] p-1.5 rounded-full border border-white/10 flex items-center shadow-lg gap-1">
            <button
              onClick={() => setCiclo('mensal')}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                ciclo === 'mensal' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setCiclo('anual')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                ciclo === 'anual' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Anual
              <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-black tracking-wide ${ciclo === 'anual' ? 'bg-black text-white' : 'bg-[#22c55e] text-white'}`}>
                + Econômico
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Botão global — expande/recolhe todos */}
        <div className="col-span-full flex justify-center mb-2">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-sm font-bold text-white/50 hover:text-[#D4AF37] transition-colors border border-white/10 hover:border-[#D4AF37]/40 px-5 py-2 rounded-full"
          >
            {allExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {allExpanded ? 'Recolher todos os detalhes' : 'Ver detalhes de todos os planos'}
          </button>
        </div>
        {produtosOrdenados.map((plano) => {
          const isAnual = ciclo === 'anual' && plano.priceAnual ? true : !plano.priceMensal;
          const precoExibido = isAnual ? plano.priceAnual : plano.priceMensal;

          if (!precoExibido) return null;

          return (
            <div
              key={plano.id}
              className={`relative flex flex-col pt-12 px-8 pb-8 rounded-[24px] w-full transition-all duration-300 border-2 hover:-translate-y-1 ${
                plano.destaque
                  ? 'bg-gradient-to-b from-[#1a1a2e] to-[#0f1423] border-[#D4AF37] shadow-[0_15px_50px_rgba(212,175,55,0.15)] scale-[1.02] z-10'
                  : 'bg-[#111827] border-white/5 hover:border-white/20'
              }`}
            >
              {/* Animação de partículas no topo */}
              <ParticlesBanner destaque={plano.destaque} />

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
                <div className="flex items-baseline gap-0.5 flex-wrap">
                  <span className="text-xl font-black text-white">
                    R$
                  </span>
                  <span className="text-4xl font-black text-white tracking-tight">
                    {precoExibido.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/40 text-sm font-medium">
                    /{isAnual ? 'ano' : 'mês'}
                  </span>
                </div>
                {isAnual && plano.priceMensal && (
                  <div className="text-[#D4AF37] text-[0.8rem] font-bold mt-2">
                    Equivale a R$ {(precoExibido.valor / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /mês
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
                  {plano.beneficios.slice(0, 3).map((b, i) => (
                    <li key={`vis-${i}`} className="flex items-start gap-3 text-white/90 text-[0.9rem] leading-snug">
                      <Check size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{b.replace('⭐', '')}</span>
                    </li>
                  ))}
                </ul>

                {plano.beneficios.length > 0 && (() => {
                  return (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <button
                        onClick={toggleAll}
                        className="flex items-center justify-between w-full text-sm font-bold text-white/60 hover:text-[#D4AF37] transition-colors"
                      >
                        <span>{allExpanded ? 'Ocultar detalhes' : `Ver todos (${plano.beneficios.length})`}</span>
                        {allExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {allExpanded && (
                        <ul className="space-y-3 mt-4 pt-2 border-t border-white/5">
                          {plano.beneficios.map((b, i) => (
                            <li key={`all-${i}`} className="flex items-start gap-3 text-white/70 text-[0.85rem] leading-snug">
                              <Check size={16} className="text-[#D4AF37]/70 shrink-0 mt-0.5" />
                              <span>{b.replace('⭐', '')}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })()}
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
