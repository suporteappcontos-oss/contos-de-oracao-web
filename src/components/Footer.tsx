import React from 'react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer
      className="pt-14 pb-8 px-[4%]"
      style={{ background: '#090B10', borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: 'Outfit, sans-serif' }}
    >
      {/* ── Linha principal: Logo + links à esquerda | Redes sociais à direita ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10 mb-10">

        {/* Esquerda: Logo + links */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Contos de Oração" width={38} height={38} className="object-contain opacity-80" />
            <div>
              <div className="text-white font-bold text-sm leading-tight">Contos de Oração</div>
              <div className="text-[#D4AF37] text-[0.6rem] font-bold uppercase tracking-widest">Catequese Digital</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <a href="/faq" className="text-[#94A3B8] hover:text-white text-sm no-underline transition-colors">Perguntas frequentes</a>
            <a href="mailto:contato@contosdeoracao.com.br" className="text-[#94A3B8] hover:text-white text-sm no-underline transition-colors">Suporte</a>
            <a href="/termos" className="text-[#94A3B8] hover:text-white text-sm no-underline transition-colors">Termos de uso</a>
            <a href="/privacidade" className="text-[#94A3B8] hover:text-white text-sm no-underline transition-colors">Privacidade</a>
            <a href="/planos" className="text-[#94A3B8] hover:text-white text-sm no-underline transition-colors">Planos</a>
          </div>
        </div>

        {/* Direita: Redes sociais + suporte */}
        <div className="flex flex-col items-start sm:items-end gap-4">
          <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest">Nos acompanhe</p>
          <div className="flex items-center gap-3">

            {/* Instagram */}
            <a
              href="https://www.instagram.com/contosdeoracao"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/18cmN9eVCw/"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:brightness-110"
              style={{ background: '#1877F2' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Linha inferior: Copyright + Desenvolvedor ── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="text-[#94A3B8] text-xs">
          © 2026 Contos de Oração Brasil. Todos os direitos reservados.
        </p>
        <p className="text-[#94A3B8] text-xs">
          Desenvolvido por{' '}
          <a
            href="https://wa.me/5566997182760"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D4AF37] hover:text-[#f0c84a] font-semibold no-underline transition-colors"
          >
            LDP Studios
          </a>
        </p>
      </div>
    </footer>
  );
}

