'use client';
import { Smartphone, Download, Star, X } from 'lucide-react'
import { useState, useEffect } from 'react';

export default function AppBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Só mostra se o cliente ainda não tiver dispensado o banner
    const isDismissed = localStorage.getItem('app_banner_dismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleClose = () => {
    localStorage.setItem('app_banner_dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-16">
      <div 
        className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(212,175,55,0.15) 100%)',
          border: '1px solid rgba(212,175,55,0.2)',
        }}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all z-20"
        >
          <X size={20} />
        </button>
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] text-[0.65rem] font-black uppercase tracking-widest mb-6">
            <Star size={12} fill="currentColor" /> Novidade
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight leading-[1.1]">
            Leve a Palavra <br className="hidden md:block"/>
            com você.
          </h2>
          
          <p className="text-[#8197a4] text-sm md:text-lg max-w-xl mx-auto md:mx-0 mb-8 leading-relaxed">
            Baixe o nosso novo aplicativo oficial para Android. Assista às reflexões onde estiver, salve seus favoritos e tenha uma experiência ainda mais rápida.
          </p>

          <a 
            href="/perfil" 
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black transition-all hover:scale-105 hover:brightness-110 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', color: '#090B10' }}
          >
            <Download size={20} strokeWidth={2.5} />
            Baixar App Android (Grátis)
          </a>
        </div>

        {/* Ilustração ou Ícone Gigante */}
        <div className="relative shrink-0 flex items-center justify-center z-10 hidden sm:flex">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-dashed border-[#D4AF37]/30 flex items-center justify-center relative">
            <div className="absolute w-full h-full animate-spin-slow opacity-30" style={{ border: '1px dashed #D4AF37', borderRadius: '50%', animationDuration: '20s' }} />
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8b7322] flex items-center justify-center shadow-2xl p-[2px]">
              <div className="w-full h-full bg-[#090B10] rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/20 to-transparent opacity-50" />
                <Smartphone size={60} className="text-[#D4AF37]" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
