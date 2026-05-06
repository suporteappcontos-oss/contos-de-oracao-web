'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, ChevronDown, ChevronUp, Monitor } from 'lucide-react';

type PriceInfo = { id: string; valor: number };
type ProdutoInfo = {
  id: string;
  nome: string;
  badge: string | null;
  maxTelas: number;
  beneficios: string[];
  priceMensal: PriceInfo | null;
  priceAnual: PriceInfo | null;
  destaque: boolean;
};

const BENEFICIOS_LATERAIS = [
  {
    icon: '🔒',
    titulo: 'Ambiente seguro e sem anúncios',
    desc: 'Conteúdo 100% cristão para toda a família.',
  },
  {
    icon: '▶',
    titulo: 'Assista onde quiser',
    desc: 'Em smartphones, tablets, computadores e Smart TVs.',
  },
  {
    icon: '⬇',
    titulo: 'Baixe e use offline',
    desc: 'Tenha os materiais sempre com você.',
  },
  {
    icon: '👨‍👩‍👧',
    titulo: 'Feito para catequistas e famílias',
    desc: 'Recursos que ajudam na missão de evangelizar.',
  },
];

export default function PricingPageLayout({ produtos }: { produtos: ProdutoInfo[] }) {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (produtos.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 text-white/40 text-lg">
        Nenhum plano configurado no momento.
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col items-center pt-32 pb-20 px-4">
      {/* Título da página */}
      <div className="text-center mb-14 max-w-2xl">
        <span className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-5 bg-[#D4AF37]/10 px-4 py-2 rounded-full border border-[#D4AF37]/30">
          ✝ Educação na fé que transforma
        </span>
        <h1
          className="text-4xl md:text-5xl font-black text-white leading-tight mb-4"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Escolha o plano ideal<br />
          <span style={{ color: '#D4AF37' }}>para sua família.</span>
        </h1>
        <p className="text-white/50 text-base leading-relaxed">
          Plataforma completa com filmes, materiais e recursos exclusivos para catequistas, famílias e ministérios.
        </p>
      </div>

      {/* O Super Card — 3 Colunas */}
      <div
        className="w-full max-w-[1100px] rounded-[2rem] border border-[#D4AF37]/30 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #161206 0%, #0e0e0e 50%, #0b0e18 100%)',
          boxShadow: '0 0 80px rgba(212,175,55,0.08), 0 0 0 1px rgba(212,175,55,0.1)',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_240px]">

          {/* ===== COLUNA ESQUERDA: Imagem ===== */}
          <div className="relative hidden lg:flex items-end justify-center overflow-hidden min-h-[480px]">
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at bottom, rgba(212,175,55,0.12) 0%, transparent 70%)',
              }}
            />
            <Image
              src="/jesus-criancas.png"
              alt="Jesus com crianças"
              width={280}
              height={400}
              className="object-contain object-bottom relative z-10 w-full h-full"
              style={{ maxHeight: '460px' }}
            />
          </div>

          {/* ===== COLUNA CENTRAL: Cards de Plano ===== */}
          <div className="p-8 md:p-10 flex flex-col gap-5 border-x border-[#D4AF37]/10">
            {produtos.map((plano) => {
              const isExpanded = expandedCards[plano.id];
              const beneficiosDestaque = plano.beneficios.filter(b => b.startsWith('⭐'));
              const beneficiosNormais = beneficiosDestaque.length > 0
                ? plano.beneficios.filter(b => !b.startsWith('⭐'))
                : plano.beneficios.slice(2);
              const beneficiosVisiveis = beneficiosDestaque.length > 0
                ? beneficiosDestaque
                : plano.beneficios.slice(0, 2);

              // Decide qual preço mostrar (prefere mensal, mas usa anual se só tiver anual)
              const precos: { label: string; sublabel?: string; preco: PriceInfo; planId: string; isAnual: boolean }[] = [];
              if (plano.priceMensal) {
                precos.push({ label: 'Plano Mensal', preco: plano.priceMensal, planId: plano.priceMensal.id, isAnual: false });
              }
              if (plano.priceAnual) {
                const equiv = (plano.priceAnual.valor / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                precos.push({
                  label: 'Plano Anual',
                  sublabel: `R$ ${equiv}/mês`,
                  preco: plano.priceAnual,
                  planId: plano.priceAnual.id,
                  isAnual: true
                });
              }

              return (
                <div key={plano.id} className="flex flex-col gap-4">
                  {precos.map((item) => (
                    <div
                      key={item.planId}
                      className="rounded-2xl p-5 border"
                      style={{
                        background: item.isAnual
                          ? 'linear-gradient(135deg, #1a1500 0%, #111000 100%)'
                          : 'rgba(255,255,255,0.03)',
                        borderColor: item.isAnual ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.07)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ background: 'rgba(212,175,55,0.15)' }}
                          >
                            {item.isAnual ? '👑' : '📅'}
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm">{item.label}</div>
                            {item.isAnual && plano.badge && (
                              <span className="text-[0.65rem] font-black tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full">
                                {plano.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={`/assinar?plan=${item.planId}`}
                          className="text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all hover:brightness-110 active:scale-95 whitespace-nowrap"
                          style={{
                            background: item.isAnual
                              ? 'linear-gradient(135deg, #D4AF37, #b8922e)'
                              : 'rgba(255,255,255,0.1)',
                            color: item.isAnual ? '#000' : '#fff',
                            border: item.isAnual ? 'none' : '1px solid rgba(255,255,255,0.15)',
                          }}
                        >
                          Assinar Agora →
                        </a>
                      </div>

                      {/* Preço */}
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-[2.2rem] font-black text-white leading-none">
                          R$ {item.preco.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-white/40 text-sm">/{item.isAnual ? 'ano' : 'mês'}</span>
                      </div>
                      {item.isAnual && item.sublabel && (
                        <p className="text-[#D4AF37] text-xs font-bold mb-3">≈ {item.sublabel}</p>
                      )}

                      {/* Benefícios do card */}
                      <ul className="space-y-1.5 mt-3">
                        {beneficiosVisiveis.map((b, i) => (
                          <li key={i} className="flex items-center gap-2 text-white/80 text-[0.8rem]">
                            <Check size={13} className="text-[#D4AF37] shrink-0" strokeWidth={3} />
                            <span>{b.replace('⭐', '')}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Ver detalhes expansível */}
                      {beneficiosNormais.length > 0 && (
                        <div className="mt-3 border-t border-white/5 pt-3">
                          <button
                            onClick={() => toggleExpand(item.planId)}
                            className="flex items-center gap-1 text-xs font-bold text-white/40 hover:text-[#D4AF37] transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            {isExpanded ? 'Ocultar detalhes' : 'Ver todos os benefícios'}
                          </button>
                          {expandedCards[item.planId] && (
                            <ul className="space-y-1.5 mt-3">
                              {beneficiosNormais.map((b, i) => (
                                <li key={i} className="flex items-center gap-2 text-white/50 text-[0.78rem]">
                                  <Check size={12} className="text-[#D4AF37]/50 shrink-0" strokeWidth={3} />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Info telas simultâneas */}
                  <div className="flex items-center gap-2 text-[0.75rem] text-[#D4AF37]/70 px-1">
                    <Monitor size={13} />
                    <span>{plano.maxTelas} tela{plano.maxTelas > 1 ? 's' : ''} simultânea{plano.maxTelas > 1 ? 's' : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== COLUNA DIREITA: Benefícios Gerais ===== */}
          <div className="p-8 flex flex-col gap-6 justify-center">
            {BENEFICIOS_LATERAIS.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="text-white text-sm font-bold leading-tight mb-1">{item.titulo}</div>
                  <div className="text-white/40 text-xs leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
