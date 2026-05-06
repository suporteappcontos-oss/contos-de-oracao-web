import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";

export const metadata = {
  title: "Termos de Uso — Contos de Oração",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen flex flex-col relative bg-transparent">
      <DynamicBackground />
      <Navbar />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-32 text-white">
        <h1 
          className="text-3xl md:text-5xl mb-12"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Termos de Uso
        </h1>

        <div 
          className="prose prose-invert max-w-none text-[#94A3B8]"
          style={{ fontFamily: '"Outfit", sans-serif' }}
        >
          <p className="mb-6">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <h2 className="text-2xl text-white font-bold mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p className="mb-6">
            Ao acessar e usar a plataforma Contos de Oração, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.
          </p>

          <h2 className="text-2xl text-white font-bold mt-8 mb-4">2. Uso de Licença</h2>
          <p className="mb-6">
            É concedida permissão para o acesso temporário aos materiais (vídeos e textos) na plataforma Contos de Oração, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título.
          </p>

          <h2 className="text-2xl text-white font-bold mt-8 mb-4">3. Assinaturas e Pagamentos</h2>
          <p className="mb-6">
            O acesso completo aos conteúdos exige uma assinatura ativa. O faturamento é realizado de forma recorrente (mensal ou anual) de acordo com o plano escolhido no momento da compra. O cancelamento pode ser feito a qualquer momento pelo painel do usuário, evitando futuras cobranças.
          </p>

          <h2 className="text-2xl text-white font-bold mt-8 mb-4">4. Limitações</h2>
          <p className="mb-6">
            Em nenhum caso o Contos de Oração ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro, ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais da plataforma.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
