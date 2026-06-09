'use client';
import Image from 'next/image';

export default function NetflixBackground({ images }: { images: string[] }) {
  // Imagem de fallback caso não venha nenhuma do banco
  const fallback = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80';
  
  // Garantir que temos um número razoável de imagens para o carrossel não ficar vazio
  let posters = images.length > 0 ? images : [fallback, fallback, fallback];
  // Se tiver poucas imagens, duplicamos para preencher a tela
  while (posters.length < 15) {
    posters = [...posters, ...posters];
  }

  // Criamos 4 linhas, com leve variação de ordem para não parecerem idênticas
  const rows = [
    [...posters].sort(() => Math.random() - 0.5),
    [...posters].sort(() => Math.random() - 0.5),
    [...posters].sort(() => Math.random() - 0.5),
    [...posters].sort(() => Math.random() - 0.5),
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black flex items-center justify-center pointer-events-none">
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-left {
          display: flex;
          width: max-content;
          animation: marqueeLeft 120s linear infinite;
        }
        .marquee-right {
          display: flex;
          width: max-content;
          animation: marqueeRight 120s linear infinite;
        }
      `}</style>

      {/* Overlay gradiente para escurecer o fundo e dar destaque ao texto */}
      <div className="absolute inset-0 z-10 bg-black/50 bg-gradient-to-t from-[#090B10] via-black/40 to-black/80" />

      {/* Container inclinado ("torto") e com zoom (scale) para cobrir toda a tela */}
      <div 
        className="relative flex flex-col gap-3 md:gap-4 w-[200vw] left-[-50vw] transform -rotate-[10deg] scale-[1.25] opacity-50"
      >
        {rows.map((rowImages, rowIndex) => {
          // Duplicamos o array para criar o loop perfeito (50% do tamanho total é um array completo)
          const seamlessRow = [...rowImages, ...rowImages];
          const directionClass = rowIndex % 2 === 0 ? 'marquee-left' : 'marquee-right';
          
          return (
            <div key={rowIndex} className={directionClass}>
              {seamlessRow.map((img, imgIndex) => (
                <div 
                  key={imgIndex} 
                  className="relative w-[140px] h-[200px] sm:w-[200px] sm:h-[280px] md:w-[260px] md:h-[380px] shrink-0 rounded-md overflow-hidden bg-zinc-900 mx-1.5 md:mx-2"
                >
                  <Image
                    src={img}
                    alt="Poster"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 200px, 260px"
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
