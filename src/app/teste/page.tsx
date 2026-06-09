import { createClient } from '@/utils/supabase/server';
import NetflixBackground from './NetflixBackground';

export default async function TestePage() {
  const supabase = await createClient();
  
  // Buscar os vídeos/filmes ativos do Supabase para pegar as imagens (thumbnails)
  const { data: videos } = await supabase
    .from('videos')
    .select('id, thumbnail_url')
    .eq('ativo', true)
    .order('criado_em', { ascending: false });

  // Filtrar apenas as imagens válidas
  const images = videos?.map(v => v.thumbnail_url).filter(Boolean) || [];

  return (
    <main className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-outfit">
      
      {/* Componente Client-side com a animação de fundo estilo Netflix */}
      <NetflixBackground images={images} />

      {/* Header Fixo Simulado (Logo Netflix / Entrar) */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6 lg:px-12">
        <div className="text-[#E50914] text-4xl font-black tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
          CONTOS
        </div>
        <a 
          href="/login"
          className="bg-[#E50914] hover:bg-[#F40612] text-white px-4 py-1.5 rounded font-medium transition-colors text-sm"
        >
          Entrar
        </a>
      </header>

      {/* Conteúdo Central Sobreposto */}
      <div className="relative z-10 w-full max-w-[800px] px-6 text-center mt-12">
        <h1 className="text-4xl sm:text-5xl lg:text-[4rem] leading-tight font-black text-white mb-4 drop-shadow-xl">
          Filmes, séries e muito mais, sem limites
        </h1>
        
        <p className="text-xl sm:text-2xl text-white font-medium mb-8 drop-shadow-md">
          A partir de R$ 20,90. Cancele quando quiser.
        </p>

        <p className="text-white text-base sm:text-lg mb-4 drop-shadow-md font-normal">
          Quer assistir? Informe seu email para criar ou reiniciar sua assinatura.
        </p>

        {/* Formulário de Email e Botão estilo Netflix */}
        <form className="flex flex-col sm:flex-row items-stretch justify-center gap-2 w-full max-w-3xl mx-auto">
          <input 
            type="email" 
            placeholder="Email" 
            required
            className="flex-1 px-4 py-4 bg-black/60 border border-white/40 text-white rounded focus:outline-none focus:border-white transition-colors text-lg backdrop-blur-sm"
          />
          <button 
            type="button" 
            className="bg-[#E50914] hover:bg-[#F40612] text-white font-bold py-4 px-8 rounded transition-colors text-xl flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            Vamos lá
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}
