"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';

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
            <Image src="/logo.png" alt="Logo App" width={24} height={24} className="object-cover" />
          </div>
          <span className="text-white font-bold hidden sm:inline">Manual / App</span>
        </button>

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
