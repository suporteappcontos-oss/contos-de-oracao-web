import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";

export const metadata = {
  title: "Termos de Uso — Contos de Oração",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen flex flex-col relative bg-transparent">
      <DynamicBackground />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-32 text-white relative z-10">
        <div className="bg-[#090B10]/95 backdrop-blur-xl p-8 md:p-14 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <h1 
            className="text-3xl md:text-5xl mb-12 text-center font-bold text-white"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Termos de Uso
          </h1>

          <div 
            className="prose prose-invert max-w-none prose-p:text-slate-200 prose-headings:text-white prose-strong:text-white prose-a:text-[#D4AF37] text-slate-200"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            <p className="mb-6 text-sm text-[#D4AF37] font-bold tracking-wide uppercase">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            
            <h2 className="text-2xl text-white font-bold mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p className="mb-6 leading-relaxed">
              Ao acessar e usar a plataforma Contos de Oração, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.
            </p>

            <h2 className="text-2xl text-white font-bold mt-8 mb-4">2. Uso de Licença</h2>
            <p className="mb-6 leading-relaxed">
              É concedida permissão para o acesso temporário aos materiais (vídeos e textos) na plataforma Contos de Oração, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título.
            </p>

            <h2 className="text-2xl text-white font-bold mt-8 mb-4">3. Assinaturas e Pagamentos</h2>
            <p className="mb-6 leading-relaxed">
              O acesso completo aos conteúdos exige uma assinatura ativa. O faturamento é realizado de forma recorrente (mensal ou anual) de acordo com o plano escolhido no momento da compra. O cancelamento pode ser feito a qualquer momento pelo painel do usuário, evitando futuras cobranças.
            </p>

            <h2 className="text-2xl text-white font-bold mt-8 mb-4">4. Limitações</h2>
            <p className="mb-6 leading-relaxed">
              Em nenhum caso o Contos de Oração ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro, ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais da plataforma.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
