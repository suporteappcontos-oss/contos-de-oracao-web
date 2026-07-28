import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { createClient } from "@/utils/supabase/server";
import LojaProductCard from "@/components/LojaProductCard";
import { ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Loja Oficial — Contos de Oração",
  description: "Nossa loja oficial com produtos, livros e materiais educativos selecionados para catequese e evangelização infantil. Compre pelo link de afiliado oficial.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProdutoType = {
  id: string
  titulo: string
  descricao: string
  link_afiliado: string
  imagem_url_1: string | null
  imagem_url_2: string | null
  imagem_url_3: string | null
  imagens_urls?: string[] | null
  proporcao_imagem?: string
  ativo: boolean
  criado_em: string
}

export default async function LojaPage() {
  const supabase = await createClient();
  
  // Busca todos os produtos ativos do banco de dados em tempo real
  const { data: produtos } = await supabase
    .from("produtos_loja")
    .select("*")
    .eq("ativo", true)
    .order("criado_em", { ascending: false });

  const listaProdutos = (produtos || []) as ProdutoType[];

  return (
    <main className="min-h-screen flex flex-col justify-between relative overflow-hidden" style={{ background: '#090B10' }}>
      <DynamicBackground />

      {/* Conteúdo Principal */}
      <section className="pt-[110px] md:pt-[130px] pb-24 px-[4%] max-w-7xl mx-auto w-full flex-1 z-10">
        
        {/* Cabeçalho da Loja */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4" style={{ fontFamily: "Outfit, sans-serif" }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-black uppercase tracking-wider">
            <ShoppingBag size={13} /> Loja Oficial
          </div>
          <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Nossos Produtos Recomendados
          </h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed">
            Livros, Bíblias ilustradas, brinquedos pedagógicos e materiais selecionados com carinho para auxiliar na catequese e evangelização das crianças.
          </p>
        </div>

        {/* Grid de Produtos */}
        {listaProdutos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {listaProdutos.map((produto) => (
              <LojaProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01] max-w-lg mx-auto space-y-4"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            <span className="text-4xl">🛍️</span>
            <h3 className="text-white font-extrabold text-lg">Novidades Em Breve!</h3>
            <p className="text-white/50 text-xs md:text-sm leading-relaxed">
              Estamos preparando e selecionando os melhores livros e materiais católicos para você. Fique de olho, nossa loja estará cheia de novidades logo logo!
            </p>
          </div>
        )}

      </section>

      <Footer />
    </main>
  );
}
