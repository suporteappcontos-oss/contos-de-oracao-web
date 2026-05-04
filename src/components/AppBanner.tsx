'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AppBanner() {
  const [visible, setVisible] = useState(false);

  const [versao, setVersao] = useState<string | null>(null);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`https://contos-apks.b-cdn.net/versao.json?t=${timestamp}`, { cache: 'no-store' });
        
        if (res.ok) {
          const data = await res.json();
          const lastSeenVersion = localStorage.getItem('app_banner_seen_version');
          
          // Se a versão for nova, mostra o banner!
          if (data.versao_atual && data.versao_atual !== lastSeenVersion) {
            setVersao(data.versao_atual);
            setVisible(true);
          }
        } else {
          // Fallback caso não consiga acessar o JSON (exibe na primeira vez)
          if (!localStorage.getItem('app_banner_v2')) setVisible(true);
        }
      } catch (e) {
        if (!localStorage.getItem('app_banner_v2')) setVisible(true);
      }
    };
    checkUpdate();
  }, []);

  if (!visible) return null;

  const handleClose = () => {
    if (versao) {
      localStorage.setItem('app_banner_seen_version', versao);
    }
    localStorage.setItem('app_banner_v2', '1');
    setVisible(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
      <div
        className="relative overflow-hidden rounded-3xl flex flex-col md:flex-row items-center gap-8 p-8 md:p-12"
        style={{ background: 'linear-gradient(135deg,#0e1015 0%,#16180f 50%,#0e1015 100%)', border: '1px solid rgba(212,175,55,0.25)' }}
      >
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(212,175,55,0.15),transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(24,119,242,0.08),transparent 70%)' }} />

        {/* Ícone do App */}
        <div className="shrink-0 relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-[22px] overflow-hidden shadow-2xl border-2 border-[#D4AF37]/30">
            <Image src="/logo.png" alt="Contos de Oração" width={96} height={96} className="object-contain w-full h-full bg-[#090B10]" />
          </div>
          {/* Badge "NOVO" ou "ATUALIZAÇÃO" */}
          <div className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-[#090B10]">
            {versao ? `NOVA ATUALIZAÇÃO v${versao}` : 'NOVO'}
          </div>
        </div>

        {/* Texto */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-2">📱 Aplicativo Oficial Android</p>
          <h2 className="text-white text-2xl md:text-3xl font-black leading-tight mb-2">
            Contos de Oração<br />
            <span className="text-[#D4AF37]">na palma da mão</span>
          </h2>
          <p className="text-white/50 text-sm mb-5 max-w-md">
            {versao 
              ? 'Temos melhorias fresquinhas no nosso app! Baixe agora a versão mais recente e aproveite a experiência sem travamentos.' 
              : 'Assista aos vídeos exclusivos, receba notificações de novos lançamentos e viva a fé em qualquer lugar.'}
          </p>
          {/* Stars */}
          <div className="flex items-center justify-center md:justify-start gap-1.5 mb-5">
            {[1,2,3,4,5].map(i => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
            <span className="text-white/40 text-xs ml-1">100% Gratuito</span>
          </div>
          <a
            href="https://contos-apks.b-cdn.net/contos-de-oracao.apk"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#FFD700,#D4AF37)', color: '#090B10' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {versao ? 'Atualizar App Agora' : 'Baixar para Android — Grátis'}
          </a>
        </div>

        {/* Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
