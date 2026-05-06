'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AppBanner() {
  const [versao, setVersao] = useState<string | null>(null);
  const [apkUrl, setApkUrl] = useState('https://contos-apks.b-cdn.net/contos-de-oracao.apk');

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`https://contos-apks.b-cdn.net/versao.json?t=${timestamp}`, { cache: 'no-store' });
        
        if (res.ok) {
          const data = await res.json();
          if (data.link_download) setApkUrl(data.link_download);
          if (data.versao_atual) setVersao(data.versao_atual);
        }
      } catch (e) {
        console.error("Erro ao buscar versão do APK", e);
      }
    };
    checkUpdate();
  }, []);

  return (
    <a
      href={apkUrl}
      download={versao ? `ContosDeOracao_v${versao}.apk` : 'ContosDeOracao.apk'}
      className="fixed bottom-6 right-[90px] z-[98] flex items-center gap-3 bg-[#15243E] border border-white/10 rounded-full py-2 px-4 transition-all hover:scale-105 hover:-translate-y-1 hover:border-[#D4AF37]/50 shadow-2xl group"
      title="Baixar Aplicativo Android"
    >
      {/* Ícone */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg"
           style={{ background: 'linear-gradient(135deg,#FFD700,#D4AF37)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#090B10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </div>

      {/* Textos (Some em telas muito pequenas para não encavalar) */}
      <div className="hidden sm:flex flex-col pr-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-white text-xs font-extrabold tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Baixar App
          </h3>
          {versao && (
            <span className="text-[0.55rem] font-bold uppercase px-1 py-0.5 rounded-sm leading-none" style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>
              v{versao}
            </span>
          )}
        </div>
      </div>
      
      {/* Tooltip para mobile ou quando está só o ícone */}
      <span className="absolute sm:hidden right-16 bg-white text-black font-bold text-sm px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl pointer-events-none before:content-[''] before:absolute before:top-1/2 before:-right-2 before:-translate-y-1/2 before:border-8 before:border-transparent before:border-l-white">
        Baixar App
      </span>
    </a>
  );
}
