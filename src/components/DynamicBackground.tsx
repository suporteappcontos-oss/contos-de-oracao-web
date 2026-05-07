'use client';
import React, { useEffect, useState } from 'react';

export default function DynamicBackground() {
  const [bgDesk, setBgDesk] = useState<string | null>(null);
  const [bgMob, setBgMob] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/config-fundo?t=${timestamp}`, { cache: 'no-store' });
        if (res.ok) {
          const config = await res.json();
          if (config.background_url_desktop) setBgDesk(config.background_url_desktop);
          if (config.background_url_mobile) setBgMob(config.background_url_mobile);
          // Fallback caso ainda tenha a versão antiga
          if (config.background_url && !config.background_url_desktop) {
            setBgDesk(config.background_url);
            setBgMob(config.background_url);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] bg-[#090B10]">
      {bgDesk && bgMob && (
        <>
          {/* Fundo Mobile */}
          <div 
            className="absolute inset-0 bg-cover bg-center md:hidden opacity-[0.12] transition-opacity duration-1000 mix-blend-screen"
            style={{ backgroundImage: `url('${bgMob}')` }}
          />
          {/* Fundo Desktop */}
          <div 
            className="absolute inset-0 bg-cover bg-center hidden md:block opacity-[0.12] transition-opacity duration-1000 mix-blend-screen"
            style={{ backgroundImage: `url('${bgDesk}')` }}
          />
          
          {/* Overlay Escuro / Gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/80 to-transparent pointer-events-none" />
        </>
      )}
    </div>
  );
}
