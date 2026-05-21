"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

/* ── Ícones SVG ── */
const IconCursos = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
const IconLoja = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconBiblia = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v5M9.5 4.5h5"/><path d="M4 9h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V9z"/>
    <path d="M4 9c0 0 4-3 8 0s8 0 8 0"/>
  </svg>
);
const IconOracoes = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3C10 6.5 8.5 9 8.5 12s3.5 6 3.5 9c0-3 3.5-5.5 3.5-9S14 6.5 12 3z"/>
    <ellipse cx="12" cy="4.5" rx="1" ry="1.5" fill="currentColor" stroke="none" opacity="0.6"/>
  </svg>
);
const IconLiturgia = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M12 14v4M10 16h4"/>
  </svg>
);
const IconPlanos = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IconInicio = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const GRUPO_1 = [
  { label: 'Cursos', Icon: IconCursos },
  { label: 'Loja',   Icon: IconLoja   },
];
const GRUPO_2 = [
  { label: 'Bíblia',          Icon: IconBiblia   },
  { label: 'Orações',         Icon: IconOracoes  },
  { label: 'Liturgia diária', Icon: IconLiturgia },
];

export default function Navbar() {
  const pathname                      = usePathname();
  const router                        = useRouter();
  const [versao, setVersao]           = useState<string | null>(null);
  const [apkUrl, setApkUrl]           = useState('#');
  const [showManual, setShowManual]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [isScrolled, setIsScrolled]   = useState(false);

  // Monitora o scroll para aplicar o efeito de fundo translúcido
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Verifica autenticação
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Busca versão APK
  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const ts   = new Date().getTime();
        const res  = await fetch(`/api/apk?t=${ts}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok) {
          if (data.link_download) setApkUrl(data.link_download);
          if (data.versao_atual)  setVersao(data.versao_atual);
        }
      } catch (e) { console.error('Erro APK', e); }
    };
    checkUpdate();
  }, []);

  // "Entrar" funciona em QUALQUER página:
  // - Na home: abre o modal via CustomEvent
  // - Em outras páginas: navega para home com ?modal=login
  const handleEntrar = () => {
    setSidebarOpen(false);
    if (pathname === '/') {
      window.dispatchEvent(new CustomEvent('open-login'));
    } else {
      router.push('/?modal=login');
    }
  };

  // Mostra "Início" só quando:
  // - NÃO está na home (pathname !== '/')
  // - NÃO está logado
  const showInicio = pathname !== '/' && !isLoggedIn;

  // Mostra "Entrar | Inscreva-se" só quando não está logado
  const showAuth = !isLoggedIn;

  return (
    <>
      {/* ════════ HEADER HORIZONTAL PREMIUM ════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 sm:px-6 md:px-8 transition-all duration-300"
        style={{
          height: '72px',
          background: isScrolled ? 'rgba(9, 11, 16, 0.88)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
          boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.4)' : 'none',
        }}
      >
        {/* Menu Esquerdo (Hambúrguer + "MENU") com renderização condicional JSX garantida */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#fff',
              fontFamily: 'Outfit, sans-serif',
              display: 'flex',
            }}
          >
            <div className="flex flex-col justify-center gap-[4px] w-[18px] h-[14px]">
              <span className="block w-full h-[2px] rounded-full bg-white transition-all duration-300" />
              <span className="block w-full h-[2px] rounded-full bg-white transition-all duration-300" />
              <span className="block w-full h-[2px] rounded-full bg-white transition-all duration-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider select-none text-white/90">
              MENU
            </span>
          </button>
        )}

        {/* Logo Centro */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            <Image src="/logo.png" alt="Contos de Oração" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <div className="text-left">
            <div className="text-white font-black text-xs sm:text-sm leading-tight tracking-wide"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)', fontFamily: 'Outfit, sans-serif' }}>
              Contos de Oração
            </div>
            <div className="text-[#D4AF37] text-[0.45rem] sm:text-[0.5rem] font-black uppercase tracking-widest leading-none mt-0.5"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
              Catequese Digital
            </div>
          </div>
        </div>

        {/* Links Direita */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
          <div className="hidden md:flex items-center gap-3 sm:gap-4 text-xs font-black uppercase tracking-wider">
            <Link href="/planos" className="hover:text-white transition-colors no-underline text-white/70">
              Loja
            </Link>
            <span className="text-white/20 select-none">|</span>
            <button
              onClick={isLoggedIn ? () => router.push('/watch') : handleEntrar}
              className="hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer font-black text-xs uppercase tracking-wider text-white/70"
            >
              Minha Conta
            </button>
            <span className="text-white/20 select-none">|</span>
          </div>

          {/* Lupa de Busca */}
          <Link href="/watch" className="text-white/70 hover:text-white transition-colors flex items-center" title="Pesquisar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          {/* Botão ASSINAR AGORA */}
          <Link
            href="/planos"
            className="flex items-center justify-center px-4 py-2 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-[#D4AF37]/10"
            style={{
              background: '#D4AF37',
              color: '#090B10',
              textDecoration: 'none',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Assinar Agora
          </Link>
        </div>
      </header>

      {/* ════════ BACKDROP — fecha ao clicar fora ════════ */}
      <div
        className="fixed inset-0 z-[65] transition-all duration-300"
        style={{
          background: sidebarOpen ? 'rgba(0,0,0,0.28)' : 'transparent',
          backdropFilter: sidebarOpen ? 'blur(1.5px)' : 'none',
          pointerEvents: sidebarOpen ? 'auto' : 'none',
        }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ════════ SIDEBAR — esquerda ════════ */}
      <aside
        className="fixed top-0 left-0 h-full w-[230px] z-[70] flex flex-col"
        style={{
          background: '#0A0C12',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          fontFamily: 'Outfit, sans-serif',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Botão de Fechar premium no topo direito da sidebar esquerda */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-4 text-white/50 hover:text-white hover:bg-white/10 transition-all p-1.5 rounded-lg flex items-center justify-center cursor-pointer active:scale-95"
          title="Fechar Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Logo dentro da sidebar */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-4 pr-12">
          <Image src="/logo.png" alt="Contos de Oração" width={40} height={40} className="object-contain drop-shadow-lg" />
          <div>
            <div className="text-white font-black text-sm leading-tight">Contos de Oração</div>
            <div className="text-[#D4AF37] text-[0.55rem] font-bold uppercase tracking-widest mt-0.5">Catequese Digital</div>
          </div>
        </div>

        {/* Divisor */}
        <div className="mx-5 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* ── Entrar | Inscreva-se (só quando NÃO logado) ── */}
        {showAuth && (
          <div className="flex items-center gap-3 px-5 py-4">
            <button onClick={handleEntrar}
              className="text-white text-sm font-black hover:text-[#D4AF37] transition-colors">
              Entrar
            </button>
            <span className="text-white/20 text-sm">|</span>
            <Link href="/planos" onClick={() => setSidebarOpen(false)}
              className="text-white/60 text-sm font-semibold hover:text-white transition-colors no-underline">
              Inscreva-se
            </Link>
          </div>
        )}

        {/* Divisor */}
        <div className="mx-5 h-px mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* ── MENU ── */}
        <nav className="flex flex-col px-3 gap-0.5">

          {/* ── Início (só aparece em outras páginas E sem login) ── */}
          {showInicio && (
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 group no-underline"
            >
              <span className="text-white/60 group-hover:text-white transition-colors">
                <IconInicio />
              </span>
              <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-colors">Início</span>
            </Link>
          )}

          {/* ── Planos (item ativo, sempre visível) ── */}
          <Link
            href="/planos"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 group no-underline"
          >
            <span className="text-[#D4AF37] opacity-70 group-hover:opacity-100 transition-opacity">
              <IconPlanos />
            </span>
            <span className="text-white/80 group-hover:text-white text-sm font-semibold transition-colors">Planos</span>
          </Link>

          {/* Separador */}
          <div className="mx-3 my-2 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Grupo 1 — Em breve */}
          {GRUPO_1.map(({ label, Icon }) => (
            <div key={label} title="Em breve"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-not-allowed select-none">
              <div className="flex items-center gap-3">
                <span className="opacity-25 text-white"><Icon /></span>
                <span className="text-white/25 text-sm font-semibold">{label}</span>
              </div>
              <span className="text-[0.46rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(212,175,55,0.45)' }}>
                Em breve
              </span>
            </div>
          ))}

          {/* Separador */}
          <div className="mx-3 my-2 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Grupo 2 — Em breve */}
          {GRUPO_2.map(({ label, Icon }) => (
            <div key={label} title="Em breve"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-not-allowed select-none">
              <div className="flex items-center gap-3">
                <span className="opacity-25 text-white"><Icon /></span>
                <span className="text-white/25 text-sm font-semibold">{label}</span>
              </div>
              <span className="text-[0.46rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(212,175,55,0.45)' }}>
                Em breve
              </span>
            </div>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Manual / App */}
        <div className="px-4 pb-5">
          <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <button
            onClick={() => setShowManual(true)}
            className="w-full flex items-center gap-2 justify-center border rounded-xl py-2.5 px-4 transition-all hover:border-[#D4AF37]/50 text-sm"
            style={{ background: '#15243E', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: '#090B10', border: '1px solid #D4AF37' }}>
              <Image src="/logo.png" alt="Logo" width={20} height={20} className="object-cover" />
            </div>
            <span className="text-white font-bold">Manual / App</span>
          </button>
        </div>
      </aside>

      {/* ════════ MODAL MANUAL ════════ */}
      {showManual && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowManual(false)}>
          <div className="bg-[#090B10] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative login-modal-in"
            style={{ fontFamily: 'Outfit, sans-serif' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowManual(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
                  Baixe o nosso aplicativo oficial. Seu celular pedirá para{' '}
                  <strong className="text-white">permitir a instalação de aplicativos desconhecidos</strong>.
                  Basta autorizar e instalar o arquivo <span className="text-[#D4AF37] font-mono">.apk</span>.
                </p>
                {apkUrl !== '#' ? (
                  <a href={apkUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#090B10] px-6 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 shadow-lg">
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
                  Funciona diretamente pelo navegador da sua TV:
                </p>
                <ol className="text-white/80 text-sm md:text-base space-y-3 list-decimal list-outside ml-4">
                  <li>Abra o <strong className="text-white">Navegador de Internet</strong> da sua TV.</li>
                  <li>Acesse <strong className="text-[#D4AF37]">contosdeoracao.com.br</strong>.</li>
                  <li>Clique na aba <strong className="text-white">📱 Celular / TV</strong>.</li>
                  <li>Escaneie o <strong>QR Code</strong> com seu celular.</li>
                  <li>A TV será logada automaticamente!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
