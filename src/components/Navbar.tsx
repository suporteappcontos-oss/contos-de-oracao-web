"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [versao, setVersao] = useState<string | null>(null);
  const [apkUrl, setApkUrl] = useState('#');
  const [showManual, setShowManual] = useState(false);

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

        {/* Botão Manual / Baixar App */}
        <button
          onClick={() => setShowManual(true)}
          className="flex items-center gap-2 bg-[#15243E] border border-white/10 rounded-full py-1.5 px-3 sm:px-4 transition-all hover:scale-105 hover:border-[#D4AF37]/50 text-xs sm:text-sm shadow-lg"
          title="Manual de Instruções e App"
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
               style={{ background: '#090B10', border: '1px solid #D4AF37' }}>
            <span className="text-[#D4AF37] font-black text-sm">?</span>
          </div>
          <span className="text-white font-bold hidden sm:inline">Manual / App</span>
        </button>

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

      {/* Modal Manual */}
      {showManual && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#090B10] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <button 
              onClick={() => setShowManual(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="p-6 md:p-10">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-8 tracking-tight text-center">Manual de Acesso</h2>
              
              {/* Celulares */}
              <div className="mb-6 bg-[#15243E]/40 p-6 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📱</span>
                  <h3 className="text-[#D4AF37] font-extrabold text-lg md:text-xl">Para Celulares Android</h3>
                </div>
                <p className="text-white/70 text-sm md:text-base mb-5 leading-relaxed">
                  Baixe o nosso aplicativo oficial. Como ele não está na Play Store, seu celular pedirá para <strong className="text-white">permitir a instalação de aplicativos desconhecidos</strong>. Basta autorizar nas configurações e instalar o arquivo <span className="text-[#D4AF37] font-mono">.apk</span>.
                </p>
                {apkUrl !== '#' ? (
                  <a
                    href={apkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#090B10] px-6 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 shadow-lg"
                  >
                    Baixar o App Agora
                    {versao && <span className="bg-black/10 px-2 py-0.5 rounded-md text-xs ml-1">v{versao}</span>}
                  </a>
                ) : (
                  <span className="text-white/50 text-sm italic">O aplicativo estará disponível em breve.</span>
                )}
              </div>

              {/* TVs */}
              <div className="bg-[#15243E]/40 p-6 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📺</span>
                  <h3 className="text-[#D4AF37] font-extrabold text-lg md:text-xl">Para Smart TVs e TV Box (Fire Stick, Roku, etc)</h3>
                </div>
                <p className="text-white/70 text-sm md:text-base mb-4 leading-relaxed">
                  Não é necessário instalar nenhum aplicativo! Funciona diretamente pelo navegador da sua TV:
                </p>
                <ol className="text-white/80 text-sm md:text-base space-y-3 list-decimal list-outside ml-4">
                  <li>Abra o <strong className="text-white">Navegador de Internet</strong> da sua TV.</li>
                  <li>Acesse o site <strong className="text-[#D4AF37]">contosdeoracao.com.br</strong>.</li>
                  <li>Na caixa de login, clique na aba <strong className="text-white">📱 Celular / TV</strong>.</li>
                  <li>Um <strong>QR Code</strong> vai aparecer na tela da sua TV.</li>
                  <li>Abra a câmera do seu celular (onde você já deve estar logado no site/app) e aponte para o QR Code da TV.</li>
                  <li>A TV será logada automaticamente na sua conta!</li>
                </ol>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}
