import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
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
      <Hero />
      <div className="relative z-10 mt-[-80px]">
        <Carousel title="Lançamentos" images={movieImages} />
        <Carousel title="Em Alta" images={trendingImages} />
      </div>
      <Pricing />
      <Footer />
    </main>
  );
}
