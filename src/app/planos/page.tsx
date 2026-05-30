import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import HeroParticles from "@/components/HeroParticles";

export const metadata = {
  title: "Planos e Preços — Contos de Oração",
  description: "Escolha o plano ideal e tenha acesso ilimitado a toda a plataforma católica do Brasil. Assine agora e comece a assistir hoje mesmo.",
};

export const dynamic = 'force-dynamic'; // Desativa o cache para mostrar os planos criados no Admin em tempo real
export const revalidate = 0;

export default function PlanosPage() {
  return (
    <main>
      <Navbar />

      {/* Seção Principal Unificada */}
      <section 
        className="w-full bg-[#050608] pt-[120px] pb-[100px] flex justify-center px-4"
      >
        {/* O Grande "Card" que contém as imagens e os planos */}
        <div 
          className="relative w-full max-w-[1300px] min-h-0 md:min-h-[850px] rounded-[1.5rem] md:rounded-[2rem] border-2 border-[#D4AF37]/50 shadow-[0_0_60px_rgba(212,175,55,0.15)] flex flex-col items-center overflow-hidden"
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

          {/* Textos (Hero) com fundo animado */}
          <div className="relative z-10 w-full max-w-2xl mx-auto px-6 text-center mt-10 mb-8">
            {/* Canvas de partículas douradas no fundo do título */}
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
              ✦ Assine e comece hoje
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
            <Pricing />
          </div>
        </div>
      </section>



      <Footer />
    </main>
  );
}
