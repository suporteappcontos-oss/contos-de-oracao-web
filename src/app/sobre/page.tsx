import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { 
  Heart, 
  BookOpen, 
  ShieldCheck, 
  Tv, 
  Mail, 
  ExternalLink,
  CheckCircle2,
  Users,
  Compass,
  Star,
  Quote,
  Sparkles
} from "lucide-react";

export const metadata = {
  title: "Sobre o Contos de Oração — Nossa História e Fé",
  description: "Conheça a história de Alexandre Mendes Fernandes e o propósito do Contos de Oração em evangelizar famílias através da arte, animação e tecnologia.",
};

// Ícones SVG customizados e leves
const IconYoutube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function SobrePage() {
  const FONT = "'Outfit', sans-serif";
  const GOLD = "#D4AF37";

  const pilaresConteudo = [
    "A Sagrada Escritura (do Gênesis ao Apocalipse)",
    "A Vida de Nosso Senhor Jesus Cristo",
    "A Devoção a Nossa Senhora e os Santos",
    "A Doutrina, o Catecismo e os Sacramentos",
    "A Santa Missa, a Liturgia e as Orações",
    "Valores Cristãos para o Cotidiano da Família"
  ];

  const compromissos = [
    { titulo: "Fidelidade à Igreja", desc: "Conteúdos 100% alinhados com o Magistério da Igreja Católica." },
    { titulo: "Centralidade em Cristo", desc: "Jesus no centro de todas as histórias, animações e canções." },
    { titulo: "Exemplo dos Santos", desc: "A vida dos santos como modelos reais de virtude e amor a Deus." },
    { titulo: "Tecnologia com Propósito", desc: "Inteligência artificial e arte digital colocadas a serviço do Evangelho." },
    { titulo: "Segurança para Filhos", desc: "Um refúgio digital onde pais podem confiar de olhos fechados." },
    { titulo: "Qualidade Artística", desc: "Animações, revistas e sons produzidos com carinho e dedicação." }
  ];

  return (
    <main style={{ backgroundColor: "#080A0F", minHeight: "100vh", color: "#fff", fontFamily: FONT }}>

      {/* ════════ HERO EDITORIAL ════════ */}
      <section className="relative w-full pt-28 sm:pt-36 pb-12 sm:pb-20 px-4 sm:px-6 flex justify-center overflow-hidden">
        {/* Luz suave de fundo */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-[#D4AF37] opacity-10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-4xl flex flex-col items-center text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs sm:text-sm font-bold tracking-wide mb-6">
            <Sparkles size={15} />
            <span>Nossa Fé & Nossa História</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Transformando o tempo de tela em <span className="text-[#D4AF37] underline decoration-[#D4AF37]/40 underline-offset-8">tempo de fé</span>.
          </h1>

          <p className="text-white/80 text-base sm:text-xl leading-relaxed max-w-2xl font-normal">
            Acreditamos que os dispositivos que hoje ocupam o dia a dia das famílias também podem ser pontes para aproximar crianças e adultos de Jesus Cristo.
          </p>

        </div>
      </section>

      {/* ════════ BIOGRAFIA DO CRIADOR (O ALEXANDRE) ════════ */}
      <section className="w-full py-8 sm:py-16 px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-4xl bg-gradient-to-b from-[#111622] to-[#0D1018] rounded-3xl border border-white/10 p-6 sm:p-12 relative overflow-hidden shadow-2xl">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-12">
            
            {/* Foto e Mini-cartão do Alexandre */}
            <div className="flex flex-col items-center shrink-0 w-full sm:w-auto">
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_10px_30px_rgba(212,175,55,0.2)] bg-[#182030]">
                <Image 
                  src="/alexandre-mendes.png" 
                  alt="Alexandre Mendes Fernandes" 
                  fill 
                  className="object-cover object-top"
                  priority
                />
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-white font-extrabold text-lg sm:text-xl">
                  Alexandre Mendes Fernandes
                </h2>
                <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mt-1">
                  Professor & Idealizador
                </p>
              </div>

              {/* Tags de Fé */}
              <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[240px]">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/70">
                  ✝️ Católico Praticante
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/70">
                  🧬 Prof. de Biologia
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-[#D4AF37]">
                  🙏 Consagrado a Maria
                </span>
              </div>
            </div>

            {/* Texto Pessoal e Humano */}
            <div className="flex-1 text-left space-y-5">
              
              <h3 className="text-white font-bold text-xl sm:text-2xl leading-snug">
                Quem está por trás deste projeto?
              </h3>

              <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                Olá! Meu nome é <strong>Alexandre Mendes Fernandes</strong>. Tenho 45 anos, sou professor formado em Ciências Biológicas e o criador do Contos de Oração.
              </p>

              <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                Sou católico praticante, consagrado a Nossa Senhora pelo método de <em>São Luís Maria Grignion de Montfort</em> e também consagrado ao <em>Sagrado Coração de Jesus</em>.
              </p>

              <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                Desde 2022, venho me dedicando intensamente a aprender e utilizar ferramentas de inteligência artificial para produzir ilustrações, animações, roteiros, músicas e revistas digitais com um único propósito: <strong>colocar a tecnologia a serviço da evangelização</strong>.
              </p>

              {/* Citação Inspiradora */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] my-4">
                <p className="text-white/90 text-sm sm:text-base italic leading-relaxed">
                  "Deus nos dá inteligência e talentos para servirmos ao próximo. Cada desenho, áudio e livrinho que fazemos nasce do desejo sincero de levar esperança, paz e conhecimento de Deus para dentro das famílias."
                </p>
              </div>

              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Aqui no Contos de Oração, cuidamos de cada detalhe com respeito ao Magistério da Igreja Católica, trazendo um conteúdo belo, seguro e edficante para pais e filhos.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* ════════ O QUE VOCÊ ENCONTRA NO CONTOS DE ORAÇÃO ════════ */}
      <section className="w-full py-10 sm:py-16 px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-4xl">
          
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              O que transmitimos em nossos conteúdos
            </h2>
            <p className="text-white/60 text-xs sm:text-sm mt-2">
              Conhecimento e amor à fé católica em formato acessível e envolvente
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {pilaresConteudo.map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#D4AF37]/40 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-white/90 text-xs sm:text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════ NOSSOS COMPROMISSOS ════════ */}
      <section className="w-full py-10 sm:py-16 px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-4xl">
          
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Nossos Compromissos
            </h2>
            <p className="text-white/60 text-xs sm:text-sm mt-2">
              Os princípios que guiam cada animação e material publicado
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {compromissos.map((item, idx) => (
              <div 
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#0E131F] border border-white/10 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all"
              >
                <div>
                  <h3 className="text-white font-bold text-base mb-2 text-[#D4AF37]">
                    {item.titulo}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════ REDES SOCIAIS & CONTATO ════════ */}
      <section className="w-full py-12 sm:py-16 px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Siga Nossas Redes */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E131F] border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-black text-lg sm:text-xl mb-2">
                Nossos Canais Oficiais
              </h3>
              <p className="text-white/60 text-xs sm:text-sm mb-6">
                Acompanhe o Contos de Oração nas redes sociais e faça parte da nossa comunidade.
              </p>

              <div className="space-y-3">
                <a 
                  href="https://youtube.com/@contosdeoracao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30 text-white transition-all text-xs sm:text-sm font-semibold no-underline"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#FF0000]/20 flex items-center justify-center text-[#FF0000]">
                    <IconYoutube />
                  </div>
                  <span>YouTube Official</span>
                  <ExternalLink size={14} className="ml-auto text-white/40" />
                </a>

                <a 
                  href="https://instagram.com/contosdeoracao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#E1306C]/10 hover:border-[#E1306C]/30 text-white transition-all text-xs sm:text-sm font-semibold no-underline"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#E1306C]/20 flex items-center justify-center text-[#E1306C]">
                    <IconInstagram />
                  </div>
                  <span>Instagram</span>
                  <ExternalLink size={14} className="ml-auto text-white/40" />
                </a>

                <a 
                  href="https://facebook.com/contosdeoracao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30 text-white transition-all text-xs sm:text-sm font-semibold no-underline"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2]">
                    <IconFacebook />
                  </div>
                  <span>Facebook</span>
                  <ExternalLink size={14} className="ml-auto text-white/40" />
                </a>
              </div>
            </div>
          </div>

          {/* Fale Conosco Direct */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#161D2B] to-[#0E131F] border border-[#D4AF37]/30 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] mb-4">
                <Mail size={18} />
              </div>

              <h3 className="text-white font-black text-lg sm:text-xl mb-2">
                Fale Diretamente Conosco
              </h3>
              
              <p className="text-white/70 text-xs sm:text-sm mb-6">
                Tem dúvidas, testemunhos ou sugestões? Envie uma mensagem para a nossa equipe!
              </p>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
                <Mail size={18} className="text-[#D4AF37] shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">E-mail de Contato</div>
                  <a href="mailto:contato@contosdeoracao.com.br" className="text-white font-bold text-xs sm:text-sm hover:text-[#D4AF37] transition-colors truncate block no-underline">
                    contato@contosdeoracao.com.br
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 text-center">
              <Link 
                href="/planos"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c4a02f] text-black font-black text-xs uppercase tracking-wider transition-all no-underline shadow-lg"
              >
                Conhecer Nossos Planos
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Rodapé */}
      <Footer />

    </main>
  );
}
