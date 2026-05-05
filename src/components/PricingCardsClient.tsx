'use client';

import React, { useState } from 'react';
import { Monitor, X } from 'lucide-react';

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
  const [selectedProduct, setSelectedProduct] = useState<ProdutoInfo | null>(null);

  if (produtos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-white/50">
        Nenhum plano configurado no momento.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch flex-wrap gap-5">
        {produtos.map((plano) => (
          <div
            key={plano.id}
            className={`relative flex flex-col p-7 rounded-[20px] w-full max-w-[320px] transition-all duration-300 border-2 hover:-translate-y-1 ${
              plano.destaque
                ? 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#FFD700] shadow-[0_8px_40px_rgba(255,215,0,0.15)] md:scale-105 z-10'
                : 'bg-[#1E2E3E] border-white/5 hover:border-white/20'
            }`}
          >
            {plano.badge && (
              <div
                className="absolute -top-[14px] left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[0.8rem] font-bold tracking-[1px] whitespace-nowrap"
                style={{ background: '#22c55e', color: '#fff' }}
              >
                ✦ {plano.badge}
              </div>
            )}

            <div className="text-left mb-4">
              <h3 className={`text-[1.35rem] font-extrabold mb-0.5 ${plano.cor}`}>{plano.nome}</h3>
              <p className="text-white/40 text-xs">{plano.descricao}</p>
            </div>

            <div className="text-left mb-3">
              {plano.priceMensal ? (
                <>
                  <span className="text-3xl font-extrabold text-white">
                    R$ {plano.priceMensal.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/40 text-sm ml-1">/mês</span>
                </>
              ) : plano.priceAnual ? (
                <>
                  <span className="text-3xl font-extrabold text-white">
                    R$ {(plano.priceAnual.valor / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-white/40 text-sm ml-1">/mês (no plano anual)</span>
                </>
              ) : (
                <span className="text-xl text-white/50">Preço indisponível</span>
              )}
            </div>

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

            <ul className="list-none mb-5 text-left grow space-y-2">
              {plano.beneficios.map((b: string, i: number) => (
                <li key={`${b}-${i}`} className="flex items-start gap-2 text-white/80 text-sm">
                  <span className="text-[#FFD700] font-bold mt-0.5 shrink-0">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedProduct(plano)}
              className={`flex items-center justify-center w-full py-3 rounded-xl font-bold text-base transition-all active:scale-95 ${
                plano.destaque
                  ? 'bg-[#FFD700] text-black hover:brightness-110'
                  : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
              }`}
            >
              Assinar agora →
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Escolha (Mensal vs Anual) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-black text-white mb-2 text-left">
              Escolha o período do <span className="text-[#D4AF37]">{selectedProduct.nome}</span>
            </h3>
            <p className="text-white/50 text-sm mb-6 text-left">
              Selecione se prefere pagar mensalmente ou aproveitar o desconto do plano anual.
            </p>

            <div className="flex flex-col gap-4">
              {/* Opção Mensal */}
              {selectedProduct.priceMensal && (
                <a
                  href={`/assinar?plan=${selectedProduct.priceMensal.id}`}
                  className="flex flex-col p-4 rounded-2xl border-2 border-white/5 hover:border-[#D4AF37] bg-[#090B10] transition-all group no-underline text-left"
                >
                  <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-white/70">Pagamento Mensal</div>
                  <div className="text-white font-black text-2xl group-hover:text-[#D4AF37] transition-colors">
                    R$ {selectedProduct.priceMensal.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<span className="text-sm text-white/50 font-medium">/mês</span>
                  </div>
                  <div className="text-white/40 text-xs mt-2">Cobrado a cada mês. Cancele quando quiser.</div>
                </a>
              )}

              {/* Opção Anual */}
              {selectedProduct.priceAnual && (
                <a
                  href={`/assinar?plan=${selectedProduct.priceAnual.id}`}
                  className="relative flex flex-col p-4 rounded-2xl border-2 border-[#D4AF37] hover:bg-[#D4AF37]/5 bg-[#090B10] transition-all group no-underline text-left shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                >
                  <div className="absolute -top-3 right-4 bg-[#22c55e] text-white text-[0.65rem] font-black px-3 py-1 rounded-full shadow-lg">
                    MAIS ECONÔMICO
                  </div>
                  <div className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-1">Pagamento Anual</div>
                  <div className="text-white font-black text-2xl">
                    R$ {selectedProduct.priceAnual.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<span className="text-sm text-white/50 font-medium">/ano</span>
                  </div>
                  <div className="text-[#D4AF37] text-sm mt-2 font-medium">
                    Equivale a apenas R$ {(selectedProduct.priceAnual.valor / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês!
                  </div>
                  {(() => {
                    if (selectedProduct.priceMensal && selectedProduct.priceAnual) {
                      const totalMensal = selectedProduct.priceMensal.valor * 12;
                      const economiaTotal = totalMensal - selectedProduct.priceAnual.valor;
                      if (economiaTotal > 0) {
                        const porcentagem = Math.round((economiaTotal / totalMensal) * 100);
                        return (
                          <div className="text-[#22c55e] text-[0.75rem] font-bold mt-2 uppercase tracking-wide">
                            {porcentagem}% DE DESCONTO <span className="text-white/50 capitalize font-medium ml-1">(Economize R$ {economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por ano)</span>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </a>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
