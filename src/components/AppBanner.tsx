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
    <div className="flex justify-center px-4 py-12">
      <a
        href={apkUrl}
        download={versao ? `ContosDeOracao_v${versao}.apk` : 'ContosDeOracao.apk'}
        className="group relative flex items-center gap-4 bg-[#15243E] border border-white/10 rounded-full p-2 pr-6 transition-all hover:scale-105 hover:border-[#D4AF37]/50 shadow-2xl hover:shadow-[#D4AF37]/20"
      >
        {/* Ícone */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg"
             style={{ background: 'linear-gradient(135deg,#FFD700,#D4AF37)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#090B10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>

        {/* Textos */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-sm font-extrabold tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Aplicativo Android
            </h3>
            {versao && (
              <span className="text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>
                v{versao}
              </span>
            )}
          </div>
          <p className="text-[#94A3B8] text-xs font-medium">Assista em qualquer lugar</p>
        </div>

        {/* Call to action */}
        <div className="ml-4 pl-4 border-l border-white/10 text-[#D4AF37] text-sm font-bold tracking-tight group-hover:translate-x-1 transition-transform">
          Baixar grátis →
        </div>
      </a>
    </div>
  );
}
