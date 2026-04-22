import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex items-center justify-center text-center overflow-hidden"
      style={{ minHeight: '100vh', background: '#090B10' }}
    >
      {/* Imagem de fundo espiritual */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat ken-burns"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=80')" }}
      />

      {/* Gradientes em camadas (igual ao app) */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(9,11,16,0.65) 0%, rgba(9,11,16,0.6) 50%, #090B10 100%)' }} />

      {/* Conteúdo centralizado */}
      <div className="relative z-10 max-w-3xl px-5 flex flex-col items-center">
        
        {/* Logo Grande */}
        <div className="animate-fade-in mb-6">
          <Image
            src="/logo.png"
            alt="Contos de Oração"
            width={120}
            height={120}
            className="object-contain drop-shadow-2xl mx-auto"
          />
        </div>

        {/* Nome */}
        <div className="animate-fade-in delay-100 mb-2">
          <h1
            className="text-white font-black leading-tight"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontFamily: 'Outfit, sans-serif', textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
          >
            Contos de Oração
          </h1>
          <div className="text-[#D4AF37] text-xs font-extrabold uppercase tracking-[0.3em] mt-1">
            ✦ Premium ✦
          </div>
        </div>

        {/* Subtítulo */}
        <p className="animate-fade-in delay-200 text-white/70 text-base md:text-xl mt-6 mb-10 max-w-xl leading-relaxed"
          style={{ fontFamily: 'Outfit, sans-serif' }}>
          Orações, novenas, terços e retiros espirituais.<br className="hidden md:block" />
          Assista onde quiser, a qualquer hora.
        </p>

        {/* CTA */}
        <div className="animate-fade-in delay-350 flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <input
            type="email"
            placeholder="Seu melhor e-mail"
            className="flex-1 rounded-xl px-5 py-4 text-white text-sm outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontFamily: 'Outfit, sans-serif',
            }}
          />
          <Link
            href="/login"
            className="px-6 py-4 rounded-xl font-extrabold text-sm text-center transition-all hover:brightness-110 hover:scale-105 whitespace-nowrap"
            style={{ background: '#D4AF37', color: '#090B10', fontFamily: 'Outfit, sans-serif' }}
          >
            Começar Agora →
          </Link>
        </div>

        <p className="animate-fade-in delay-500 text-white/30 text-xs mt-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Já tem uma conta?{' '}
          <Link href="/login" className="text-[#D4AF37] hover:underline font-semibold">
            Entrar aqui
          </Link>
        </p>
      </div>
    </section>
  );
}
