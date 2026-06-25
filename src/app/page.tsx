import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import LandingPage from "@/components/LandingPage";
import ExpiredAccessBanner from "@/components/ExpiredAccessBanner";
import { Suspense } from "react";

export const metadata = {
  title: 'Contos de Oração — Biblioteca Católica para Crianças',
  description: 'Universo católico infantil de forma divertida. Vídeos, jogos, HQs, atividades e conteúdos exclusivos para ensinar a fé católica às crianças.',
};

export default function Home() {
  return (
    <main>
      <DynamicBackground />

      {/* Banner de acesso expirado (Client component) */}
      <Suspense fallback={null}>
        <ExpiredAccessBanner />
      </Suspense>


      {/* Nova landing page inspirada na imagem de referência */}
      <LandingPage />
      <Footer />
    </main>
  );
}
