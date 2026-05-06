'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, MonitorPlay, Download, Users, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function HeroBento({ produtos }: { produtos: any[] }) {
  const router = useRouter();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleComecar = () => {
    router.push('/assinar');
  };

  return (
    <section className="w-full bg-[#050608] min-h-screen pt-24 pb-12 px-4 md:px-[4%] flex flex-col items-center relative overflow-hidden" style={{ fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#D4AF37] opacity-[0.03] blur-[120px] rounded-full pointer-events-none z-0" />

      {/* TOP SECTION: Hero */}
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Left: Text Content */}
        <div className="w-full lg:w-[55%] flex flex-col items-start text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 mb-6">
            <span className="text-[#D4AF37] text-xs">⭐</span>
            <span className="text-[#D4AF37] text-[0.65rem] font-bold uppercase tracking-widest">Educação na fé que transforma</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
            Forme <span className="text-[#D4AF37]">corações,</span><br/>
            fortaleça a fé.
          </h1>

          {/* Subtitle */}
          <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed mb-8 max-w-lg">
            Plataforma completa com filmes, materiais e recursos exclusivos para catequistas, famílias e ministérios que desejam evangelizar com propósito e qualidade.
          </p>

          {/* 4 Feature Icons */}
          <div className="flex flex-wrap gap-x-6 gap-y-4 mb-10">
             <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#D4AF37]/80" />
                <span className="text-white/80 text-xs font-medium">Conteúdo seguro<br/>e cristão</span>
             </div>
             <div className="flex items-center gap-2">
                <MonitorPlay size={18} className="text-[#D4AF37]/80" />
                <span className="text-white/80 text-xs font-medium">Acesso em todos<br/>os dispositivos</span>
             </div>
             <div className="flex items-center gap-2">
                <Download size={18} className="text-[#D4AF37]/80" />
                <span className="text-white/80 text-xs font-medium">Novos conteúdos<br/>todos os meses</span>
             </div>
             <div className="flex items-center gap-2">
                <Users size={18} className="text-[#D4AF37]/80" />
                <span className="text-white/80 text-xs font-medium">Suporte dedicado<br/>para você</span>
             </div>
          </div>

          <button 
            onClick={handleComecar}
            className="bg-[#D4AF37] text-[#050608] px-8 py-3.5 rounded-xl font-bold uppercase text-sm tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:scale-105 hover:brightness-110 transition-all"
          >
            Comece Agora →
          </button>
        </div>

        {/* Right: Hero Image */}
        <div className="w-full lg:w-[45%] flex justify-center lg:justify-end relative">
           <div className="relative w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-[#090B10]">
             <img src="/jesus-catequista.png" alt="Jesus com crianças e catequista" className="object-cover w-full h-full opacity-90 mix-blend-lighten" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
           </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Bento Pricing Card */}
      <div className="w-full max-w-[1200px] mt-20 relative z-10 border border-[#D4AF37]/20 rounded-[2rem] bg-gradient-to-b from-[#111622] to-[#090B10] p-4 md:p-8 flex flex-col lg:flex-row gap-8 shadow-2xl">
         
         {/* Column 1: Image (hidden on small screens) */}
         <div className="hidden lg:block w-[30%] bg-[#050608] rounded-2xl overflow-hidden relative border border-white/5">
            <img src="/jesus-criancas.png" alt="Jesus e Crianças" className="object-cover w-full h-full opacity-70" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
         </div>

         {/* Column 2: The Pricing Boxes (Stacked) */}
         <div className="w-full lg:w-[40%] flex flex-col gap-4 justify-center">
            {produtos.map((plano) => {
              const isAnual = plano.destaque; // assumindo que o plano destaque é o anual ou principal
              const precoExibido = isAnual && plano.priceAnual ? plano.priceAnual : (plano.priceMensal || plano.priceAnual);
              
              if (!precoExibido) return null;

              const isExpanded = expandedCards[plano.id];

              return (
                <div key={plano.id} className="bg-[#181d29] rounded-2xl p-5 border border-white/5 hover:border-[#D4AF37]/40 transition-colors flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                     <div>
                       <h4 className="text-white font-bold text-sm mb-1">{plano.nome} {plano.badge && <span className="ml-2 text-[0.6rem] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded uppercase">{plano.badge}</span>}</h4>
                       <div className="flex items-end gap-1">
                         <span className="text-2xl font-black text-white">R$ {precoExibido.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                         <span className="text-white/50 text-xs mb-1">/{isAnual ? 'ano' : 'mês'}</span>
                       </div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     {/* Benefícios Destaque */}
                     {plano.beneficios.filter((b: string) => b.startsWith('⭐')).map((b: string, i: number) => (
                        <div key={`d-${i}`} className="flex items-start gap-2">
                           <Check size={14} className="text-[#D4AF37] shrink-0 mt-0.5" />
                           <span className="text-white/80 text-[0.8rem] leading-tight">{b.replace('⭐', '')}</span>
                        </div>
                     ))}
                     {/* Fallback */}
                     {!plano.beneficios.some((b: string) => b.startsWith('⭐')) && plano.beneficios.slice(0,2).map((b: string, i: number) => (
                        <div key={`f-${i}`} className="flex items-start gap-2">
                           <Check size={14} className="text-[#D4AF37] shrink-0 mt-0.5" />
                           <span className="text-white/80 text-[0.8rem] leading-tight">{b.replace('⭐', '')}</span>
                        </div>
                     ))}

                     {/* Benefícios normais expansíveis */}
                     {(() => {
                        const normais = plano.beneficios.some((b: string) => b.startsWith('⭐')) 
                           ? plano.beneficios.filter((b: string) => !b.startsWith('⭐')) 
                           : plano.beneficios.slice(2);
                        
                        if (normais.length === 0) return null;

                        return (
                           <div className="mt-2 pt-2 border-t border-white/5">
                              <button onClick={() => toggleExpand(plano.id)} className="flex items-center gap-1 text-[0.7rem] text-[#D4AF37] font-bold uppercase tracking-wider">
                                 {isExpanded ? 'Menos Detalhes' : 'Ver Detalhes'} {isExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                              </button>
                              {isExpanded && (
                                 <div className="flex flex-col gap-2 mt-3">
                                    {normais.map((b: string, i: number) => (
                                       <div key={`n-${i}`} className="flex items-start gap-2">
                                          <Check size={14} className="text-[#D4AF37]/50 shrink-0 mt-0.5" />
                                          <span className="text-white/60 text-[0.75rem] leading-tight">{b}</span>
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </div>
                        )
                     })()}
                  </div>

                  <a 
                    href={`/assinar?plan=${precoExibido.id}`}
                    className="mt-2 w-full bg-[#D4AF37] text-black py-2.5 rounded-lg text-xs font-black text-center hover:brightness-110 uppercase tracking-widest"
                  >
                    Assinar Agora →
                  </a>
                </div>
              )
            })}
         </div>

         {/* Column 3: Platform Features */}
         <div className="w-full lg:w-[30%] flex flex-col justify-center gap-6 pl-0 lg:pl-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0">
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-[#D4AF37]" />
               </div>
               <div>
                  <h5 className="text-[#D4AF37] text-sm font-bold mb-1">Ambiente seguro e sem anúncios</h5>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">Conteúdo 100% cristão para toda a família.</p>
               </div>
            </div>

            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <MonitorPlay size={20} className="text-[#D4AF37]" />
               </div>
               <div>
                  <h5 className="text-[#D4AF37] text-sm font-bold mb-1">Assista onde quiser</h5>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">Em smartphones, tablets, computadores e Smart TVs.</p>
               </div>
            </div>

            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <Download size={20} className="text-[#D4AF37]" />
               </div>
               <div>
                  <h5 className="text-[#D4AF37] text-sm font-bold mb-1">Baixe e use offline</h5>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">Tenha os materiais sempre com você.</p>
               </div>
            </div>

            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <Users size={20} className="text-[#D4AF37]" />
               </div>
               <div>
                  <h5 className="text-[#D4AF37] text-sm font-bold mb-1">Feito para catequistas e famílias</h5>
                  <p className="text-[#94A3B8] text-xs leading-relaxed">Recursos que ajudam na missão de evangelizar.</p>
               </div>
            </div>
         </div>

      </div>

      {/* Footer Banner */}
      <div className="w-full max-w-[1200px] mt-8 bg-[#111622] border border-white/5 rounded-2xl py-6 px-4 md:px-8 flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 text-center md:text-left z-10 relative">
         <h4 className="text-white text-lg font-bold">Tudo o que você precisa para evangelizar com excelência</h4>
         <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2"><span className="text-[#D4AF37]">🎬</span><span className="text-[#94A3B8] text-xs font-medium">Filmes que educam</span></div>
            <div className="flex items-center gap-2"><span className="text-[#D4AF37]">📖</span><span className="text-[#94A3B8] text-xs font-medium">Materiais formativos</span></div>
            <div className="flex items-center gap-2"><span className="text-[#D4AF37]">⭐</span><span className="text-[#94A3B8] text-xs font-medium">Conteúdos exclusivos</span></div>
         </div>
      </div>

    </section>
  );
}
