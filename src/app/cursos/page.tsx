import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GraduationCap, Clock, Sparkles, BookOpen, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cursos e Formações — Contos de Oração",
  description: "Aprofunde a fé católica da sua família com formações exclusivas para pais, catequistas e educadores. Em breve!",
};

export default function CursosPage() {
  const FONT = "'Outfit', sans-serif";
  const PRIMARY = "#D4AF37";
  const BG_ROOT = "#090B10";

  const cursosPrevia = [
    {
      titulo: "Catequese Infantil no Lar",
      publico: "Para Pais e Responsáveis",
      desc: "Como ensinar as verdades da fé e criar uma rotina de oração e virtudes com seus filhos no dia a dia.",
      icone: BookOpen,
    },
    {
      titulo: "Formação para Catequistas",
      publico: "Para Catequistas e Educadores",
      desc: "Métodos práticos, dinâmicas e o uso de recursos visuais para engajar crianças e preparar encontros inesquecíveis.",
      icone: GraduationCap,
    },
    {
      titulo: "História dos Santos e Liturgia",
      publico: "Para toda a Família",
      desc: "Aprenda sobre a vida dos grandes santos da Igreja e como viver o ano litúrgico em família de forma lúdica.",
      icone: Sparkles,
    },
  ];

  return (
    <main style={{ backgroundColor: BG_ROOT, minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <section 
        className="w-full flex-1 pt-[120px] pb-[80px] flex justify-center px-4"
        style={{
          background: 'radial-gradient(circle at top, #111a2c 0%, #090B10 70%, #050608 100%)'
        }}
      >
        <div 
          className="relative w-full max-w-[1100px] rounded-[2rem] border border-[#D4AF37]/20 shadow-[0_0_50px_rgba(212,175,55,0.08)] flex flex-col items-center overflow-hidden px-6 py-12 md:py-20"
          style={{
            background: 'linear-gradient(180deg, rgba(17, 26, 44, 0.4) 0%, rgba(9, 11, 16, 0.9) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Efeito de brilho de fundo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37] opacity-5 blur-[120px] rounded-full pointer-events-none" />

          {/* Badge Em Breve */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border animate-pulse"
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              borderColor: 'rgba(212, 175, 55, 0.3)',
              color: PRIMARY,
              fontFamily: FONT,
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}
          >
            <Clock size={14} /> Em Breve
          </div>

          {/* Cabeçalho */}
          <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
            <h1
              className="font-black text-white leading-tight mb-4"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontFamily: FONT,
                textTransform: 'uppercase',
                textShadow: '0 4px 20px rgba(0,0,0,0.6)'
              }}
            >
              Cursos e <span style={{ color: PRIMARY }}>Formações</span>
            </h1>
            <p
              className="text-white/70 font-medium leading-relaxed"
              style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)' }}
            >
              Estamos preparando uma área de formação católica completa para ajudar pais, padrinhos e catequistas a transmitirem a beleza da fé às crianças.
            </p>
          </div>

          {/* Teasers de Cursos */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
            {cursosPrevia.map((curso, idx) => {
              const Icone = curso.icone;
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border"
                    style={{
                      background: 'rgba(212, 175, 55, 0.05)',
                      borderColor: 'rgba(212, 175, 55, 0.2)',
                      color: PRIMARY
                    }}
                  >
                    <Icone size={22} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">
                    {curso.publico}
                  </span>
                  <h3 className="text-white font-extrabold text-base mb-2 leading-snug" style={{ fontFamily: FONT }}>
                    {curso.titulo}
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed flex-1">
                    {curso.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selo de qualidade e botão de retorno */}
          <div className="flex flex-col items-center gap-6 relative z-10 text-center">
            <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={16} className="text-[#D4AF37]" />
              <span>Fidelidade doutrinária e conteúdo 100% Católico</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:bg-white/10 hover:scale-[1.02]"
              style={{
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={16} /> Voltar para o Início
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
