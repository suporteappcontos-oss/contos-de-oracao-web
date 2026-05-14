"use client";
import Link from 'next/link';
import { useState } from 'react';
import { login } from '@/app/login/actions';
import PasswordField from '@/components/PasswordField';
import SubmitButton from '@/components/SubmitButton';
import dynamic from 'next/dynamic';

const QRLogin = dynamic(() => import('@/components/QRLogin'), { ssr: false });

export default function Hero() {
  const [tab, setTab] = useState<'login' | 'qr'>('login');

  return (
    <section
      id="home"
      className="relative z-20 w-full flex items-start justify-between overflow-visible px-[5%] md:px-[6%] pt-[65px] md:pt-[85px]"
    >
      <div className="relative z-10 w-full flex flex-col md:flex-row items-start justify-between gap-6 xl:gap-16">

        {/* Lado Esquerdo */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left animate-fade-in mt-1 md:mt-10">
          <h1
            className="text-white font-black leading-tight mb-2 md:mb-4"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4.5rem)', fontFamily: 'Outfit, sans-serif', textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
          >
            Catequese Digital:
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[clamp(1.5rem,3vw,2.5rem)] mt-2 block leading-snug">
              Universo católico em um só lugar, de forma divertida e criativa.
            </span>
          </h1>
          <p className="text-white/70 text-sm md:text-lg xl:text-xl max-w-lg xl:max-w-2xl leading-relaxed font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Vídeos, jogos, HQs, livros, atividades, apostilas e conteúdos exclusivos para ensinar a fé católica às crianças de maneira moderna, segura e encantadora.
          </p>
          <div className="hidden md:block w-16 h-1 bg-gradient-to-r from-[#D4AF37] to-transparent rounded-full mt-6 opacity-80" />

          {/* Dica para usuários de TV */}
          <p className="hidden xl:flex items-center gap-2 mt-6 text-white/80 text-sm bg-black/40 px-4 py-2.5 rounded-xl backdrop-blur-md w-fit border border-white/10 shadow-lg">
            <span className="text-xl">📺</span>
            <span>Na TV? Use a aba <strong className="text-[#D4AF37]">Celular / TV</strong> para escanear o QR Code de login.</span>
          </p>
        </div>

        {/* Lado Direito - Card */}
        <div className="w-full md:w-[360px] xl:w-[420px] flex flex-col gap-5 animate-fade-in delay-200 mt-2 shrink-0 relative z-50">

          <div
            className="rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
            style={{
              background: 'rgba(21,36,62,0.7)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {/* Brilho interno */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Tab Switcher */}
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
              <div className="p-5 md:p-8">
                <h2 className="text-white text-2xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Acessar</h2>
                <p className="text-white/70 text-xs mb-4 font-bold">Entre para continuar assistindo.</p>

                <form className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <input
                      type="email" name="email" placeholder="E-mail de acesso" required
                      className="w-full px-5 py-4 rounded-xl text-white outline-none transition-all text-sm focus:bg-white/10"
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontFamily: 'Outfit, sans-serif',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  </div>

                  <PasswordField name="password" label="" placeholder="Sua Senha" />

                  <SubmitButton formAction={login}>
                    <span className="font-extrabold tracking-wide text-sm md:text-base">Entrar na Plataforma</span>
                  </SubmitButton>

                  <Link href="/esqueci-senha" className="text-center text-white/50 text-sm hover:text-[#D4AF37] transition-colors no-underline font-bold mt-1">
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
                className="relative z-[100] flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] no-underline text-center cursor-pointer"
                style={{ background: 'transparent', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }}
              >
                Criar Conta e Assinar
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
