import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Quaresma de São Miguel | Contos de Oração",
  description: "40 dias de oração, jejum e consagração ao Príncipe da Milícia Celestial. Acompanhe sua jornada espiritual diária.",
  openGraph: {
    title: "Quaresma de São Miguel | Contos de Oração",
    description: "40 dias de oração diária rumo à Festa de São Miguel Arcanjo.",
    images: [{ url: "/sao-miguel-hero.jpg" }],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
