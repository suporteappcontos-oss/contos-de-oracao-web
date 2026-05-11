'use client'

import { useState, useEffect } from 'react'
import { X, Smartphone, Tv, Download, QrCode, Wifi, ChevronRight, Monitor } from 'lucide-react'

const VERSAO_JSON_URL = 'https://contos-apks.b-cdn.net/versao.json'
// Fallback: link fixo sem versão (caso o versao.json falhe)
const APK_FALLBACK = 'https://contos-apks.b-cdn.net/contos-de-oracao.apk'

export default function DispositivosModal() {
  const [open, setOpen] = useState(false)
  const [aba, setAba] = useState<'android' | 'tv'>('android')
  const [apkUrl, setApkUrl] = useState<string>(APK_FALLBACK)

  useEffect(() => {
    fetch(VERSAO_JSON_URL + '?t=' + Date.now())
      .then(r => r.json())
      .then(data => {
        if (data?.link_download) setApkUrl(data.link_download)
      })
      .catch(() => {}) // mantém fallback em caso de erro
  }, [])

  return (
    <>
      {/* ── BOTÃO NA NAVBAR ── */}
      <button
        id="btn-dispositivos"
        onClick={() => setOpen(true)}
        title="Acesso em dispositivos"
        className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
        style={{
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.4)',
          color: '#818cf8',
        }}
      >
        <Monitor size={13} className="group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline tracking-wide">Dispositivos</span>
      </button>

      {/* ── MODAL ── */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #0F1420, #0A0C15)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.05)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div>
                <h2 className="text-white font-black text-lg">Acesse em qualquer lugar</h2>
                <p className="text-white/40 text-xs mt-0.5">Celular, tablet, Smart TV e mais</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Abas */}
            <div className="flex gap-1 px-6 pt-5">
              <button
                onClick={() => setAba('android')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  aba === 'android'
                    ? 'text-black'
                    : 'text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10'
                }`}
                style={aba === 'android' ? { background: 'linear-gradient(135deg, #D4AF37, #F5D67B)' } : {}}
              >
                <Smartphone size={13} />
                App Android
              </button>
              <button
                onClick={() => setAba('tv')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  aba === 'tv'
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10'
                }`}
                style={aba === 'tv' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
              >
                <Tv size={13} />
                Smart TV
              </button>
            </div>

            {/* ── ABA ANDROID ── */}
            {aba === 'android' && (
              <div className="px-6 py-5 space-y-4">
                {/* Card destaque download */}
                <a
                  href={apkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] group cursor-pointer block"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
                    border: '1px solid rgba(212,175,55,0.3)',
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D67B)' }}>
                    <Download size={22} className="text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-black text-sm">Baixar App Android</div>
                    <div className="text-white/40 text-xs mt-0.5">Versão mais recente • arquivo .apk</div>
                  </div>
                  <ChevronRight size={16} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform shrink-0" />
                </a>

                {/* Passos para instalar */}
                <div className="space-y-2">
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest">Como instalar</p>
                  {[
                    { n: '1', t: 'Baixe o arquivo .apk acima no seu celular Android' },
                    { n: '2', t: 'Abra o arquivo e toque em "Instalar" (pode pedir permissão para instalar de fontes desconhecidas)' },
                    { n: '3', t: 'Abra o App, faça login com sua conta e aproveite!' },
                  ].map(({ n, t }) => (
                    <div key={n} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>{n}</span>
                      <p className="text-white/60 text-xs leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ABA TV ── */}
            {aba === 'tv' && (
              <div className="px-6 py-5 space-y-4">
                {/* Aviso compatibilidade */}
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <Tv size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-white/60 text-xs leading-relaxed">
                    Funciona em <strong className="text-white/80">Smart TVs com navegador</strong>, <strong className="text-white/80">Fire TV Stick</strong>, <strong className="text-white/80">Chromecast</strong> e qualquer TV com acesso à internet.
                    <span className="block mt-1 text-indigo-400">Não precisa instalar nada na TV!</span>
                  </p>
                </div>

                {/* Passos TV */}
                <div className="space-y-2">
                  <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest">Passo a passo</p>
                  {[
                    { n: '1', icon: <Tv size={13} />, t: 'Na sua TV, abra o navegador (Samsung: Internet; LG: Web Browser; Fire Stick: Silk Browser)' },
                    { n: '2', icon: <Wifi size={13} />, t: 'Digite o endereço: contosdeoracao.com.br e acesse o site normalmente' },
                    { n: '3', icon: <QrCode size={13} />, t: 'Na tela de login da TV, aponte a câmera do celular para o QR Code exibido' },
                    { n: '4', icon: <Smartphone size={13} />, t: 'Seu celular vai abrir automaticamente. Confirme o login e a TV entra instantaneamente!' },
                  ].map(({ n, icon, t }) => (
                    <div key={n} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(99,102,241,0.25)', color: '#818cf8' }}>{n}</span>
                      <p className="text-white/60 text-xs leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>

                {/* Dispositivos compatíveis */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Samsung TV', emoji: '📺' },
                    { label: 'LG Smart TV', emoji: '📺' },
                    { label: 'Fire TV Stick', emoji: '🔥' },
                    { label: 'Chromecast', emoji: '🔵' },
                    { label: 'Android TV', emoji: '🤖' },
                    { label: 'Apple TV', emoji: '🍎' },
                  ].map(({ label, emoji }) => (
                    <div key={label} className="flex flex-col items-center gap-1 p-2 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-lg">{emoji}</span>
                      <span className="text-white/40 text-[10px] leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="text-white/25 text-[10px]">Suporte: suporte.appcontos@gmail.com</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
