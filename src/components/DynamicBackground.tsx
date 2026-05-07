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
          {/* Imagem Mobile */}
          <img src={bgMob} alt="background" className="w-full h-full object-cover opacity-[0.12] mix-blend-screen md:hidden" />
          {/* Imagem Desktop */}
          <img src={bgDesk} alt="background" className="w-full h-full object-cover opacity-[0.12] mix-blend-screen hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/80 to-transparent" />
        </>
      )}
    </div>
  );
}
