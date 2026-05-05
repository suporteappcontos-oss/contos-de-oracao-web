import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Planos e Preços — Contos de Oração",
  description: "Escolha o plano ideal e tenha acesso ilimitado a toda a plataforma católica do Brasil. Assine agora e comece a assistir hoje mesmo.",
};

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
          className="relative w-full max-w-[1300px] min-h-[850px] rounded-[2rem] border-2 border-[#D4AF37]/50 shadow-[0_0_60px_rgba(212,175,55,0.15)] flex flex-col items-center overflow-hidden"
          style={{
            background: 'radial-gradient(circle at center, #111a2c 0%, #090B10 60%, #050608 100%)'
          }}
        >
          {/* Glow Dourado sutil atrás de tudo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37] opacity-5 blur-[150px] rounded-full z-0 pointer-events-none" />

          {/* Imagem Esquerda (Jesus com crianças) */}
          <div 
            className="absolute left-0 top-[5%] xl:top-auto xl:bottom-0 w-[200px] xl:w-[420px] h-[350px] xl:h-[650px] bg-contain xl:bg-bottom bg-center bg-no-repeat opacity-20 xl:opacity-30 z-0 pointer-events-none"
            style={{ backgroundImage: "url('/jesus-criancas.png')" }}
          />

          {/* Imagem Direita (Mulher orando) */}
          <div 
            className="absolute right-0 top-[5%] xl:top-auto xl:bottom-0 w-[200px] xl:w-[420px] h-[350px] xl:h-[650px] bg-contain xl:bg-bottom bg-center bg-no-repeat opacity-20 xl:opacity-30 z-0 pointer-events-none"
            style={{ backgroundImage: "url('/mulher-orando.png')" }}
          />

          {/* Textos (Hero) */}
          <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center mt-12 mb-12">
            <h1
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: 'clamp(32px, 6vw, 60px)',
                fontWeight: '900',
                color: '#FFFFFF',
                lineHeight: '1.1',
                textTransform: 'uppercase',
                textShadow: '0px 4px 20px rgba(0,0,0,0.8)'
              }}
            >
              ESCOLHA O <br/>
              <span style={{ color: '#D4AF37' }}>PLANO IDEAL</span><br/>
              PARA SUA FAMÍLIA<br/>
              E MINISTÉRIO
            </h1>
            
            <div className="flex flex-row justify-center items-center gap-6 mt-6">
               <div className="flex items-center gap-2">
                  <span className="text-[#D4AF37] text-xl">▶</span>
                  <span className="text-white/80 font-medium text-sm md:text-base">Filmes que educam na fé.</span>
               </div>
               <div className="w-[1px] h-8 bg-white/20"></div>
               <div className="flex items-center gap-2">
                  <span className="text-[#D4AF37] text-xl">📖</span>
                  <span className="text-white/80 font-medium text-sm md:text-base">Materiais formativos.</span>
               </div>
            </div>
          </div>

          {/* Central: Planos da Stripe */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 mt-4 pb-12">
            <Pricing />
          </div>
        </div>
      </section>

      {/* FAQ rápido */}
      <div className="w-full bg-[#090B10]">
        <section
          style={{
            padding: '60px 24px',
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
        <h2
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '28px',
            color: '#FFF',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          Perguntas Frequentes
        </h2>

        {[
          {
            q: 'Posso cancelar quando quiser?',
            a: 'Sim! Não há multa ou fidelidade. Cancele a qualquer momento diretamente pelo site.',
          },
          {
            q: 'Funciona no celular e TV?',
            a: 'Sim. Temos aplicativo para Android e você pode assistir pelo navegador em qualquer dispositivo.',
          },
          {
            q: 'O conteúdo é atualizado?',
            a: 'Sim! Adicionamos novos vídeos regularmente para manter o catálogo sempre fresco.',
          },
          {
            q: 'Quantas telas posso usar ao mesmo tempo?',
            a: 'Depende do plano escolhido. O plano Família permite múltiplas telas simultâneas.',
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              paddingBottom: '24px',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '700',
                fontSize: '16px',
                color: '#FFF',
                marginBottom: '8px',
              }}
            >
              {item.q}
            </p>
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: '1.6',
              }}
            >
              {item.a}
            </p>
          </div>
        ))}
        </section>
      </div>

      <Footer />
    </main>
  );
}
