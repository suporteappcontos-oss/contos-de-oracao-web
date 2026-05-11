"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [versao, setVersao] = useState<string | null>(null);
  const [apkUrl, setApkUrl] = useState('#');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/apk?t=${timestamp}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok) {
          if (data.link_download) setApkUrl(data.link_download);
          if (data.versao_atual) setVersao(data.versao_atual);
        }
      } catch (e) {
        console.error("Erro ao buscar versão do APK", e);
      }
    };
    checkUpdate();
  }, []);

  return (
    <>
    <header
      className={`fixed top-0 w-full flex justify-between items-center py-3 px-[4%] transition-all duration-400 z-[100] ${
        scrolled ? "bg-[#090B10]/90 shadow-2xl backdrop-blur-md" : "bg-transparent"
      }`}
    >
      {/* Logo + Nome */}
      <Link href="/" className="flex items-center gap-3 no-underline">
        <Image
          src="/logo.png"
          alt="Contos de Oração"
          width={54}
          height={54}
          className="object-contain drop-shadow-lg"
        />
        <span className="text-white font-black text-2xl hidden sm:inline tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Contos de Oração
        </span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/planos" className="text-white/70 hover:text-white text-sm transition-colors no-underline font-semibold">Planos</Link>

        {/* Botão Baixar App - Dropdown */}
        {apkUrl !== '#' && (
          <div className="relative group">
            <button
              className="flex items-center gap-2 bg-[#15243E] border border-white/10 rounded-full py-1.5 px-3 transition-all hover:scale-105 hover:border-[#D4AF37]/50 text-xs sm:text-sm cursor-pointer"
              title="Opções do Aplicativo"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                   style={{ background: '#090B10', border: '1px solid #D4AF37' }}>
                <img src="/logo_stripe.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-bold hidden sm:inline">Baixar App</span>
              {versao && (
                <span className="text-[0.5rem] font-bold uppercase px-1 py-0.5 rounded-sm leading-none hidden sm:inline" style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>
                  v{versao}
                </span>
              )}
            </button>

            {/* Menu Dropdown */}
            <div className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 border shadow-2xl"
                 style={{ background: 'rgba(10, 12, 17, 0.95)', backdropFilter: 'blur(10px)', borderColor: 'rgba(212,175,55,0.3)' }}>
              <div className="p-2 flex flex-col gap-1">
                <a 
                  href={apkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-white no-underline group/item"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover/item:bg-[#D4AF37]/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-none mb-1">Para Celular</span>
                    <span className="text-[0.65rem] text-slate-400 leading-none">Baixar o APK Android</span>
                  </div>
                </a>
                
                <button 
                  onClick={() => document.getElementById('modal-tv')?.classList.remove('hidden')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-white text-left group/item"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover/item:bg-[#D4AF37]/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-none mb-1">Para TV</span>
                    <span className="text-[0.65rem] text-slate-400 leading-none">Android TV, FireStick...</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botões Redes Sociais */}
        <a
          href="https://www.instagram.com/contosdeoracao"
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
          className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>

        <a
          href="https://www.facebook.com/share/18cmN9eVCw/"
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook"
          className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ background: '#1877F2' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>

        {/* WhatsApp com mensagem pré-definida */}
        <a
          href="https://wa.me/5566997182760?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Contos%20de%20Oração"
          target="_blank"
          rel="noopener noreferrer"
          title="Suporte via WhatsApp"
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ background: '#25D366' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      </div>
    </header>

    {/* Modal de Instruções TV */}
    <div id="modal-tv" className="fixed inset-0 z-[999] hidden flex items-center justify-center p-4">
      {/* Fundo escuro */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={() => document.getElementById('modal-tv')?.classList.add('hidden')}
      />
      
      {/* Container Principal */}
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border"
           style={{ background: '#0A0C11', borderColor: 'rgba(212,175,55,0.3)' }}>
        
        {/* Cabeçalho Modal */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, transparent 100%)' }}>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
            Como instalar na Smart TV
          </h3>
          <button 
            onClick={() => document.getElementById('modal-tv')?.classList.add('hidden')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 flex flex-col gap-5 text-slate-300 text-sm">
          <p className="font-semibold text-white">É muito fácil instalar o Contos de Oração na sua Android TV, TV Box ou Fire TV Stick:</p>
          
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-[#D4AF37] bg-[#D4AF37]/10">1</div>
            <div>
              <p>Abra a loja de aplicativos da sua TV (Play Store ou Amazon Appstore).</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-[#D4AF37] bg-[#D4AF37]/10">2</div>
            <div>
              <p>Busque e instale o aplicativo gratuito chamado <strong className="text-white">"Downloader"</strong> (tem o ícone laranja).</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-[#D4AF37] bg-[#D4AF37]/10">3</div>
            <div>
              <p>Abra o Downloader, vá na barra de URL e digite exatamente o endereço do nosso site:</p>
              <div className="mt-2 p-3 rounded-lg border border-white/10 bg-black/50 text-center">
                <span className="font-mono text-lg text-[#D4AF37] tracking-wider">contosdeoracao.com.br</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-[#D4AF37] bg-[#D4AF37]/10">4</div>
            <div>
              <p>O site vai abrir na sua TV. É só clicar no botão de <strong className="text-white">Baixar App</strong> e a TV vai instalar o aplicativo automaticamente!</p>
            </div>
          </div>

          <div className="mt-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(212,175,55,0.05)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.1)' }}>
            <strong>Dica:</strong> Se a sua TV pedir permissão para "instalar aplicativos de fontes desconhecidas", pode permitir com segurança.
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
