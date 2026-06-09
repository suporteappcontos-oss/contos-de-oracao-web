'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function DynamicBackground() {
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    async function loadThumbnails() {
      const supabase = createClient();
      const { data } = await supabase
        .from('videos')
        .select('thumbnail_url, bunny_video_id, id')
        .eq('ativo', true)
        .limit(30);

      if (data && data.length > 0) {
        // Usa a thumbnail ou a imagem estática do bunny
        const urls = data.map(v => v.thumbnail_url || `https://vz-74ee79ad-843.b-cdn.net/${v.bunny_video_id}/preview.webp`);
        // Embaralha para ficar mais dinâmico
        const shuffled = urls.sort(() => 0.5 - Math.random());
        setThumbnails(shuffled);
      } else {
        // Fallback placeholders caso não tenha vídeos
        setThumbnails(Array(15).fill('/background.jpg'));
      }
    }
    loadThumbnails();
  }, []);

  if (thumbnails.length === 0) {
    return <div className="fixed inset-0 z-[-1] bg-[#090B10]" />;
  }

  // Cria linhas misturadas a partir do array completo para garantir que não haja repetições feias (caso tenham poucos vídeos)
  const getMixedRow = (offset: number) => {
    if (thumbnails.length === 0) return [];
    const mixed = [...thumbnails];
    // Rotaciona o array baseado no offset para que cada linha comece diferente
    for(let i=0; i < offset % mixed.length; i++) {
        mixed.push(mixed.shift()!);
    }
    return mixed;
  };

  const row1 = getMixedRow(0);
  const row2 = getMixedRow(3);
  const row3 = getMixedRow(6);
  const row4 = getMixedRow(9);

  // Duplicar arrays para o efeito infinito funcionar sem quebrar
  const renderRow = (rowItems: string[], directionClass: string) => {
    if (rowItems.length === 0) return null;
    
    // Garantir que a sequência base tenha no mínimo 15 itens
    let repeatedBase = [...rowItems];
    while (repeatedBase.length < 15) {
      repeatedBase = [...repeatedBase, ...rowItems];
    }
    // Duplicar exatamente a sequência inteira para o loop de -50% funcionar perfeitamente
    const items = [...repeatedBase, ...repeatedBase];

    return (
      <div className={`flex gap-4 mb-4 ${directionClass}`}>
        {items.map((url, idx) => (
          <div 
            key={idx} 
            className="w-40 sm:w-56 md:w-64 lg:w-72 aspect-video rounded-xl bg-cover bg-center shrink-0 border border-white/5 opacity-70"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[-1] bg-[#090B10] overflow-hidden flex items-center justify-center">
      {/* Container "entortado" e expandido para cobrir as bordas giradas */}
      <div 
        className="absolute w-[150vw] h-[150vh] flex flex-col justify-center"
        style={{ transform: 'rotate(-8deg) scale(1.1)' }}
      >
        {renderRow(row1.length ? row1 : thumbnails.slice(0,5), 'animate-marquee')}
        {renderRow(row2.length ? row2 : thumbnails.slice(0,5), 'animate-marquee-reverse')}
        {renderRow(row3.length ? row3 : thumbnails.slice(0,5), 'animate-marquee')}
        {renderRow(row4.length ? row4 : thumbnails.slice(0,5), 'animate-marquee-reverse')}
      </div>

      {/* Sobreposição escura (Gradient) para escurecer o fundo e permitir leitura do texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/60 to-[#090B10]/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090B10] via-transparent to-[#090B10] pointer-events-none opacity-40" />
    </div>
  );
}
