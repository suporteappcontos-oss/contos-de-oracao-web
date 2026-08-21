import React from "react";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import HeroParticles from "@/components/HeroParticles";

export const metadata = {
  title: "Planos e Preços — Contos de Oração",
  description: "Escolha o plano ideal e tenha acesso ilimitado a toda a plataforma católica do Brasil. Assine agora e comece a assistir hoje mesmo.",
};

export const revalidate = 60; // ISR: Atualiza os planos a cada 60 segundos

export default function PlanosPage() {
  const isPausado = process.env.NEXT_PUBLIC_PAUSAR_ASSINATURAS !== 'false';

  return (
    <main>
      {/* Seção Principal Unificada */}
      <section 
        className="w-full bg-[#050608] pt-[120px] pb-[100px] flex justify-center px-4"
      >
        {/* O Grande "Card" que contém as imagens e os planos */}
        <div 
          className="relative w-full max-w-[1300px] min-h-0 md:min-h-[700px] rounded-[1.5rem] md:rounded-[2rem] border-2 border-[#D4AF37]/50 shadow-[0_0_60px_rgba(212,175,55,0.15)] flex flex-col items-center justify-center overflow-hidden py-12"
          style={{
            background: 'radial-gradient(circle at center, #111a2c 0%, #090B10 60%, #050608 100%)'
          }}
        >
          {/* Glow Dourado sutil atrás de tudo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37] opacity-5 blur-[150px] rounded-full z-0 pointer-events-none" />

          {/* Imagem Esquerda (Jesus com crianças) */}
          <div 
            className="hidden md:block absolute left-0 top-[5%] xl:top-auto xl:bottom-0 w-[200px] xl:w-[420px] h-[350px] xl:h-[650px] bg-contain xl:bg-bottom bg-center bg-no-repeat opacity-20 xl:opacity-30 z-0 pointer-events-none"
            style={{ backgroundImage: "url('/jesus-criancas.png')" }}
          />

          {/* Imagem Direita (Mulher orando) */}
          <div 
            className="hidden md:block absolute right-0 top-[5%] xl:top-auto xl:bottom-0 w-[200px] xl:w-[420px] h-[350px] xl:h-[650px] bg-contain xl:bg-bottom bg-center bg-no-repeat opacity-20 xl:opacity-30 z-0 pointer-events-none"
            style={{ backgroundImage: "url('/mulher-orando.png')" }}
          />

          {isPausado ? (
            <div className="relative z-10 w-full max-w-xl mx-auto px-6 text-center my-auto">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-5 text-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                <span className="text-2xl">✨</span>
              </div>
              <p
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#D4AF37',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                ✦ Contos de Oração Club
              </p>
              <h1
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 'clamp(24px, 3.5vw, 36px)',
                  fontWeight: '800',
                  color: '#FFFFFF',
                  lineHeight: '1.2',
                  textTransform: 'uppercase',
                  textShadow: '0px 4px 20px rgba(0,0,0,0.8)',
                  marginBottom: '16px'
                }}
              >
                Novidades <span style={{ color: '#D4AF37' }}>em Breve</span>
              </h1>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                Estamos preparando uma nova fase com grandes melhorias no catálogo e na plataforma.
                As novas adesões públicas estão temporariamente pausadas.
              </p>
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 mb-8 text-center backdrop-blur-md">
                <p className="text-[#D4AF37] text-xs font-black uppercase tracking-wider mb-1.5">✦ Membros, Equipe e Testadores VIP</p>
                <p className="text-white/70 text-xs leading-relaxed">Seu acesso continua 100% liberado! Faça login para assistir aos filmes, séries e orações normalmente.</p>
              </div>
              <a
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-[#090B10] shadow-[0_8px_25px_rgba(212,175,55,0.35)] hover:brightness-110 active:scale-95 transition-all no-underline"
              >
                Acessar Minha Conta →
              </a>
            </div>
          ) : (
            <>
              {/* Textos (Hero) com fundo animado */}
              <div className="relative z-10 w-full max-w-2xl mx-auto px-6 text-center mt-10 mb-8">
                <div className="absolute inset-0 -mx-20 -my-6 rounded-2xl overflow-hidden pointer-events-none">
                  <HeroParticles />
                </div>

                <p
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#D4AF37',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    position: 'relative'
                  }}
                >
                  ✦ 7 Dias de Teste Grátis • Cancele quando quiser
                </p>
                <h1
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 'clamp(22px, 3.5vw, 38px)',
                    fontWeight: '800',
                    color: '#FFFFFF',
                    lineHeight: '1.2',
                    textTransform: 'uppercase',
                    textShadow: '0px 4px 20px rgba(0,0,0,0.8)',
                    position: 'relative'
                  }}
                >
                  Escolha o <span style={{ color: '#D4AF37' }}>plano ideal</span> para sua família e ministério
                </h1>
                
                <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-5 mt-5" style={{ position: 'relative' }}>
                   <div className="flex items-center gap-1.5">
                      <span className="text-[#D4AF37] text-base">▶</span>
                      <span className="text-white/60 text-xs">Filmes que educam na fé</span>
                   </div>
                   <div className="hidden md:block w-[1px] h-5 bg-white/15"></div>
                   <div className="flex items-center gap-1.5">
                      <span className="text-[#D4AF37] text-base">📖</span>
                      <span className="text-white/60 text-xs">Materiais formativos</span>
                   </div>
                   <div className="hidden md:block w-[1px] h-5 bg-white/15"></div>
                   <div className="flex items-center gap-1.5">
                      <span className="text-[#D4AF37] text-base">❤️</span>
                      <span className="text-white/60 text-xs">Cancele quando quiser</span>
                   </div>
                </div>
              </div>

              {/* Central: Planos da Stripe */}
              <div className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-4 pb-12">
                <React.Suspense fallback={
                  <div className="flex flex-col justify-center items-center h-64 text-[#D4AF37]">
                    <div className="animate-spin mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/></svg>
                    </div>
                    <p className="font-outfit tracking-wider">Carregando planos...</p>
                  </div>
                }>
                  <Pricing />
                </React.Suspense>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
