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

      {/* Seção Principal Unificada (Texto + Preços + Imagens Laterais) */}
      <section className="relative w-full overflow-hidden bg-[#090B10] pt-[120px] pb-[80px] min-h-[800px] flex flex-col items-center">
        
        {/* Imagem Esquerda (Jesus com crianças) - Aparece no celular como fundo sutil */}
        <div 
          className="absolute left-0 bottom-0 w-[250px] xl:w-[450px] h-[450px] xl:h-[700px] bg-contain bg-bottom bg-no-repeat opacity-20 xl:opacity-100 z-0 pointer-events-none"
          style={{ 
            backgroundImage: "url('/jesus-criancas.png')",
          }}
        />

        {/* Imagem Direita (Mulher orando) - Aparece no celular como fundo sutil */}
        <div 
          className="absolute right-0 bottom-0 w-[250px] xl:w-[450px] h-[450px] xl:h-[700px] bg-contain bg-bottom bg-no-repeat opacity-20 xl:opacity-100 z-0 pointer-events-none"
          style={{ 
            backgroundImage: "url('/mulher-orando.png')", 
          }}
        />

        {/* Textos (Hero) */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center mb-12">
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
                <span className="text-white/80 font-medium text-sm md:text-base">Materiais que formam para a vida.</span>
             </div>
          </div>
        </div>

        {/* Central: Planos da Stripe */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
          <Pricing />
        </div>

      </section>

      {/* FAQ rápido */}
      <section
        style={{
          background: '#090B10',
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

      <Footer />
    </main>
  );
}
