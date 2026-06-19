'use client';

import React, { useState, useEffect } from 'react';
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
  priceSemestral: PriceInfo | null;
  priceAnual: PriceInfo | null;
  destaque: boolean;
};

// Remove itens duplicados e filtra "perfis de usuário" e menções a "telas"
function filtrarBeneficios(lista: string[]): string[] {
  const vistos = new Set<string>();
  return lista
    .map(b => b.replace('⭐', '').trim())
    .filter(b => {
      const chave = b.toLowerCase();
      // remove menções a perfis de usuário (confunde clientes)
      if (chave.includes('perfis de usu')) return false;
      // remove menções redundantes a telas simultâneas
      if (chave.includes('tela') || chave.includes('telas')) return false;
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
}

const ParticlesBanner = ({ destaque }: { destaque: boolean }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const particles = [
    { left: '10%', delay: '0s', duration: '3s', size: 3 },
    { left: '25%', delay: '0.5s', duration: '2.5s', size: 2 },
    { left: '40%', delay: '1s', duration: '3.5s', size: 4 },
    { left: '55%', delay: '0.3s', duration: '2.8s', size: 2 },
    { left: '70%', delay: '1.2s', duration: '3.2s', size: 3 },
    { left: '85%', delay: '0.7s', duration: '2.6s', size: 2 },
  ];

  const color = destaque ? '#D4AF37' : 'rgba(255,255,255,0.3)';

  return (
    <div className="absolute top-0 left-0 w-full h-16 overflow-hidden rounded-t-[22px] pointer-events-none">
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: destaque
            ? 'linear-gradient(90deg, transparent, #D4AF37, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '60px', borderRadius: '50%',
          background: destaque
            ? 'radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
        }}
      />
      {mounted && particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.left, bottom: '4px',
          width: `${p.size}px`, height: `${p.size}px`, borderRadius: '50%',
          background: color, opacity: 0,
          animation: `floatUp ${p.duration} ${p.delay} infinite ease-in`,
        }} />
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

type Ciclo = 'mensal' | 'semestral' | 'anual';

export default function PricingCardsClient({ produtos }: { produtos: ProdutoInfo[] }) {
  const [ciclo, setCiclo] = useState<Ciclo>('mensal');

  if (produtos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-white/50">
        Nenhum plano configurado no momento.
      </div>
    );
  }

  const temPlanoAnual     = produtos.some(p => p.priceAnual !== null);
  const temPlanoMensal    = produtos.some(p => p.priceMensal !== null);
  const temPlanoSemestral = produtos.some(p => p.priceSemestral !== null);

  const produtosOrdenados = [...produtos].sort((a, b) => {
    const precoA = a.priceMensal?.valor ?? a.priceSemestral?.valor ?? a.priceAnual?.valor ?? 0;
    const precoB = b.priceMensal?.valor ?? b.priceSemestral?.valor ?? b.priceAnual?.valor ?? 0;
    return precoA - precoB;
  });

  const opcoesCiclo = ([
    { id: 'mensal'    as Ciclo, show: temPlanoMensal,    label: 'Mensal',    badge: null },
    { id: 'semestral' as Ciclo, show: temPlanoSemestral, label: 'Semestral', badge: '+ Econômico' },
    { id: 'anual'     as Ciclo, show: temPlanoAnual,     label: 'Anual',     badge: '🏆 Melhor Valor' },
  ]).filter(c => c.show);

  const temMultiplosCiclos = opcoesCiclo.length > 1;

  return (
    <>
      {/* ── Seletor de ciclo ── */}
      {temMultiplosCiclos && (
        <div className="flex justify-center mb-10 px-4 w-full">
          <style dangerouslySetInnerHTML={{__html: `
            .glass-radio-group {
              --bg: rgba(255, 255, 255, 0.06);
              --text: rgba(255, 255, 255, 0.5);
              display: flex;
              position: relative;
              background: var(--bg);
              border-radius: 1.25rem;
              backdrop-filter: blur(12px);
              box-shadow: inset 1px 1px 4px rgba(255, 255, 255, 0.1), inset -1px -1px 6px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3);
              width: 100%;
              max-width: 400px;
              margin: 0 auto;
            }
            .glass-radio-group input {
              display: none;
            }
            .glass-radio-group label {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 64px;
              font-size: 16px;
              cursor: pointer;
              font-weight: 900;
              letter-spacing: 0.3px;
              color: var(--text);
              position: relative;
              z-index: 2;
              transition: color 0.3s ease-in-out;
              padding-bottom: 12px; /* Espaço para o badge não empurrar o texto */
            }
            .glass-radio-group label span.label-text {
              margin-top: 12px; /* Empurra levemente para o centro visual */
            }
            .glass-radio-group label:hover {
              color: white;
            }
            .glass-radio-group input:checked + label {
              color: #000;
            }
            .glass-glider {
              position: absolute;
              top: 0;
              bottom: 0;
              border-radius: 1.25rem;
              z-index: 1;
              background: linear-gradient(135deg, #FFD700 0%, #D4AF37 100%);
              box-shadow: 0 0 18px rgba(212,175,55,0.4), 0 0 10px rgba(255,235,150,0.2) inset;
              transition: transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56);
            }
            .badge-unselected {
              background: #22c55e;
              color: #fff;
              position: absolute;
              bottom: 6px;
            }
            .glass-radio-group input:checked + label .badge-unselected {
              background: rgba(0,0,0,0.25) !important;
              color: #000 !important;
            }
          `}} />
          <div className="glass-radio-group">
            {opcoesCiclo.map(({ id, label, badge }) => (
              <React.Fragment key={id}>
                <input
                  type="radio"
                  name="plan_cycle"
                  id={`cycle-${id}`}
                  checked={ciclo === id}
                  onChange={() => setCiclo(id)}
                />
                <label htmlFor={`cycle-${id}`}>
                  <span className="label-text">{label}</span>
                  {badge && (
                    <span className="badge-unselected text-[0.6rem] font-black px-2 py-0.5 rounded-full tracking-wider whitespace-nowrap transition-colors">
                      {badge}
                    </span>
                  )}
                </label>
              </React.Fragment>
            ))}
            
            <div 
              className="glass-glider"
              style={{
                width: `${100 / opcoesCiclo.length}%`,
                transform: `translateX(${opcoesCiclo.findIndex(c => c.id === ciclo) * 100}%)`
              }}
            />
          </div>
        </div>
      )}

      {/* ── Cards ── */}
      <div className={`grid grid-cols-1 ${produtosOrdenados.length === 1 ? 'max-w-[450px]' : 'md:grid-cols-2 max-w-4xl'} gap-8 w-full mx-auto`}>
        {produtosOrdenados.map((plano) => {
          let precoExibido: PriceInfo | null = null;
          if (ciclo === 'anual'     && plano.priceAnual)     precoExibido = plano.priceAnual;
          else if (ciclo === 'semestral' && plano.priceSemestral) precoExibido = plano.priceSemestral;
          else if (ciclo === 'mensal'    && plano.priceMensal)    precoExibido = plano.priceMensal;
          else precoExibido = plano.priceMensal ?? plano.priceSemestral ?? plano.priceAnual;

          if (!precoExibido) return null;

          const labelPeriodo    = ciclo === 'anual' ? 'ano' : ciclo === 'semestral' ? 'semestre' : 'mês';
          const equivalenteMensal = ciclo === 'anual'     ? precoExibido.valor / 12
                                  : ciclo === 'semestral' ? precoExibido.valor / 6
                                  : null;

          const beneficiosFiltrados = filtrarBeneficios(plano.beneficios);

          return (
            <div
              key={plano.id}
              className={`relative flex flex-col pt-12 px-8 pb-8 rounded-[24px] w-full transition-all duration-300 border-2 hover:-translate-y-1 ${
                plano.destaque
                  ? 'bg-gradient-to-b from-[#1a1a2e] to-[#0f1423] border-[#D4AF37] shadow-[0_15px_50px_rgba(212,175,55,0.15)] scale-[1.02] z-10'
                  : 'bg-[#111827] border-white/5 hover:border-white/20'
              }`}
            >
              <ParticlesBanner destaque={plano.destaque} />

              {plano.badge && (
                <div
                  className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[0.75rem] font-bold tracking-[1px] uppercase whitespace-nowrap shadow-md"
                  style={{ background: '#22c55e', color: '#fff' }}
                >
                  ✦ {plano.badge}
                </div>
              )}

              {/* Nome e descrição */}
              <div className="text-left mb-6">
                <h3 className={`text-2xl font-extrabold mb-1 ${plano.cor}`}>{plano.nome}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{plano.descricao}</p>
              </div>

              {/* Preço */}
              <div className="text-left mb-6">
                <div className="flex items-baseline gap-0.5 flex-wrap">
                  <span className="text-xl font-black text-white">R$</span>
                  <span className="text-5xl font-black text-white tracking-tight">
                    {precoExibido.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/40 text-base font-medium">/{labelPeriodo}</span>
                </div>
                {equivalenteMensal && (
                  <div className="text-[#D4AF37] text-sm font-bold mt-2">
                    Equivale a R$ {equivalenteMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /mês
                  </div>
                )}
                {ciclo === 'mensal' && plano.priceAnual && (
                  <div className="text-[#22c55e] text-xs font-bold mt-1">
                    💡 Economize escolhendo o plano anual
                  </div>
                )}
              </div>

              {/* Telas simultâneas em destaque */}
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl w-full"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
                >
                  <Monitor size={16} style={{ color: '#D4AF37' }} />
                  <span className="text-sm font-black uppercase tracking-wider" style={{ color: '#D4AF37' }}>
                    {plano.maxTelas} tela{plano.maxTelas > 1 ? 's' : ''} simult{plano.maxTelas > 1 ? 'âneas' : 'ânea'}
                  </span>
                </div>
              </div>

              {/* Benefícios — todos visíveis, sem accordion */}
              <div className="text-left mb-8 flex-1">
                <ul className="space-y-3">
                  {beneficiosFiltrados.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/85 text-[0.9rem] leading-snug">
                      <Check size={17} className="text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
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
