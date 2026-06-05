"use client";
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { login } from '@/app/login/actions';
import PasswordField from '@/components/PasswordField';
import SubmitButton from '@/components/SubmitButton';
import dynamic from 'next/dynamic';

const QRLogin = dynamic(() => import('@/components/QRLogin'), { ssr: false });

function HeroContent() {
  const searchParams                  = useSearchParams();
  const [showCard, setShowCard] = useState(false);
  const [tab, setTab]           = useState<'login' | 'qr'>('login');

  // Abre modal via CustomEvent (sidebar na home)
  useEffect(() => {
    const handler = () => setShowCard(true);
    window.addEventListener('open-login', handler);
    return () => window.removeEventListener('open-login', handler);
  }, []);

  // Abre modal via ?modal=login na URL (vindo de outras páginas)
  useEffect(() => {
    if (searchParams.get('modal') === 'login') {
      setShowCard(true);
    }
  }, [searchParams]);

  // Fechar com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowCard(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* ════════════════════════════════════
          HERO — Full Width
      ════════════════════════════════════ */}
      <section
        id="home"
        className="relative z-20 w-full min-h-screen flex flex-col items-center justify-center px-[6%] text-center"
        style={{ paddingTop: '60px', paddingBottom: '60px' }}
      >
        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-8 animate-fade-in">

          {/* Título */}
          <h1
            className="text-white font-black leading-tight"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 5rem)',
              fontFamily: 'Outfit, sans-serif',
              textShadow: '0 4px 40px rgba(0,0,0,0.9)',
            }}
          >
            Biblioteca Católica:
            <br />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] block leading-snug mt-2"
              style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.6rem)' }}
            >
              Universo católico em um só lugar, de forma divertida e criativa.
            </span>
          </h1>

          {/* Descrição */}
          <p
            className="text-white/70 text-base md:text-xl max-w-2xl leading-relaxed font-light"
            style={{ fontFamily: 'Outfit, sans-serif', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            Vídeos, jogos, HQs, livros, atividades, apostilas e conteúdos exclusivos para ensinar
            a fé católica às crianças de maneira moderna, segura e encantadora.
          </p>

          {/* Divisor dourado */}
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-transparent opacity-80" />

        </div>
      </section>

      {/* ════════════════════════════════════
          MODAL DE LOGIN — animação premium
      ════════════════════════════════════ */}
      {showCard && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowCard(false)}
        >
          <div
            className="w-full max-w-[430px] login-modal-in"
            onClick={e => e.stopPropagation()}
          >
            <div
              className="rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
              style={{
                background: 'rgba(15,22,42,0.92)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {/* Brilho topo */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Botão fechar */}
              <button
                onClick={() => setShowCard(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>

              {/* Tabs */}
              <div className="flex border-b mx-6 mt-6 mb-0" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setTab('login')}
                  className="flex-1 pb-3 text-sm font-bold transition-all"
                  style={{
                    color: tab === 'login' ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    borderBottom: tab === 'login' ? '2px solid #D4AF37' : '2px solid transparent',
                  }}
                >
                  🔑 Senha
                </button>
                <button
                  onClick={() => setTab('qr')}
                  className="flex-1 pb-3 text-sm font-bold transition-all"
                  style={{
                    color: tab === 'qr' ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    borderBottom: tab === 'qr' ? '2px solid #D4AF37' : '2px solid transparent',
                  }}
                >
                  📱 Celular / TV
                </button>
              </div>

              {/* Tab: Login com senha */}
              {tab === 'login' && (
                <div className="p-6 md:p-8">
                  <h2 className="text-white text-2xl font-black mb-1">Acessar</h2>
                  <p className="text-white/70 text-xs mb-5 font-bold">Entre para continuar assistindo.</p>
                  <form className="flex flex-col gap-4">
                    <input
                      type="email"
                      name="email"
                      placeholder="E-mail de acesso"
                      required
                      className="w-full px-5 py-4 rounded-xl text-white outline-none transition-all text-sm focus:bg-white/10"
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <PasswordField name="password" label="" placeholder="Sua Senha" />
                    <SubmitButton formAction={login}>
                      <span className="font-extrabold tracking-wide text-sm md:text-base">Entrar na Plataforma</span>
                    </SubmitButton>
                    <Link
                      href="/esqueci-senha"
                      className="text-center text-white/50 text-sm hover:text-[#D4AF37] transition-colors no-underline font-bold mt-1"
                    >
                      Esqueci minha senha
                    </Link>
                  </form>
                </div>
              )}

              {/* Tab: QR Code */}
              {tab === 'qr' && (
                <div className="p-2 md:p-4">
                  <QRLogin />
                </div>
              )}

              <div className="w-full h-[1px] bg-white/10" />

              <div className="p-4 md:p-5">
                <Link
                  href="/planos"
                  className="flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] no-underline text-center"
                  style={{
                    background: 'transparent',
                    color: '#D4AF37',
                    border: '1px solid rgba(212,175,55,0.4)',
                  }}
                >
                  Criar Conta e Assinar
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Hero() {
  return (
    <Suspense fallback={null}>
      <HeroContent />
    </Suspense>
  );
}
