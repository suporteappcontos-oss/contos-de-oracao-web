'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AppBanner() {
  const [versao, setVersao] = useState<string | null>(null);
  const [apkUrl, setApkUrl] = useState('#');

  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>('');

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/apk?t=${timestamp}`, { cache: 'no-store' });
        
        const data = await res.json();
        if (res.ok) {
          if (data.link_download) setApkUrl(data.link_download);
          if (data.versao_atual) setVersao(data.versao_atual);
        } else {
          setDebugInfo('Erro da API: ' + JSON.stringify(data));
        }
      } catch (e: any) {
        setDebugInfo('CATCH ERROR: ' + e.toString());
        console.error("Erro ao buscar versão do APK", e);
      } finally {
        setLoading(false);
      }
    };
    checkUpdate();
  }, []);

  if (loading || apkUrl === '#') return null;

  return (
    <a
      href={apkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-[90px] z-[98] flex items-center gap-3 bg-[#15243E] border border-white/10 rounded-full py-2 px-4 transition-all hover:scale-105 hover:-translate-y-1 hover:border-[#D4AF37]/50 shadow-2xl group"
      title="Baixar Aplicativo Android"
    >
      {/* Ícone com Logo */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg overflow-hidden"
           style={{ background: '#090B10', border: '2px solid #D4AF37' }}>
        <img src="/logo_stripe.png" alt="Logo" className="w-full h-full object-cover" />
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
