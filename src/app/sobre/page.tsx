import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { 
  Heart, 
  Sparkles, 
  BookOpen, 
  Cross, 
  ShieldCheck, 
  Tv, 
  Mail, 
  ExternalLink,
  Award,
  CheckCircle2,
  Users,
  Compass,
  Star
} from "lucide-react";

// Ícones SVG para redes sociais
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

export const metadata = {
  title: "Sobre o Contos de Oração — Transforme Tempo de Tela em Tempo de Fé",
  description: "Conheça a história, a missão e quem está por trás do Contos de Oração. Conteúdos católicos infantis e familiares produzidos com excelência artística e fidelidade à Igreja.",
};

export default function SobrePage() {
  const FONT = "'Outfit', sans-serif";
  const GOLD = "#D4AF37";
  const BG_ROOT = "#090B10";

  const missoes = [
    "A Sagrada Escritura, do Gênesis ao Apocalipse",
    "A vida de Jesus Cristo",
    "A história de Nossa Senhora",
    "A vida e o testemunho dos santos",
    "A doutrina da Igreja Católica",
    "O Catecismo e os Sacramentos",
    "A Santa Missa e a Liturgia",
    "As orações e devoções da Igreja",
    "A história da Igreja",
    "Os valores cristãos para a vida em família"
  ];

  const valores = [
    { titulo: "Fidelidade ao Magistério", desc: "Conteúdos 100% alinhados com a doutrina da Igreja Católica Apostólica Romana.", icone: ShieldCheck },
    { titulo: "Centralidade em Jesus", desc: "Cristo no centro de toda a nossa produção e evangelização.", icone: Cross },
    { titulo: "Amor à Palavra de Deus", desc: "Respeito e transmissão fiel das Sagradas Escrituras.", icone: BookOpen },
    { titulo: "Devoção a Nossa Senhora", desc: "Amor e veneração à Mãe de Deus e nossa Mãe Santíssima.", icone: Heart },
    { titulo: "Testemunho dos Santos", desc: "Apresentar os grandes exemplos de santidade da História.", icone: Star },
    { titulo: "Excelência Artística", desc: "Qualidade técnica, visual e sonora em cada animação e material.", icone: Award },
    { titulo: "Uso Ético da I.A.", desc: "Inteligência artificial colocada com responsabilidade a serviço da fé.", icone: Sparkles },
    { titulo: "Respeito às Famílias", desc: "Ambiente 100% seguro e protegido para crianças de todas as idades.", icone: Users },
    { titulo: "Compromisso com a Fé", desc: "Dedicação integral a levar a esperança e o conhecimento de Deus aos lares.", icone: Compass }
  ];

  return (
    <main style={{ backgroundColor: BG_ROOT, minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* ════════ HERO SECTION ════════ */}
      <section 
        className="w-full pt-[130px] pb-[70px] flex justify-center px-4 relative overflow-hidden"
        style={{
          background: 'radial-gradient(circle at top, #131e33 0%, #090B10 70%, #050608 100%)'
        }}
      >
        {/* Glow de fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#D4AF37] opacity-10 blur-[140px] rounded-full pointer-events-none" />

        <div className="w-full max-w-[1140px] flex flex-col items-center text-center relative z-10">
          
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border"
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              borderColor: 'rgba(212, 175, 55, 0.3)',
              color: GOLD,
              fontFamily: FONT,
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}
          >
            <Sparkles size={14} /> Nossa História e Missão
          </div>

          <h1
            className="font-black text-white leading-tight mb-6"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              fontFamily: FONT,
              textTransform: 'uppercase',
              textShadow: '0 4px 25px rgba(0,0,0,0.8)'
            }}
          >
            Sobre o <span style={{ color: GOLD }}>Contos de Oração</span>
          </h1>

          <p
            className="text-white/80 font-medium max-w-3xl leading-relaxed text-base sm:text-lg md:text-xl"
            style={{ fontFamily: FONT }}
          >
            O Contos de Oração nasceu do desejo de <span style={{ color: GOLD, fontWeight: '800' }}>transformar o tempo de tela em tempo de fé</span>.
          </p>

        </div>
      </section>


      {/* ════════ VISÃO GERAL / INTRODUÇÃO ════════ */}
      <section className="w-full py-12 px-4 flex justify-center">
        <div className="w-full max-w-[1140px] grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div 
            className="rounded-3xl p-8 border border-white/10 flex flex-col justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(19, 30, 51, 0.5) 0%, rgba(9, 11, 16, 0.8) 100%)', backdropFilter: 'blur(10px)' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
              <Tv size={24} />
            </div>
            <h3 className="text-white font-extrabold text-xl md:text-2xl mb-4" style={{ fontFamily: FONT }}>
              Evangelização na Era Digital
            </h3>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              Vivemos em uma época em que crianças, jovens e adultos passam cada vez mais tempo diante das telas. Acreditamos que esse tempo também pode ser uma oportunidade para conhecer Jesus Cristo, aprofundar a fé e descobrir a riqueza da Igreja Católica.
            </p>
          </div>

          <div 
            className="rounded-3xl p-8 border border-white/10 flex flex-col justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(19, 30, 51, 0.5) 0%, rgba(9, 11, 16, 0.8) 100%)', backdropFilter: 'blur(10px)' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
              <Sparkles size={24} />
            </div>
            <h3 className="text-white font-extrabold text-xl md:text-2xl mb-4" style={{ fontFamily: FONT }}>
              Conteúdos Ricos e Envolventes
            </h3>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              Por meio de animações, filmes, séries, músicas, revistas e materiais educativos, buscamos apresentar a beleza da Palavra de Deus, a vida de Nossa Senhora, o testemunho dos santos, a doutrina da Igreja e os valores cristãos de forma acessível, envolvente e fiel ao Magistério da Igreja Católica.
            </p>
          </div>

        </div>
      </section>


      {/* ════════ QUEM ESTÁ POR TRÁS DO PROJETO ════════ */}
      <section className="w-full py-16 px-4 flex justify-center relative">
        <div 
          className="w-full max-w-[1140px] rounded-[2.5rem] border border-[#D4AF37]/30 p-8 md:p-14 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(19, 30, 51, 0.7) 0%, rgba(9, 11, 16, 0.95) 100%)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}
        >
          {/* Brilho suave */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] opacity-5 blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14 relative z-10">
            
            {/* Foto do Alexandre Mendes Fernandes */}
            <div className="flex flex-col items-center shrink-0">
              <div 
                className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 p-1 shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-transform duration-500 hover:scale-105"
                style={{ borderColor: GOLD, background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}
              >
                <Image 
                  src="/alexandre-mendes.png" 
                  alt="Alexandre Mendes Fernandes — Criador do Contos de Oração" 
                  fill 
                  className="object-cover object-top"
                  priority
                />
              </div>
              
              <div className="mt-4 text-center">
                <h4 className="text-white font-black text-lg md:text-xl" style={{ fontFamily: FONT }}>
                  Alexandre Mendes Fernandes
                </h4>
                <p className="text-[#D4AF37] text-xs font-extrabold uppercase tracking-wider mt-0.5">
                  Professor de Biologia & Produtor
                </p>
              </div>
            </div>

            {/* Texto Biográfico */}
            <div className="flex-1 text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-black uppercase tracking-widest">
                <Heart size={14} /> Quem está por trás do projeto?
              </div>

              <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl leading-tight" style={{ fontFamily: FONT }}>
                Fé, Ciência e Tecnologia a Serviço de Deus
              </h2>

              <p className="text-white/80 leading-relaxed text-sm md:text-base">
                Meu nome é <strong>Alexandre Mendes Fernandes</strong>. Sou professor de Biologia, formado em Ciências Biológicas, e produtor do Contos de Oração.
              </p>

              <p className="text-white/80 leading-relaxed text-sm md:text-base">
                Desde 2022, dedico-me ao estudo e à aplicação da inteligência artificial na produção de animações, roteiros, ilustrações, músicas, vídeos e materiais educativos, sempre buscando colocar a tecnologia a serviço da evangelização.
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/90 text-sm leading-relaxed space-y-2">
                <p>
                  ✝️ Tenho 45 anos, sou católico praticante, consagrado a Nossa Senhora pelo método de <strong>São Luís Maria Grignion de Montfort</strong> e também consagrado ao <strong>Sagrado Coração de Jesus</strong>.
                </p>
                <p className="italic text-[#D4AF37]/90 font-medium">
                  "Acredito que Deus concede talentos para serem colocados a serviço do próximo. Por isso, utilizo a arte, a tecnologia e a criatividade para anunciar o Evangelho e contribuir para que crianças, jovens e adultos conheçam mais profundamente a fé católica."
                </p>
              </div>

              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Cada roteiro, personagem, animação, música e material produzido nasce desse propósito: levar esperança, conhecimento e fortalecer a vida espiritual das famílias.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ════════ NOSSA MISSÃO ════════ */}
      <section className="w-full py-16 px-4 flex justify-center">
        <div className="w-full max-w-[1140px]">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-3">
              <Cross size={14} /> Missão Evangelizadora
            </div>
            <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: FONT }}>
              Nossa Missão
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mt-2 text-sm sm:text-base">
              Evangelizar utilizando a arte, a tecnologia e a criatividade como instrumentos a serviço de Deus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {missoes.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3.5 p-4 rounded-2xl border border-white/10 transition-all duration-300 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5"
                style={{ background: 'rgba(15, 23, 42, 0.6)' }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(212, 175, 55, 0.15)', color: GOLD }}>
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-white/90 text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-white/80 font-medium text-sm sm:text-base mt-8 max-w-3xl mx-auto">
            Nosso propósito é ajudar crianças, jovens e adultos a conhecerem melhor a fé católica, fortalecerem sua vida de oração e viverem uma relação mais profunda com Deus.
          </p>

        </div>
      </section>


      {/* ════════ NOSSA VISÃO ════════ */}
      <section className="w-full py-12 px-4 flex justify-center">
        <div 
          className="w-full max-w-[1140px] rounded-3xl p-8 md:p-12 border border-[#D4AF37]/20 text-center relative overflow-hidden"
          style={{ background: 'radial-gradient(circle at center, #111a2c 0%, #090B10 100%)' }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(212,175,55,0.15)', color: GOLD }}>
            <Compass size={28} />
          </div>

          <h2 className="text-white font-black text-2xl md:text-3xl mb-4" style={{ fontFamily: FONT }}>
            Nossa Visão
          </h2>

          <p className="text-white/80 max-w-3xl mx-auto leading-relaxed text-sm md:text-base">
            Ser uma <strong>referência para as famílias católicas na evangelização digital</strong>, oferecendo conteúdos seguros, fiéis à doutrina da Igreja e produzidos com excelência, para que pais e filhos cresçam juntos no conhecimento da Palavra de Deus, da tradição da Igreja e da vida cristã.
          </p>

          <p className="text-[#D4AF37] font-extrabold text-sm md:text-base mt-4">
            Queremos contribuir para que cada lar encontre, por meio do Contos de Oração, um espaço de formação, inspiração e fortalecimento da fé.
          </p>
        </div>
      </section>


      {/* ════════ NOSSOS VALORES ════════ */}
      <section className="w-full py-16 px-4 flex justify-center">
        <div className="w-full max-w-[1140px]">
          
          <div className="text-center mb-12">
            <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: FONT }}>
              Nossos <span style={{ color: GOLD }}>Valores</span>
            </h2>
            <p className="text-white/60 text-xs sm:text-sm mt-1">Os pilares que guiam toda a nossa produção</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {valores.map((val, idx) => {
              const IconeVal = val.icone;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-[#D4AF37]/50 flex flex-col justify-between"
                  style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)' }}
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(212,175,55,0.12)', color: GOLD }}>
                      <IconeVal size={20} />
                    </div>
                    <h3 className="text-white font-extrabold text-base mb-2" style={{ fontFamily: FONT }}>
                      {val.titulo}
                    </h3>
                    <p className="text-white/65 text-xs sm:text-sm leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ════════ ONDE NOS ENCONTRAR E CONTATO ════════ */}
      <section className="w-full py-16 px-4 flex justify-center">
        <div className="w-full max-w-[1140px] grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Redes Sociais */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-white font-black text-xl md:text-2xl mb-2" style={{ fontFamily: FONT }}>
                Onde nos encontrar
              </h3>
              <p className="text-white/70 text-xs sm:text-sm mb-6">
                Acompanhe o Contos de Oração nas redes sociais e faça parte da nossa missão de evangelizar cada vez mais famílias.
              </p>

              <div className="space-y-3">
                <a 
                  href="https://youtube.com/@contosdeoracao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#FF0000]/10 hover:border-[#FF0000]/40 text-white transition-all text-sm font-bold no-underline"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FF0000]/20 flex items-center justify-center text-[#FF0000]">
                    <IconYoutube />
                  </div>
                  <span>YouTube Official</span>
                  <ExternalLink size={14} className="ml-auto text-white/40" />
                </a>

                <a 
                  href="https://instagram.com/contosdeoracao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#E1306C]/10 hover:border-[#E1306C]/40 text-white transition-all text-sm font-bold no-underline"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#E1306C]/20 flex items-center justify-center text-[#E1306C]">
                    <IconInstagram />
                  </div>
                  <span>Instagram</span>
                  <ExternalLink size={14} className="ml-auto text-white/40" />
                </a>

                <a 
                  href="https://facebook.com/contosdeoracao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/40 text-white transition-all text-sm font-bold no-underline"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2]">
                    <IconFacebook />
                  </div>
                  <span>Facebook</span>
                  <ExternalLink size={14} className="ml-auto text-white/40" />
                </a>
              </div>
            </div>
          </div>

          {/* Fale Conosco */}
          <div className="p-8 rounded-3xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] mb-4">
                <Mail size={20} />
              </div>
              
              <h3 className="text-white font-black text-xl md:text-2xl mb-2" style={{ fontFamily: FONT }}>
                Fale Conosco
              </h3>
              
              <p className="text-white/70 text-xs sm:text-sm mb-6">
                Tem alguma dúvida, sugestão, testemunho ou deseja entrar em contato conosco?
              </p>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
                <Mail size={20} className="text-[#D4AF37]" />
                <div>
                  <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider">E-mail de Contato</div>
                  <a href="mailto:contato@contosdeoracao.com.br" className="text-white font-extrabold text-sm hover:text-[#D4AF37] transition-colors no-underline">
                    contato@contosdeoracao.com.br
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Link 
                href="/planos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg no-underline"
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
