import React from 'react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="pt-16 pb-8 px-[4%]" style={{ background: '#090B10', borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: 'Outfit, sans-serif' }}>
      <div className="flex items-center gap-3 mb-8">
        <Image src="/logo.png" alt="Contos de Oração" width={36} height={36} className="object-contain opacity-70" />
        <div>
          <div className="text-white font-bold text-sm">Contos de Oração</div>
          <div className="text-[0.55rem] font-extrabold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Premium</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-6 mb-8">
        <a href="#" className="text-[#94A3B8] hover:text-white text-sm no-underline transition-colors">Perguntas frequentes</a>
        <a href="#" className="text-[#94A3B8] hover:text-white text-sm no-underline transition-colors">Suporte</a>
        <a href="#" className="text-[#94A3B8] hover:text-white text-sm no-underline transition-colors">Termos de uso</a>
        <a href="#" className="text-[#94A3B8] hover:text-white text-sm no-underline transition-colors">Privacidade</a>
      </div>
      <p className="text-[#94A3B8] text-xs">© 2026 Contos de Oração Brasil. Todos os direitos reservados.</p>
    </footer>
  );
}
