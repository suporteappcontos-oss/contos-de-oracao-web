"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { login } from '@/app/login/actions';
import PasswordField from '@/components/PasswordField';
import SubmitButton from '@/components/SubmitButton';

export default function Hero() {
  const router = useRouter();

  return (
    <section
      id="home"
      className="relative flex items-center justify-end overflow-hidden px-[5%] md:px-[10%]"
      style={{ minHeight: '100vh', background: 'transparent' }}
    >


      {/* Removido o gradiente em camadas que escurecia demais o Hero */}

      {/* Conteúdo alinhado à direita: Card de Login */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col gap-4 mt-20 md:mt-0 animate-fade-in">
        
        {/* Card Principal */}
        <div className="p-8 md:p-10 rounded-2xl shadow-2xl backdrop-blur-md"
          style={{ background: 'rgba(21,36,62,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
          
          <h2 className="text-white text-2xl md:text-3xl font-black mb-1">Entrar</h2>
          <p className="text-white/40 text-sm mb-7">Acesse sua conta para assistir ao conteúdo.</p>

          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-[0.7rem] uppercase tracking-widest font-semibold">E-mail</label>
              <input
                type="email" name="email" placeholder="seu@email.com" required
                className="w-full px-4 py-3.5 rounded-xl text-white outline-none transition-all text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Outfit, sans-serif' }}
              />
            </div>

            <PasswordField name="password" label="Senha" placeholder="••••••••" />

            {/* Removemos o tratamento de erro aqui porque isso agora tá na index e a URL não tem o search params error facilmente, mas se falhar ele vai pra /login?error... ou podemos deixar assim */}

            <SubmitButton formAction={login}>
              Acessar Plataforma →
            </SubmitButton>

            <div className="text-center">
              <Link href="/esqueci-senha" className="text-white/35 text-sm hover:text-[#D4AF37] transition-colors no-underline">
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </div>

        {/* Guia Novos Assinantes */}
        <div className="p-6 rounded-2xl backdrop-blur-md"
          style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
          
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#D4AF37' }}>
            Ainda não tem acesso?
          </p>

          <Link
            href="/assinar"
            className="block w-full text-center py-3.5 rounded-xl font-extrabold text-sm transition-all hover:brightness-110 hover:scale-[1.02] no-underline"
            style={{ background: '#D4AF37', color: '#090B10' }}
          >
            Assinar Agora →
          </Link>
        </div>
      </div>
    </section>
  );
}
