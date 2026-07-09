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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser]               = useState<Record<string, any> | null>(null);
  const [isAdmin, setIsAdmin]         = useState(false);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [isScrolled, setIsScrolled]   = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

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
    
    const registrarAcesso = () => {
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
        registrarAcesso();
        setIsAdmin(session.user.email === 'suporte.appcontos@gmail.com' || session.user.user_metadata?.role === 'admin');
        supabase.from('perfis').select('role').eq('id', session.user.id).single().then(({ data }) => {
          if (data?.role === 'admin') {
            setIsAdmin(true);
          }
        });
      }
      setIsAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
      if (session?.user) {
        registrarAcesso();
        setIsAdmin(session.user.email === 'suporte.appcontos@gmail.com' || session.user.user_metadata?.role === 'admin');
        supabase.from('perfis').select('role').eq('id', session.user.id).single().then(({ data }) => {
          if (data?.role === 'admin') {
            setIsAdmin(true);
          }
        });
      } else {
        setIsAdmin(false);
      }
      setIsAuthChecked(true);
    });
    return () => listener.subscription.unsubscribe();
  }, [pathname]);

  const handleLogout = async () => {
    setSidebarOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };



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



  // Mostra "Entrar | Inscreva-se" só quando não está logado e após checar auth
  const showAuth = isAuthChecked && !isLoggedIn;

  // Oculta a Navbar global nas páginas de checkout e autenticação que possuem cabeçalhos próprios
  const routesWithoutNavbar: string[] = [];
  if (routesWithoutNavbar.includes(pathname || '')) {
    return null;
  }

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
        {/* CSS para o botão Sair Animado e Redes Sociais */}
        <style dangerouslySetInnerHTML={{__html: `
          /* --- Botão Sair Animado --- */
          .logout-btn {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition-duration: .3s;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
            background-color: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
          }

          .logout-sign {
            width: 100%;
            transition-duration: .3s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .logout-sign svg {
            width: 15px;
            fill: #ef4444;
            transition-duration: .3s;
          }

          .logout-text {
            position: absolute;
            right: 0%;
            width: 0%;
            opacity: 0;
            color: white;
            font-size: 13px;
            font-weight: 600;
            transition-duration: .3s;
          }

          .logout-btn:hover {
            width: 95px;
            border-radius: 40px;
            transition-duration: .3s;
            background-color: rgb(239, 68, 68);
          }

          .logout-btn:hover .logout-sign {
            width: 35%;
            transition-duration: .3s;
            padding-left: 12px;
          }
          
          .logout-btn:hover .logout-sign svg {
            fill: white;
          }

          .logout-btn:hover .logout-text {
            opacity: 1;
            width: 65%;
            transition-duration: .3s;
            padding-right: 10px;
          }

          .logout-btn:active {
            transform: translate(2px, 2px);
          }

          /* --- Redes Sociais Animadas Navbar: Estilo Preenchimento --- */
          .social-wrapper-nav {
            display: none;
            justify-content: center;
            align-items: center;
            list-style: none;
            padding: 0;
            margin: 0;
          }
          @media (min-width: 768px) {
            .social-wrapper-nav {
              display: flex;
            }
          }
          .social-wrapper-nav .icon-content {
            margin: 0 6px;
            position: relative;
          }
          .social-wrapper-nav .icon-content .tooltip {
            position: absolute;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            color: #fff;
            padding: 4px 8px;
            border-radius: 5px;
            opacity: 0;
            visibility: hidden;
            font-size: 11px;
            transition: all 0.3s ease;
            white-space: nowrap;
            font-family: "Outfit", sans-serif;
            font-weight: 600;
            z-index: 20;
          }
          .social-wrapper-nav .icon-content .tooltip::before {
            position: absolute;
            content: "";
            height: 8px;
            width: 8px;
            top: -4px;
            left: 50%;
            transform: translate(-50%, 0) rotate(45deg);
            transition: all 0.3s ease;
            z-index: -1;
          }
          .social-wrapper-nav .icon-content:hover .tooltip {
            opacity: 1;
            visibility: visible;
            top: 45px;
          }
          .social-wrapper-nav .icon-content a {
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: #fff;
            background-color: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease-in-out;
            text-decoration: none;
          }
          .social-wrapper-nav .icon-content a:hover {
            box-shadow: 3px 2px 45px 0px rgba(0, 0, 0, 0.5);
            border-color: transparent;
            color: white;
          }
          .social-wrapper-nav .icon-content a svg {
            position: relative;
            z-index: 1;
            width: 18px;
            height: 18px;
            fill: currentColor;
          }
          .social-wrapper-nav .icon-content a .filled {
            position: absolute;
            top: auto;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0;
            background-color: #000;
            transition: all 0.3s ease-in-out;
            z-index: 0;
          }
          .social-wrapper-nav .icon-content a:hover .filled {
            height: 100%;
          }

          .social-wrapper-nav .icon-content a[data-social="facebook"] .filled,
          .social-wrapper-nav .icon-content a[data-social="facebook"] ~ .tooltip,
          .social-wrapper-nav .icon-content a[data-social="facebook"] ~ .tooltip::before {
            background-color: #1877f2;
          }
          .social-wrapper-nav .icon-content a[data-social="instagram"] .filled,
          .social-wrapper-nav .icon-content a[data-social="instagram"] ~ .tooltip,
          .social-wrapper-nav .icon-content a[data-social="instagram"] ~ .tooltip::before {
            background: linear-gradient(45deg, #405de6, #5b51db, #b33ab4, #c135b4, #e1306c, #fd1f1f);
          }
          .social-wrapper-nav .icon-content a[data-social="youtube"] .filled,
          .social-wrapper-nav .icon-content a[data-social="youtube"] ~ .tooltip,
          .social-wrapper-nav .icon-content a[data-social="youtube"] ~ .tooltip::before {
            background-color: #ff0000;
          }
          .social-wrapper-nav .icon-content a[data-social="tiktok"] .filled,
          .social-wrapper-nav .icon-content a[data-social="tiktok"] ~ .tooltip,
          .social-wrapper-nav .icon-content a[data-social="tiktok"] ~ .tooltip::before {
            background-color: #000000;
          }
        `}} />

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
              Biblioteca Católica
            </div>
          </div>
        </div>

        {/* Links Direita — ml-auto garante o alinhamento fixado à direita independentemente da visibilidade do botão menu */}
        <div className="flex items-center gap-1.5 sm:gap-4 md:gap-5 ml-auto">
          {/* Redes Sociais no Cabeçalho */}
          <ul className="social-wrapper-nav mr-1 sm:mr-2 hidden md:flex">
            {/* Instagram */}
            <li className="icon-content">
              <a href="https://www.instagram.com/contosdeoracao" target="_blank" rel="noopener noreferrer" data-social="instagram" aria-label="Instagram">
                <div className="filled"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <div className="tooltip">Instagram</div>
            </li>

            {/* Facebook */}
            <li className="icon-content">
              <a href="https://www.facebook.com/share/18cmN9eVCw/" target="_blank" rel="noopener noreferrer" data-social="facebook" aria-label="Facebook">
                <div className="filled"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <div className="tooltip">Facebook</div>
            </li>

            {/* TikTok */}
            <li className="icon-content">
              <a href="https://www.tiktok.com/@contosdeoracao?_r=1&_t=ZS-96xhLBWCRVc" target="_blank" rel="noopener noreferrer" data-social="tiktok" aria-label="TikTok">
                <div className="filled"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.2 1.8 1.2 3.5 2.8 4.5 1 .7 2.1 1.1 3.3 1.2v3.4c-1.8-.1-3.5-.6-5.1-1.5v6.4c0 3.8-3.1 6.9-6.9 6.9S3.8 20.8 3.8 17s3.1-6.9 6.9-6.9c.3 0 .6 0 .9.1v3.5c-.3-.1-.6-.1-.9-.1-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4V3h2.5z"></path></svg>
              </a>
              <div className="tooltip">TikTok</div>
            </li>

            {/* YouTube */}
            <li className="icon-content">
              <a href="https://www.youtube.com/@contosdeoracao" target="_blank" rel="noopener noreferrer" data-social="youtube" aria-label="YouTube">
                <div className="filled"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <div className="tooltip">YouTube</div>
            </li>
          </ul>

          {!isAuthChecked ? (
            <div className="w-[120px] h-[36px]" />
          ) : isLoggedIn ? (
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
                    src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.nome || user?.email?.split('@')[0] || 'User')}&background=111827&color=D4AF37&bold=true&size=128`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              <button onClick={handleLogout} className="logout-btn" title="Sair">
                <div className="logout-sign">
                  <svg viewBox="0 0 512 512">
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                  </svg>
                </div>
                <div className="logout-text">Sair</div>
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
            <div className="text-[#D4AF37] text-[0.55rem] font-bold uppercase tracking-widest mt-0.5">Biblioteca Católica</div>
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

          {/* ── Vídeos Temáticos ── */}
          {pathname !== '/videos-tematicos' && (
            <Link
              href={isLoggedIn ? "/videos-tematicos" : "/?modal=login"}
              onClick={(e) => {
                setSidebarOpen(false);
                if (!isLoggedIn) {
                  e.preventDefault();
                  handleEntrar();
                }
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#E1306C]/10 hover:to-transparent group no-underline relative overflow-hidden"
            >
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-gradient-to-b from-[#833AB4] via-[#E1306C] to-[#F77737] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
              <span className="text-white/60 group-hover:text-[#E1306C] group-hover:drop-shadow-[0_0_8px_rgba(225,48,108,0.6)] transition-all duration-300">
                <IconVideos />
              </span>
              <span className="text-white/70 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#833AB4] group-hover:via-[#E1306C] group-hover:to-[#F77737] text-sm font-semibold transition-all duration-300">Vídeos Instagram</span>
            </Link>
          )}

          <Link
            href={isLoggedIn ? "/revistas" : "/planos"}
            onClick={(e) => {
              setSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out hover:scale-[1.03] hover:translate-x-1.5 hover:bg-gradient-to-r hover:from-[#D4AF37]/10 hover:to-transparent group no-underline relative overflow-hidden"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-[#D4AF37] rounded-r-md transition-all duration-300 group-hover:h-3/5" />
            <span className="text-white/60 group-hover:text-[#D4AF37] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] transition-all duration-300">
              <IconRevistas />
            </span>
            <span className="text-white/70 group-hover:text-white text-sm font-semibold transition-all duration-300">
              Revistas
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
            href="https://doceuparatela20.lovable.app/"
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

        {/* Divisor */}
        <div className="mx-5 h-px my-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Redes Sociais Mobile (Exclusivo da Sidebar no Mobile/Tablet) */}
        <div className="px-5 pb-8 md:hidden">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Siga nossas redes</p>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/contosdeoracao" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.facebook.com/share/18cmN9eVCw/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@contosdeoracao?_r=1&_t=ZS-96xhLBWCRVc" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.2 1.8 1.2 3.5 2.8 4.5 1 .7 2.1 1.1 3.3 1.2v3.4c-1.8-.1-3.5-.6-5.1-1.5v6.4c0 3.8-3.1 6.9-6.9 6.9S3.8 20.8 3.8 17s3.1-6.9 6.9-6.9c.3 0 .6 0 .9.1v3.5c-.3-.1-.6-.1-.9-.1-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4V3h2.5z"></path></svg>
            </a>
            <a href="https://www.youtube.com/@contosdeoracao" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
