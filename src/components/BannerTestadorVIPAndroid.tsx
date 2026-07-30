'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, X, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

type Props = {
  userEmail?: string
  userName?: string
  isPlanoAtivo?: boolean
}

/* ── SVG Oficial do Google Play Store ── */
const GooglePlayLogoSVG = () => (
  <svg width="24" height="24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M325.8 256L88.5 24.3C83.2 29.5 80 36.8 80 45.2v421.6c0 8.4 3.2 15.7 8.5 20.9L325.8 256z" fill="#00E676" />
    <path d="M407.7 176.4L325.8 256l81.9 79.6 48.7-27.7c13.9-7.9 23.2-22.7 23.2-39.5s-9.3-31.6-23.2-39.5l-48.7-27.7z" fill="#FFD54F" />
    <path d="M88.5 487.7l237.3-231.7L407.7 335.6 136.6 490c-15 8.5-33.1 7.7-48.1-2.3z" fill="#FF3D00" />
    <path d="M88.5 24.3C103.5 14.3 121.6 13.5 136.6 22l271.1 154.4-81.9 79.6L88.5 24.3z" fill="#00B0FF" />
  </svg>
)

export default function BannerTestadorVIPAndroid({ userEmail = '', userName = '', isPlanoAtivo = false }: Props) {
  const [isAndroid, setIsAndroid] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  
  // Form states
  const [gmail, setGmail] = useState(userEmail)
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const jaCadastrouOuDispensou = localStorage.getItem('testador_vip_android_registrado')
    if (jaCadastrouOuDispensou) return

    const ua = navigator.userAgent.toLowerCase()
    const isAndroidDev = ua.includes('android') || true

    if (isPlanoAtivo && isAndroidDev) {
      setIsAndroid(true)
      setDismissed(false)
    }
  }, [isPlanoAtivo])

  useEffect(() => {
    if (userEmail) setGmail(userEmail)
  }, [userEmail])

  function handleWhatsappChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.slice(0, 11)
    if (val.length > 10) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
    } else if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`
    } else if (val.length > 0) {
      val = `(${val}`
    }
    setWhatsapp(val)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleanEmail = gmail.trim().toLowerCase()

    if (!cleanEmail || (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@googlemail.com'))) {
      setErro('A Google Play Store exige obrigatoriamente um e-mail do Gmail (@gmail.com).')
      return
    }

    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10) {
      setErro('Por favor, digite seu WhatsApp com DDD para envio do link.')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const supabase = createClient()
      const { error } = await supabase.from('testadores_playstore').insert([
        {
          nome: userName || 'Assinante VIP',
          email: cleanEmail,
          whatsapp: whatsapp.trim(),
          sistema_celular: 'Android VIP Assinante',
          sistema_tv: 'N/A',
          aceitou_termos: true
        }
      ])

      if (error && error.code === '23505') {
        setSucesso(true)
        localStorage.setItem('testador_vip_android_registrado', 'true')
      } else if (error) {
        setErro('Erro ao cadastrar. Tente novamente.')
        console.error(error)
      } else {
        setSucesso(true)
        localStorage.setItem('testador_vip_android_registrado', 'true')
      }
    } catch (err) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem('testador_vip_android_registrado', 'dismissed')
  }

  if (dismissed || !isAndroid) return null

  return (
    <>
      {/* Banner Profissional Estilo Google Play Store */}
      <div className="w-full bg-[#0a0f18] border-b border-white/10 py-3 px-4 relative overflow-hidden shadow-2xl">
        {/* Glow sutil */}
        <div className="absolute top-0 right-1/4 w-96 h-full bg-[#01875f]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          
          <div className="flex items-center gap-3.5">
            {/* Ícone Play Store Container */}
            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-md">
              <GooglePlayLogoSVG />
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-[#00e676] font-bold text-[0.65rem] uppercase tracking-widest bg-[#00e676]/10 px-2 py-0.5 rounded-md border border-[#00e676]/20">
                  Google Play Beta VIP
                </span>
                <span className="text-white/40 text-[0.65rem]">• Exclusivo Assinantes</span>
              </div>
              <p className="text-white text-xs md:text-sm font-semibold mt-0.5">
                Baixe o aplicativo nativo para Android direto na Play Store antes do lançamento! 📱
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão Badge Oficial Google Play Style */}
            <button
              onClick={() => setModalOpen(true)}
              className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#01875f] to-[#00b0ff] text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <GooglePlayLogoSVG />
              <div className="text-left leading-none">
                <div className="text-[0.55rem] text-white/80 font-medium lowercase">disponível no</div>
                <div className="text-xs font-black tracking-tight uppercase">Google Play</div>
              </div>
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform text-white/80" />
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 text-white/30 hover:text-white transition-colors cursor-pointer"
              title="Dispensar aviso"
            >
              <X size={18} />
            </button>
          </div>

        </div>
      </div>

      {/* Modal de Inscrição Profissional */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0c121e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-left">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-2 cursor-pointer"
            >
              <X size={20} />
            </button>

            {sucesso ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00e676]/10 text-[#00e676] flex items-center justify-center border border-[#00e676]/20">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-white text-xl font-extrabold">Acesso Beta VIP Liberado! 🎉</h3>
                <p className="text-white/70 text-xs leading-relaxed">
                  Cadastramos o seu Gmail no programa exclusivo da Google Play Store. Enviaremos o link oficial de download diretamente no seu WhatsApp!
                </p>
                <button
                  onClick={() => {
                    setModalOpen(false)
                    setDismissed(true)
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#01875f] text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer"
                >
                  Concluído
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3.5 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <GooglePlayLogoSVG />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg tracking-tight">App Contos de Oração Club</h3>
                    <p className="text-[#00e676] text-xs font-bold uppercase tracking-wider">Acesso Antecipado Android</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-white/70 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#00e676]" />
                    Como funciona o teste Beta VIP?
                  </div>
                  <p className="text-white/50 text-[0.7rem] leading-relaxed">
                    Cadastramos seu Gmail no Google Play Console. Você receberá o convite oficial da Google Play no seu WhatsApp para instalar o app nativo no celular.
                  </p>
                </div>

                {erro && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
                    {erro}
                  </div>
                )}

                <div>
                  <label className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Seu Gmail da Google Play Store *
                  </label>
                  <input
                    type="email"
                    required
                    value={gmail}
                    onChange={e => setGmail(e.target.value)}
                    placeholder="exemplo@gmail.com"
                    className="w-full bg-[#141b29] border border-white/10 focus:border-[#01875f] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all placeholder-white/20"
                  />
                  <p className="text-white/30 text-[0.65rem] mt-1">Informe a conta do Gmail usada na loja de aplicativos do seu Android.</p>
                </div>

                <div>
                  <label className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-1.5">
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-[#141b29] border border-white/10 focus:border-[#01875f] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all placeholder-white/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#01875f] to-[#00b0ff] text-white font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Cadastrando...' : 'Garantir Acesso Beta na Play Store →'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  )
}
