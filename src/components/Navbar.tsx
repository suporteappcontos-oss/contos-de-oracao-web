"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';

const GRUPO_1 = [
  { label: 'Cursos',  emoji: '🎓' },
  { label: 'Loja',    emoji: '🛍️' },
];

const GRUPO_2 = [
  { label: 'Bíblia',         emoji: '📖' },
  { label: 'Orações',        emoji: '🙏' },
  { label: 'Liturgia diária', emoji: '✝️' },
];

export default function Navbar() {
  const [versao, setVersao]         = useState<string | null>(null);
  const [apkUrl, setApkUrl]         = useState('#');
  const [showManual, setShowManual] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const timestamp = new Date().getTime();
        const res  = await fetch(`/api/apk?t=${timestamp}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok) {
          if (data.link_download) setApkUrl(data.link_download);
          if (data.versao_atual)  setVersao(data.versao_atual);
        }
      } catch (e) { console.error("Erro ao buscar versão do APK", e); }
    };
    checkUpdate();
  }, []);

  // Dispara evento global para o Hero abrir o modal de login
  const handleEntrar = () => {
    window.dispatchEvent(new CustomEvent('open-login'));
    setMobileOpen(false);
  };

  /* ─── Conteúdo reutilizável da sidebar ─── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <Image src="/logo.png" alt="Contos de Oração" width={40} height={40} className="object-contain drop-shadow-lg" />
        <div>
          <div className="text-white font-black text-sm leading-tight">Contos de Oração</div>
          <div className="text-[#D4AF37] text-[0.55rem] font-bold uppercase tracking-widest mt-0.5">Catequese Digital</div>
        </div>
      </div>

      {/* Divisor */}
      <div className="mx-5 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Entrar | Inscreva-se */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={handleEntrar}
          className="text-white text-sm font-black hover:text-[#D4AF37] transition-colors"
        >
          Entrar
        </button>
        <span className="text-white/20 text-sm">|</span>
        <Link href="/planos" className="text-white/60 text-sm font-semibold hover:text-white transition-colors no-underline">
          Inscreva-se
        </Link>
      </div>

      {/* Divisor */}
      <div className="mx-5 h-px mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Grupo 1: Cursos, Loja */}
      <nav className="flex flex-col px-3 gap-0.5">
        {GRUPO_1.map(item => (
          <div
            key={item.label}
            title="Em breve"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-not-allowed select-none"
          >
            <div className="flex items-center gap-3">
              <span className="text-base opacity-30">{item.emoji}</span>
              <span className="text-white/25 text-sm font-semibold">{item.label}</span>
            </div>
            <span
              className="text-[0.48rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(212,175,55,0.4)' }}
            >
              Em breve
            </span>
          </div>
        ))}

        {/* ── Linha separadora no meio ── */}
        <div className="mx-3 my-2.5 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Grupo 2: Bíblia, Orações, Liturgia diária */}
        {GRUPO_2.map(item => (
          <div
            key={item.label}
            title="Em breve"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-not-allowed select-none"
          >
            <div className="flex items-center gap-3">
              <span className="text-base opacity-30">{item.emoji}</span>
              <span className="text-white/25 text-sm font-semibold">{item.label}</span>
            </div>
            <span
              className="text-[0.48rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(212,175,55,0.4)' }}
            >
              Em breve
            </span>
          </div>
        ))}
      </nav>

      {/* Espaço flex */}
      <div className="flex-1" />

      {/* Manual / App */}
      <div className="px-4 pb-5">
        <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <button
          onClick={() => setShowManual(true)}
          className="w-full flex items-center gap-2 justify-center border rounded-xl py-2.5 px-4 transition-all hover:border-[#D4AF37]/50 text-sm"
          style={{ background: '#15243E', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden shrink-0"
            style={{ background: '#090B10', border: '1px solid #D4AF37' }}
          >
            <Image src="/logo.png" alt="Logo" width={20} height={20} className="object-cover" />
          </div>
          <span className="text-white font-bold">Manual / App</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ════════════════════════════════════
          SIDEBAR DESKTOP (md+)
      ════════════════════════════════════ */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-full w-[220px] z-50 flex-col"
        style={{ background: '#0A0C12', borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        <SidebarContent />
      </aside>

      {/* ════════════════════════════════════
          TOP BAR MOBILE
      ════════════════════════════════════ */}
      <header
        className="md:hidden fixed top-0 w-full z-50 flex items-center justify-between px-4 h-[56px]"
        style={{ background: '#0A0C12', borderBottom: '1px solid rgba(255,255,255,0.07)', fontFamily: 'Outfit, sans-serif' }}
      >
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={30} height={30} className="object-contain" />
          <span className="text-white font-black text-sm">Contos de Oração</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleEntrar} className="text-white text-sm font-black hover:text-[#D4AF37] transition-colors">
            Entrar
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/70 p-1 ml-1">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M3 12h18M3 6h18M3 18h18"} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════
          MENU MOBILE OVERLAY
      ════════════════════════════════════ */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[49] bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-[56px] left-0 w-[240px] h-[calc(100%-56px)] overflow-y-auto"
            style={{ background: '#0A0C12', borderRight: '1px solid rgba(255,255,255,0.07)' }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          MODAL MANUAL
      ════════════════════════════════════ */}
      {showManual && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowManual(false)}
        >
          <div
            className="bg-[#090B10] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative login-modal-in"
            style={{ fontFamily: 'Outfit, sans-serif' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowManual(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="p-6 md:p-10">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-8 tracking-tight text-center">Manual de Acesso</h2>
              <div className="mb-6 bg-[#15243E]/40 p-6 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📱</span>
                  <h3 className="text-[#D4AF37] font-extrabold text-lg md:text-xl">Para Celulares Android</h3>
                </div>
                <p className="text-white/70 text-sm md:text-base mb-5 leading-relaxed">
                  Baixe o nosso aplicativo oficial. Como ele não está na Play Store, seu celular pedirá para{' '}
                  <strong className="text-white">permitir a instalação de aplicativos desconhecidos</strong>.
                  Basta autorizar nas configurações e instalar o arquivo <span className="text-[#D4AF37] font-mono">.apk</span>.
                </p>
                {apkUrl !== '#' ? (
                  <a
                    href={apkUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#090B10] px-6 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 shadow-lg"
                  >
                    Baixar o App Agora
                    {versao && <span className="bg-black/10 px-2 py-0.5 rounded-md text-xs ml-1">v{versao}</span>}
                  </a>
                ) : (
                  <span className="text-white/50 text-sm italic">O aplicativo estará disponível em breve.</span>
                )}
              </div>
              <div className="bg-[#15243E]/40 p-6 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📺</span>
                  <h3 className="text-[#D4AF37] font-extrabold text-lg md:text-xl">Para Smart TVs e TV Box</h3>
                </div>
                <p className="text-white/70 text-sm md:text-base mb-4 leading-relaxed">
                  Não é necessário instalar nenhum aplicativo! Funciona diretamente pelo navegador da sua TV:
                </p>
                <ol className="text-white/80 text-sm md:text-base space-y-3 list-decimal list-outside ml-4">
                  <li>Abra o <strong className="text-white">Navegador de Internet</strong> da sua TV.</li>
                  <li>Acesse o site <strong className="text-[#D4AF37]">contosdeoracao.com.br</strong>.</li>
                  <li>Na caixa de login, clique na aba <strong className="text-white">📱 Celular / TV</strong>.</li>
                  <li>Um <strong>QR Code</strong> vai aparecer na tela da sua TV.</li>
                  <li>Abra a câmera do seu celular e aponte para o QR Code da TV.</li>
                  <li>A TV será logada automaticamente na sua conta!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
