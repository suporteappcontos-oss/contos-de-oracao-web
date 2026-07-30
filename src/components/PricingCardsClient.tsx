'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Check, Sparkles } from 'lucide-react';

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

function filtrarBeneficios(lista: string[]): string[] {
  const vistos = new Set<string>();
  return lista
    .map(b => b.replace('⭐', '').trim())
    .filter(b => {
      const chave = b.toLowerCase();
      if (chave.includes('perfis de usu')) return false;
      if (chave.includes('tela') || chave.includes('telas')) return false;
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
}

const ParticlesBanner = () => {
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

  return (
    <div className="absolute top-0 left-0 w-full h-16 overflow-hidden rounded-t-[28px] pointer-events-none">
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px',
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '60px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, transparent 70%)',
        }}
      />
      {mounted && particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.left, bottom: '4px',
          width: `${p.size}px`, height: `${p.size}px`, borderRadius: '50%',
          background: '#D4AF37', opacity: 0,
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
  const [ciclo, setCiclo] = useState<Ciclo>('anual');

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
    { id: 'mensal'    as Ciclo, show: temPlanoMensal,    label: 'Mensal',    tag: null },
    { id: 'semestral' as Ciclo, show: temPlanoSemestral, label: 'Semestral', tag: 'Flex' },
    { id: 'anual'     as Ciclo, show: temPlanoAnual,     label: 'Anual',     tag: 'Melhor Valor' },
  ]).filter(c => c.show);

  const temMultiplosCiclos = opcoesCiclo.length > 1;

  return (
    <>
      {/* ── Seletor de Ciclo (Toggle Mensal vs Anual) ── */}
      {temMultiplosCiclos && (
        <div className="flex justify-center mb-10 px-4 w-full">
          <style dangerouslySetInnerHTML={{__html: `
            .cycle-toggle-container {
              position: relative;
              display: flex;
              align-items: center;
              background: rgba(15, 21, 34, 0.85);
              border: 1px solid rgba(212, 175, 55, 0.3);
              border-radius: 1rem;
              padding: 5px;
              width: 100%;
              max-width: 380px;
              margin: 0 auto;
              backdrop-filter: blur(12px);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.08);
            }
            .cycle-toggle-btn {
              flex: 1;
              position: relative;
              z-index: 2;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              height: 46px;
              border: none;
              background: transparent;
              cursor: pointer;
              font-family: 'Outfit', sans-serif;
              font-size: 0.88rem;
              font-weight: 800;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.6);
              transition: color 0.3s ease;
            }
            .cycle-toggle-btn:hover {
              color: #ffffff;
            }
            .cycle-toggle-btn.active {
              color: #0A0C12;
            }
            .cycle-glider {
              position: absolute;
              top: 5px;
              bottom: 5px;
              border-radius: 0.75rem;
              z-index: 1;
              background: linear-gradient(135deg, #FFD700 0%, #D4AF37 100%);
              box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
              transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .tag-[#anual] {
              font-size: 0.6rem;
              font-weight: 900;
              padding: 2px 6px;
              border-radius: 6px;
              letter-spacing: 0.03em;
            }
          `}} />

          <div className="cycle-toggle-container">
            {opcoesCiclo.map(({ id, label, tag }) => (
              <button
                key={id}
                onClick={() => setCiclo(id)}
                className={`cycle-toggle-btn ${ciclo === id ? 'active' : ''}`}
              >
                <span>{label}</span>
                {tag && (
                  <span className={`text-[0.6rem] font-extrabold px-1.5 py-0.5 rounded-md transition-colors ${
                    ciclo === id
                      ? 'bg-black/20 text-[#0A0C12]'
                      : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  }`}>
                    {tag}
                  </span>
                )}
              </button>
            ))}

            <div
              className="cycle-glider"
              style={{
                width: `calc((100% - 10px) / ${opcoesCiclo.length})`,
                transform: `translateX(${opcoesCiclo.findIndex(c => c.id === ciclo) * 100}%)`
              }}
            />
          </div>
        </div>
      )}

      {/* ── Card do Plano (Design VIP) ── */}
      <div className={`grid grid-cols-1 ${produtosOrdenados.length === 1 ? 'max-w-[480px]' : 'md:grid-cols-2 max-w-4xl'} gap-8 w-full mx-auto`}>
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
              className="relative flex flex-col pt-10 px-6 sm:px-9 pb-9 rounded-[28px] w-full transition-all duration-300 bg-gradient-to-b from-[#121828] via-[#0d121f] to-[#080b13] border-2 border-[#D4AF37]/60 shadow-[0_20px_60px_rgba(212,175,55,0.2)] hover:-translate-y-1 z-10"
            >
              <ParticlesBanner />

              {/* Nome e Descrição */}
              <div className="text-left mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-[#D4AF37] tracking-tight">
                    Plano Contos de Oração <span className="text-white">Club</span>
                  </h3>
                </div>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                  Acesso completo e ilimitado a filmes, histórias de santos, novenas e desenhos infantis católicos.
                </p>
              </div>

              {/* Exibição de Preço */}
              <div className="text-left mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                {equivalenteMensal ? (
                  <>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-lg font-black text-[#D4AF37]">R$</span>
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                        {equivalenteMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[#D4AF37] text-base sm:text-lg font-bold">/mês</span>
                    </div>
                    <div className="text-white/60 text-xs sm:text-sm font-medium mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span>R$ {precoExibido.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/{labelPeriodo}</span>
                      <span className="text-[#00e676] text-xs font-bold bg-[#00e676]/10 px-2 py-0.5 rounded border border-[#00e676]/20">
                        Economize 35%
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-lg font-black text-[#D4AF37]">R$</span>
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                        {precoExibido.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-white/60 text-base font-medium">/{labelPeriodo}</span>
                    </div>
                    {plano.priceAnual && (
                      <div className="text-[#D4AF37] text-xs font-bold mt-1.5 flex items-center gap-1">
                        <Sparkles size={12} />
                        No plano Anual você economiza 35% (apenas R$ {(plano.priceAnual.valor / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês)
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Telas simultâneas */}
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl w-full bg-[#D4AF37]/10 border border-[#D4AF37]/30"
                >
                  <Monitor size={18} className="text-[#D4AF37]" />
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#D4AF37]">
                    5 Telas Simultâneas na Mesma Conta
                  </span>
                </div>
              </div>

              {/* Lista de Benefícios */}
              <div className="text-left mb-8 flex-1">
                <ul className="space-y-3">
                  {beneficiosFiltrados.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/90 text-xs sm:text-sm leading-snug">
                      <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-[#D4AF37]" />
                      </div>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botão CTA Assinar */}
              <a
                href={`/assinar?plan=${precoExibido.id}`}
                className="flex items-center justify-center w-full py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-[#0A0C12] shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                ✦ Testar 7 Dias Grátis →
              </a>
              <p className="text-white/50 text-[0.68rem] text-center mt-3 font-medium">
                🔒 R$ 0,00 cobrados hoje • Cobrança automática só após 7 dias
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
