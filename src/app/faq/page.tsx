import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";

export const metadata = {
  title: "Perguntas Frequentes — Contos de Oração Club",
  description: "Tire suas dúvidas sobre a plataforma Contos de Oração Club.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'Posso cancelar quando quiser?',
      a: 'Sim! Não há multa ou fidelidade. Você pode cancelar a sua assinatura a qualquer momento diretamente pelo painel do usuário no site.',
    },
    {
      q: 'Funciona no celular e na TV?',
      a: 'Sim! Nossos aplicativos dedicados para celulares e Smart TVs serão lançados em breve! Enquanto isso, você pode acessar 100% dos conteúdos em qualquer celular, computador, tablet ou Smart TV acessando o site oficial contosdeoracao.com.br diretamente pelo navegador de internet com total qualidade e compatibilidade.',
    },
    {
      q: 'O conteúdo é atualizado com frequência?',
      a: 'Sim! Nossa equipe adiciona novos vídeos, materiais formativos e recursos regularmente para manter o catálogo sempre fresco e relevante para a educação cristã.',
    },
    {
      q: 'Quantas telas posso usar ao mesmo tempo?',
      a: 'Tanto o plano Mensal quanto o Anual dão direito a até 5 telas simultâneas por padrão para que toda a sua família possa assistir junta.',
    },
    {
      q: 'Como baixo os materiais em PDF?',
      a: 'Ao acessar um vídeo que possui material complementar, haverá um botão de download disponível logo abaixo do reprodutor. Basta clicar para baixar o arquivo no seu dispositivo.',
    }
  ];

  return (
    <main className="min-h-screen flex flex-col relative bg-transparent">
      <DynamicBackground />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-32">
        <h1 
          className="text-center text-4xl md:text-5xl mb-12 text-white"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Perguntas Frequentes
        </h1>

        <div className="flex flex-col gap-6">
          {faqs.map((item, i) => (
            <div 
              key={i} 
              className="bg-[#0d1117] p-8 rounded-2xl border border-white/5"
            >
              <h3 
                className="text-xl font-bold text-white mb-4"
                style={{ fontFamily: '"Outfit", sans-serif' }}
              >
                {item.q}
              </h3>
              <p 
                className="text-slate-300 leading-relaxed"
                style={{ fontFamily: '"Outfit", sans-serif' }}
              >
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
