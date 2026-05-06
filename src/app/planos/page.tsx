import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingPageLayout from "@/components/PricingPageLayout";
import { stripe } from "@/lib/stripe";

export const metadata = {
  title: "Planos e Preços — Contos de Oração",
  description: "Escolha o plano ideal e tenha acesso ilimitado a toda a plataforma católica do Brasil.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProdutos() {
  const prices = await stripe.prices.list({ active: true, limit: 10, expand: ['data.product'] });
  const groupedProducts = new Map<string, any>();

  if (prices.data.length > 0) {
    prices.data
      .filter((price) => (price.product as any).active === true)
      .forEach((price) => {
        const prod = price.product as any;
        const isAnual = price.recurring?.interval === 'year';

        if (!groupedProducts.has(prod.id)) {
          groupedProducts.set(prod.id, {
            id: prod.id,
            nome: prod.name,
            badge: prod.metadata?.etiqueta || null,
            destaque: false,
            maxTelas: Number(prod.metadata?.max_telas || 1),
            beneficios: prod.metadata?.beneficios
              ? prod.metadata.beneficios.split(/\|/).map((b: string) => b.trim()).filter(Boolean)
              : ['Acesso ilimitado ao catálogo', 'Assista em qualquer dispositivo', 'Vídeos em Full HD', 'Suporte prioritário'],
            priceMensal: null,
            priceAnual: null,
          });
        }

        const g = groupedProducts.get(prod.id);
        const valor = price.unit_amount! / 100;

        if (isAnual) {
          g.priceAnual = { id: price.id, valor };
          g.destaque = true;
          if (!g.badge) g.badge = 'ECONÔMICO';
        } else {
          g.priceMensal = { id: price.id, valor };
        }
      });
  }

  return Array.from(groupedProducts.values());
}

export default async function PlanosPage() {
  const produtos = await getProdutos();

  return (
    <main className="min-h-screen flex flex-col bg-[#0a0b0e]" style={{ fontFamily: '"Outfit", sans-serif' }}>
      <Navbar />
      <PricingPageLayout produtos={produtos} />
      <Footer />
    </main>
  );
}
