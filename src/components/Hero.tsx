"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { login } from '@/app/login/actions';
import PasswordField from '@/components/PasswordField';
import SubmitButton from '@/components/SubmitButton';

export default function Hero() {
  const router = useRouter();

  return (
    <section
      id="home"
      className="relative z-10 w-full flex items-start justify-center overflow-visible px-[4%] md:px-[6%] pt-[80px] md:pt-[100px] pb-4"
    >
      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-start justify-between gap-6 md:gap-12">

        {/* Lado Esquerdo - Texto principal */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left animate-fade-in order-2 md:order-1 w-full">
          <h1
            className="text-white font-black leading-tight mb-2"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)', fontFamily: 'Outfit, sans-serif', textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
          >
            Sua fé,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">em todo lugar.</span>
          </h1>
          <p className="text-white/70 text-xs md:text-xl max-w-lg leading-relaxed font-light mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Acesso exclusivo às mais belas orações, novenas e retiros espirituais.
          </p>
          <div className="hidden md:block w-16 h-1 bg-gradient-to-r from-[#D4AF37] to-transparent rounded-full mt-4 opacity-80"></div>
        </div>

        {/* Lado Direito - Card de Login */}
        <div className="w-full md:w-[340px] flex flex-col gap-3 animate-fade-in delay-200 shrink-0 relative z-20 order-1 md:order-2">

          <div className="p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
            
            {/* Brilho interno do card */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <h2 className="text-white text-2xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Acessar</h2>
            <p className="text-white/50 text-xs mb-6 font-light">Entre para continuar assistindo.</p>

            <form className="flex flex-col gap-5">
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
                <span className="font-extrabold tracking-wide text-base">Entrar na Plataforma</span>
              </SubmitButton>

              <div className="flex flex-col gap-3 mt-2">
                <Link href="/esqueci-senha" className="text-center text-white/40 text-sm hover:text-[#D4AF37] transition-colors no-underline font-medium">
                  Esqueci minha senha
                </Link>
              </div>
            </form>

            <div className="w-full h-[1px] bg-white/10 my-4"></div>

            <Link
              href="/assinar"
              className="relative z-[100] flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] no-underline text-center cursor-pointer"
              style={{ background: 'transparent', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }}
            >
              Criar Conta e Assinar
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
