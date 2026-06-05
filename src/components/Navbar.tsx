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

const IconVideos = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconRevistas = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IconMateriais = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconSobre = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export default function Navbar() {
  const pathname                      = usePathname();
  const router                        = useRouter();
  const [versao, setVersao]           = useState<string | null>(null);
  const [apkUrl, setApkUrl]           = useState('#');
  const [showManual, setShowManual]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser]               = useState<any>(null);
  const [isAdmin, setIsAdmin]         = useState(false);
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

  // Verifica autenticação e registra o acesso ao site
  useEffect(() => {
    const supabase = createClient();
    
    const registrarAcesso = (userId: string) => {
      const acessoRegistrado = sessionStorage.getItem('cdo_acesso_site_registrado');
      if (!acessoRegistrado) {
        fetch('/api/registrar-acesso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'site' })
        }).then(res => {
          if (res.ok) {
            sessionStorage.setItem('cdo_acesso_site_registrado', 'true');
          }
        }).catch(err => console.error('Erro ao registrar acesso:', err));
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
      if (session?.user) {
        registrarAcesso(session.user.id);
        setIsAdmin(session.user.email === 'suporte.appcontos@gmail.com' || session.user.user_metadata?.role === 'admin');
        supabase.from('perfis').select('role').eq('id', session.user.id).single().then(({ data }) => {
          if (data?.role === 'admin') {
            setIsAdmin(true);
          }
        });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
      if (session?.user) {
        registrarAcesso(session.user.id);
        setIsAdmin(session.user.email === 'suporte.appcontos@gmail.com' || session.user.user_metadata?.role === 'admin');
        supabase.from('perfis').select('role').eq('id', session.user.id).single().then(({ data }) => {
          if (data?.role === 'admin') {
            setIsAdmin(true);
          }
        });
      } else {
        setIsAdmin(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setSidebarOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

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
          background: isScrolled 
            ? 'rgba(9, 11, 16, 0.92)' 
            : 'linear-gradient(to bottom, rgba(9, 11, 16, 0.95) 0%, rgba(9, 11, 16, 0.5) 60%, transparent 100%)',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          borderBottom: 'none',
          boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.4)' : 'none',
        }}
      >
        {/* Menu Esquerdo (Hambúrguer + "MENU") com visibilidade controlada para evitar layout shift */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95 animate-fade-in"
          style={{
            border: 'none',
            background: 'transparent',
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
            display: 'flex',
            visibility: sidebarOpen ? 'hidden' : 'visible',
            opacity: sidebarOpen ? 0 : 1,
            pointerEvents: sidebarOpen ? 'none' : 'auto',
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

        {/* Logo Centro — Posicionado de forma absoluta no centro físico da barra de navegação para evitar qualquer oscilação ou deslocamento quando o botão do menu é acionado */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 sm:gap-3.5 z-10">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden shrink-0 shadow-[0_3px_15px_rgba(0,0,0,0.6)] border border-white/15">
            <Image src="/logo.png" alt="Contos de Oração" width={52} height={52} className="object-cover w-full h-full" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-white font-black text-sm sm:text-lg md:text-xl leading-tight tracking-wide"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)', fontFamily: 'Outfit, sans-serif' }}>
              Contos de Oração
            </div>
            <div className="text-[#D4AF37] text-[0.55rem] sm:text-[0.65rem] md:text-[0.7rem] font-black uppercase tracking-widest leading-none mt-1"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              Catequese Digital
            </div>
          </div>
        </div>

        {/* Links Direita — ml-auto garante o alinhamento fixado à direita independentemente da visibilidade do botão menu */}
        <div className="flex items-center gap-1.5 sm:gap-4 md:gap-5 ml-auto">
          {/* Redes Sociais no Cabeçalho */}
          <div className="flex items-center gap-2 mr-1 sm:mr-2">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/contosdeoracao"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/18cmN9eVCw/"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:brightness-110"
              style={{ background: '#1877F2' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@contosdeoracao?_r=1&_t=ZS-96xhLBWCRVc"
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok"
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 hover:brightness-110"
              style={{ background: '#000000', border: '1px solid rgba(255, 255, 255, 0.15)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M16.6 3c.2 1.8 1.2 3.5 2.8 4.5 1 .7 2.1 1.1 3.3 1.2v3.4c-1.8-.1-3.5-.6-5.1-1.5v6.4c0 3.8-3.1 6.9-6.9 6.9S3.8 20.8 3.8 17s3.1-6.9 6.9-6.9c.3 0 .6 0 .9.1v3.5c-.3-.1-.6-.1-.9-.1-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4V3h2.5z"></path></svg>
            </a>
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-3.5">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)', textDecoration: 'none' }}
                >
                  <span className="hidden sm:inline">Painel Admin</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              )}

              <Link
                href="/perfil"
                className="group flex items-center gap-1.5 px-1.5 py-1 rounded-xl transition-all hover:bg-white/5 no-underline"
                title="Meu perfil"
              >
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border transition-all group-hover:border-[#D4AF37] shrink-0"
                  style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.nome || user?.email?.split('@')[0] || 'User')}&background=111827&color=D4AF37&bold=true&size=128`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs transition-all h-full bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500/35 cursor-pointer"
              >
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-3 sm:gap-4 text-xs font-black uppercase tracking-wider">
                <Link href="/loja" className="hover:text-[#D4AF37] transition-colors no-underline text-white font-extrabold" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.95)' }}>
                  Loja
                </Link>
                <span className="text-white/20 select-none">|</span>
                <button
                  onClick={handleEntrar}
                  className="hover:text-[#D4AF37] transition-colors bg-transparent border-none p-0 cursor-pointer font-extrabold text-xs uppercase tracking-wider text-white"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.95)' }}
                >
                  Entrar
                </button>
              </div>
            </>
          )}
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

        {/* ── Entrar (só quando NÃO logado) ── */}
        {showAuth && (
          <div className="px-5 py-4 w-full">
            <button
              onClick={handleEntrar}
              className="w-full flex items-center justify-center gap-2 border rounded-xl py-2.5 px-4 text-[#D4AF37] hover:text-white transition-all duration-300 font-black text-sm active:scale-95 cursor-pointer"
              style={{ background: 'rgba(212, 175, 55, 0.1)', borderColor: 'rgba(212, 175, 55, 0.25)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Entrar
            </button>
          </div>
        )}

        {/* Divisor */}
        <div className="mx-5 h-px mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* ── MENU ── */}
        <nav className="flex flex-col px-3 gap-0.5">

          {/* ── Home (só aparece se pathname !== '/') ── */}
          {pathname !== '/' && (
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent group no-underline relative overflow-hidden"
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#D4AF37] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
              <span className="text-white/60 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all duration-300">
                <IconInicio />
              </span>
              <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-all duration-300">Home</span>
            </Link>
          )}

          {/* ── Assinatura / Trocar assinatura ── */}
          <Link
            href="/planos"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent group no-underline relative overflow-hidden"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#D4AF37] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
            <span className="text-white/60 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all duration-300">
              <IconPlanos />
            </span>
            <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-all duration-300">
              Assinatura
            </span>
          </Link>

          {/* ── Vídeos ── */}
          {pathname !== '/watch' && (
            <Link
              href={isLoggedIn ? "/watch" : "/?modal=login"}
              onClick={(e) => {
                setSidebarOpen(false);
                if (!isLoggedIn) {
                  e.preventDefault();
                  handleEntrar();
                }
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent group no-underline relative overflow-hidden"
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#D4AF37] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
              <span className="text-white/60 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all duration-300">
                <IconVideos />
              </span>
              <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-all duration-300">Vídeos</span>
            </Link>
          )}

          {/* ── Revistas ── */}
          <Link
            href={isLoggedIn ? "/hq" : "/?modal=login"}
            onClick={(e) => {
              setSidebarOpen(false);
              if (!isLoggedIn) {
                e.preventDefault();
                handleEntrar();
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent group no-underline relative overflow-hidden"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#D4AF37] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
            <span className="text-white/60 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all duration-300">
              <IconRevistas />
            </span>
            <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-all duration-300 flex items-center gap-1.5">
              Revistas
              <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-wider bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">Em breve</span>
            </span>
          </Link>

          {/* ── Materiais ── */}
          <Link
            href={isLoggedIn ? "/materiais" : "/?modal=login"}
            onClick={(e) => {
              setSidebarOpen(false);
              if (!isLoggedIn) {
                e.preventDefault();
                handleEntrar();
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent group no-underline relative overflow-hidden"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#D4AF37] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
            <span className="text-white/60 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all duration-300">
              <IconMateriais />
            </span>
            <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-all duration-300">Materiais</span>
          </Link>

          {/* ── Cursos ── */}
          <Link
            href="/cursos"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent group no-underline relative overflow-hidden"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#D4AF37] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
            <span className="text-white/60 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all duration-300">
              <IconCursos />
            </span>
            <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-all duration-300 flex items-center gap-1.5">
              Cursos
              <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-wider bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">Em breve</span>
            </span>
          </Link>

          {/* ── Loja ── */}
          <Link
            href="/loja"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent group no-underline relative overflow-hidden"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#D4AF37] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
            <span className="text-white/60 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all duration-300">
              <IconLoja />
            </span>
            <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-all duration-300">
              Loja
            </span>
          </Link>

          {/* ── Sobre ── */}
          <a
            href="https://d-biblical-visions.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent group no-underline relative overflow-hidden"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#D4AF37] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
            <span className="text-white/60 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all duration-300">
              <IconSobre />
            </span>
            <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-all duration-300">Sobre</span>
          </a>
        </nav>

        <div className="flex-1" />

        {/* Manual / App & Suporte */}
        <div className="px-4 pb-5 flex flex-col gap-2">
          <div className="h-px mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <button
            onClick={() => setShowManual(true)}
            className="w-full flex items-center gap-2 justify-center border rounded-xl py-2.5 px-4 transition-all duration-300 ease-out hover:scale-[1.03] hover:border-[#D4AF37]/60 text-sm active:scale-95 shadow-lg shadow-[#D4AF37]/5 cursor-pointer"
            style={{ background: '#15243E', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: '#090B10', border: '1px solid #D4AF37' }}>
              <Image src="/logo.png" alt="Logo" width={20} height={20} className="object-cover" />
            </div>
            <span className="text-white font-bold">Manual / App</span>
          </button>
          
          <a
            href="https://wa.me/5566997182760?text=Ol%C3%A1%2C%20seja%20bem-vindo%20ao%20Contos%20de%20Ora%C3%A7%C3%A3o.%20Em%20breve%2C%20a%20equipe%20de%20suporte%20entrar%C3%A1%20em%20contato%20com%20voc%C3%AA."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2 justify-center border rounded-xl py-2.5 px-4 transition-all duration-300 ease-out hover:scale-[1.03] hover:border-[#25D366]/60 text-sm no-underline active:scale-95 shadow-lg shadow-[#25D366]/5"
            style={{ background: '#0E2E1E', borderColor: 'rgba(37, 211, 102, 0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="shrink-0">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.182 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.528 2.015 14.07 1 11.83 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.452 3.393 1.312 4.88L2.225 21l5.422-1.846zM18.66 15c-.352-.177-2.09-1.03-2.413-1.147-.324-.117-.56-.177-.796.177-.236.353-.913 1.148-1.12 1.383-.205.234-.412.264-.764.088-.352-.176-1.488-.549-2.836-1.75-1.049-.937-1.758-2.096-1.964-2.45-.205-.353-.022-.544.154-.72.158-.158.352-.412.53-.618.176-.206.236-.353.353-.589.118-.235.059-.441-.03-.617-.088-.177-.795-1.913-1.09-2.618-.287-.69-.578-.596-.795-.607-.205-.011-.44-.011-.676-.011-.235 0-.617.088-.94.44-.324.353-1.236 1.207-1.236 2.941 0 1.734 1.265 3.411 1.442 3.646.177.235 2.49 3.801 6.03 5.33.842.364 1.5.581 2.013.743.845.269 1.615.23 2.223.14.678-.1 2.09-.854 2.383-1.678.293-.824.293-1.53.205-1.678-.088-.148-.324-.236-.677-.413z"/>
            </svg>
            <span className="text-[#25D366] font-bold">Suporte</span>
          </a>
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
              <div className="bg-[#15243E]/40 p-6 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📺</span>
                  <h3 className="text-[#D4AF37] font-extrabold text-lg md:text-xl">Para o navegador de Smart TVs e TV Box</h3>
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
