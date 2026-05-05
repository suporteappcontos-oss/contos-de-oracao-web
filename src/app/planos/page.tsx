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

      {/* Hero da página de planos */}
      <section
        style={{
          paddingTop: '120px',
          paddingBottom: '40px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #0d1117 0%, #090B10 100%)',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(212,175,55,0.12)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: '#D4AF37',
              borderRadius: '20px',
              padding: '6px 18px',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '1px',
              marginBottom: '20px',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            ✝ PLANOS E ASSINATURA
          </span>

          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(32px, 5vw, 52px)',
              color: '#FFFFFF',
              lineHeight: '1.2',
              marginBottom: '16px',
            }}
          >
            Acesso Completo à{' '}
            <span style={{ color: '#D4AF37' }}>Maior Plataforma</span>{' '}
            Católica do Brasil
          </h1>

          <p
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: '1.7',
              marginBottom: '0',
            }}
          >
            Escolha o plano ideal para você e comece a assistir agora mesmo.
            Sem compromisso — cancele quando quiser.
          </p>
        </div>
      </section>

      {/* Componente de preços com as imagens nas laterais */}
      <div className="relative w-full overflow-hidden bg-[#090B10] py-8 flex justify-center items-center min-h-[700px]">
        {/* Imagem Esquerda (Jesus com crianças) - Oculta no celular */}
        <div 
          className="hidden xl:block absolute left-0 bottom-0 w-[420px] h-[600px] bg-contain bg-bottom bg-no-repeat opacity-90"
          style={{ 
            backgroundImage: "url('/jesus-criancas.png')",
          }}
        />

        {/* Central: Planos da Stripe */}
        <div className="relative z-10 w-full max-w-5xl mx-auto">
          <Pricing />
        </div>

        {/* Imagem Direita (Mulher orando) - Oculta no celular */}
        <div 
          className="hidden xl:block absolute right-0 bottom-0 w-[420px] h-[600px] bg-contain bg-bottom bg-no-repeat opacity-90"
          style={{ 
            backgroundImage: "url('/mulher-orando.png')", 
          }}
        />
      </div>

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
