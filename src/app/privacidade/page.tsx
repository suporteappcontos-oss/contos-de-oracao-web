import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";

export const metadata = {
  title: "Política de Privacidade — Contos de Oração",
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen flex flex-col relative bg-transparent">
      <DynamicBackground />
      <Navbar />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-32 text-white">
        <h1 
          className="text-3xl md:text-5xl mb-12"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Política de Privacidade
        </h1>

        <div 
          className="prose prose-invert max-w-none text-[#94A3B8]"
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          <p className="mb-6">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <h2 className="text-2xl text-white font-bold mt-8 mb-4">1. Informações que coletamos</h2>
          <p className="mb-6">
            A sua privacidade é importante para nós. Coletamos informações pessoais que você nos fornece diretamente, como nome e e-mail, quando você se registra em nossa plataforma, realiza uma assinatura ou entra em contato conosco.
          </p>

          <h2 className="text-2xl text-white font-bold mt-8 mb-4">2. Como usamos suas informações</h2>
          <p className="mb-6">
            Utilizamos as informações coletadas para fornecer, manter e melhorar nossos serviços, processar transações, enviar avisos técnicos, atualizações e alertas de segurança, bem como para responder aos seus comentários e perguntas.
          </p>

          <h2 className="text-2xl text-white font-bold mt-8 mb-4">3. Proteção de Dados</h2>
          <p className="mb-6">
            Adotamos medidas de segurança apropriadas para proteger contra acesso não autorizado, alteração, divulgação ou destruição dos seus dados pessoais. O processamento de pagamentos é feito por provedores terceirizados seguros (Stripe), e não armazenamos detalhes completos do seu cartão de crédito em nossos servidores.
          </p>

          <h2 className="text-2xl text-white font-bold mt-8 mb-4">4. Compartilhamento de Informações</h2>
          <p className="mb-6">
            Não compartilhamos suas informações pessoais com terceiros, exceto conforme necessário para fornecer nossos serviços (por exemplo, processadores de pagamento e hospedagem de e-mail), para cumprir com a lei ou para proteger nossos direitos.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
