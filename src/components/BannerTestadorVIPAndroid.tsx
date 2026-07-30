'use client'

import React, { useState, useEffect } from 'react'
import { Smartphone, Sparkles, X, CheckCircle2, Send, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

type Props = {
  userEmail?: string
  userName?: string
  isPlanoAtivo?: boolean
}

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
    // Exibe apenas se o usuário for assinante ativo e não tiver dispensado o aviso nesta sessão
    const jaCadastrouOuDispensou = localStorage.getItem('testador_vip_android_registrado')
    if (jaCadastrouOuDispensou) return

    const ua = navigator.userAgent.toLowerCase()
    const isAndroidDev = ua.includes('android') || true // Exibe para Android (e no PC para assinantes)

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

    if (!cleanEmail || !cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@googlemail.com')) {
      setErro('A Google Play Store exige obrigatoriamente um e-mail do Gmail (@gmail.com).')
      return
    }

    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 10) {
      setErro('Por favor, digite seu WhatsApp com DDD para entrarmos em contato.')
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
        // Já cadastrado
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
      {/* Banner Superior Dourado VIP */}
      <div className="w-full bg-gradient-to-r from-[#111827] via-[#1a2234] to-[#111827] border-y border-[#D4AF37]/40 py-3.5 px-4 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-[#D4AF37]/10 blur-2xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#D4AF37] text-black flex items-center justify-center font-bold shrink-0 shadow-lg shadow-[#D4AF37]/20">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-[#D4AF37] font-black text-xs uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} /> Exclusivo para Assinantes Android
                </span>
              </div>
              <p className="text-white text-xs md:text-sm font-bold">
                Seja um Testador VIP do aplicativo nativo na Google Play Store! 🚀
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-black text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>Garantir Vaga VIP</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 text-white/30 hover:text-white transition-colors"
              title="Dispensar aviso"
            >
              <X size={18} />
            </button>
          </div>

        </div>
      </div>

      {/* Modal de Cadastro VIP */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0d131f] border-2 border-[#D4AF37]/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(212,175,55,0.2)] text-left">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-2"
            >
              <X size={20} />
            </button>

            {sucesso ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-white text-xl font-black">Vaga VIP Confirmada! 🎉</h3>
                <p className="text-white/70 text-xs leading-relaxed">
                  Cadastramos o seu Gmail na nossa lista antecipada do Google Play Console. Em breve enviaremos o link de download do App no seu WhatsApp!
                </p>
                <button
                  onClick={() => {
                    setModalOpen(false)
                    setDismissed(true)
                  }}
                  className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase"
                >
                  Ok, Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">Inscrição Testador VIP Android</h3>
                    <p className="text-white/40 text-xs">Liberação antecipada na Google Play Store</p>
                  </div>
                </div>

                {erro && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
                    {erro}
                  </div>
                )}

                <div>
                  <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
                    Gmail da Google Play Store *
                  </label>
                  <input
                    type="email"
                    required
                    value={gmail}
                    onChange={e => setGmail(e.target.value)}
                    placeholder="seuemail@gmail.com"
                    className="w-full bg-[#151c2c] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  />
                  <p className="text-white/30 text-[0.65rem] mt-1">Deve ser a mesma conta do Gmail configurada na Play Store do seu celular.</p>
                </div>

                <div>
                  <label className="block text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-[#151c2c] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
                >
                  {loading ? 'Cadastrando...' : 'Confirmar minha Vaga VIP Android →'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  )
}
