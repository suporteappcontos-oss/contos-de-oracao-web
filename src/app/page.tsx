import Navbar from "@/components/Navbar";
import HeroBento from "@/components/HeroBento";
import Carousel from "@/components/Carousel";
import AppBanner from "@/components/AppBanner";
import Footer from "@/components/Footer";
import { stripe } from '@/lib/stripe';

type Props = {
  searchParams: Promise<{ acesso?: string }>
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({ searchParams }: Props) {
  const { acesso } = await searchParams

  // Busca dos Planos do Stripe
  const prices = await stripe.prices.list({ active: true, limit: 10, expand: ['data.product'] })
  const groupedProducts = new Map<string, any>()

  if (prices.data.length > 0) {
    prices.data
      .filter((price) => (price.product as any).active === true)
      .forEach((price) => {
        const prod = price.product as any
        const isAnual = price.recurring?.interval === 'year'
        
        if (!groupedProducts.has(prod.id)) {
          groupedProducts.set(prod.id, {
            id: prod.id,
            nome: prod.name,
            descricao: prod.description || 'Acesso completo à plataforma',
            badge: prod.metadata?.etiqueta || null,
            cor: prod.metadata?.cor || (isAnual ? 'text-[#D4AF37]' : 'text-[#8197a4]'),
            destaque: isAnual || false,
            maxTelas: Number(prod.metadata?.max_telas || 1),
            beneficios: prod.metadata?.beneficios
              ? prod.metadata.beneficios.split(/\|/).map((b: string) => b.trim()).filter(Boolean)
              : [
                  '⭐ Acesso ilimitado ao catálogo',
                  '⭐ Assista em qualquer dispositivo',
                  'Vídeos em Full HD (1080p)',
                  'Suporte prioritário'
                ],
            priceMensal: null,
            priceAnual: null,
          })
        }
        
        const g = groupedProducts.get(prod.id)
        const valor = price.unit_amount! / 100
        
        if (isAnual) {
           g.priceAnual = { id: price.id, valor }
           g.destaque = true 
           g.cor = 'text-[#D4AF37]'
           if (!g.badge) g.badge = 'Mais Popular'
        } else {
           g.priceMensal = { id: price.id, valor }
        }
      })
  }

  let produtosArray = Array.from(groupedProducts.values())
  produtosArray.sort((a, b) => (a.destaque === b.destaque ? 0 : a.destaque ? 1 : -1))

  const movieImages = [
    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&h=280&fit=crop'
  ];
  
  const trendingImages = [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1572177259160-0a37ff1e9bb1?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1627873649417-c67f701f1949?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=280&fit=crop'
  ];

  return (
    <main>
      <Navbar />

      {/* Banner de acesso expirado */}
      {acesso === 'expirado' && (
        <div
          className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-between gap-4 px-5 py-3.5 text-sm font-semibold"
          style={{
            background: 'linear-gradient(90deg, #7c1d1d, #991b1b)',
            borderBottom: '1px solid rgba(239,68,68,0.4)',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <span>🔒</span>
            <span>Seu acesso expirou ou foi cancelado. Para continuar assistindo, renove sua assinatura.</span>
          </div>
          <a
            href="/planos"
            className="shrink-0 px-4 py-1.5 rounded-lg font-bold text-xs transition-all hover:brightness-110"
            style={{ background: '#D4AF37', color: '#090B10' }}
          >
            Renovar agora →
          </a>
        </div>
      )}

      <HeroBento produtos={produtosArray} />

      <div className={`relative z-10 mt-[-80px] ${acesso === 'expirado' ? 'pt-12' : ''}`}>
        <Carousel title="Lançamentos" images={movieImages} />
        <Carousel title="Em Alta" images={trendingImages} />
      </div>
      <AppBanner />


      <Footer />
    </main>
  );
}
