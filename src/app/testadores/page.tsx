'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Infinity as InfinityIcon, ShieldAlert } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import { createClient } from '@/utils/supabase/client'

export default function TestadoresPage() {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  
  // Campos do formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [modeloTv, setModeloTv] = useState('')
  const [compromisso, setCompromisso] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !email.trim() || !whatsapp.trim() || !modeloTv.trim() || !compromisso) {
      setErro('Por favor, preencha todos os campos e aceite o compromisso de teste.')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('testadores_playstore')
        .insert([
          {
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            whatsapp: whatsapp.trim(),
            modelo_tv: modeloTv.trim(),
            aceitou_termos: compromisso,
          }
        ])

      if (error) {
        if (error.code === '23505') {
          setErro('Este e-mail já está cadastrado como testador!')
        } else {
          setErro('Erro ao salvar cadastro. Certifique-se de que a tabela foi criada no banco de dados.')
          console.error(error)
        }
        setLoading(false)
      } else {
        setEnviado(true)
      }
    } catch (err) {
      setErro('Erro de conexão com o servidor. Tente novamente.')
      setLoading(false)
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-16"
      style={{ background: 'transparent', fontFamily: 'Outfit, sans-serif' }}>

      {/* Fundo sutil premium */}
      <DynamicBackground />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-[#090B10]/70" />

      {/* Logo no topo */}
      <header className="absolute top-0 w-full py-4 px-[4%] z-30">
        <Link href="/" className="flex items-center gap-3 no-underline w-fit">
          <Image src="/logo.png" alt="Contos de Oração" width={40} height={40} className="object-contain" />
          <div className="text-white font-black text-base leading-tight">Contos de Oração</div>
        </Link>
      </header>

      {/* Card Principal */}
      <div className="relative z-10 w-full max-w-[480px] mx-4 rounded-2xl p-8 md:p-10"
        style={{
          background: 'rgba(21,36,62,0.92)', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 1px rgba(212,175,55,0.2)'
        }}>

        {/* Ícone Gold */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-5"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
          🚀
        </div>

        <h1 className="text-white text-2xl md:text-3xl font-black mb-2">
          {enviado ? 'Cadastro Recebido!' : 'Seja um Testador Oficial'}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
          {enviado
            ? 'Agradecemos sua disposição em nos ajudar! Você receberá o convite de instalação e as instruções de teste no e-mail cadastrado em breve.'
            : 'Ajude-nos a publicar nosso aplicativo na Google Play Store. Precisamos de 12 voluntários para testar o aplicativo da TV por 14 dias.'}
        </p>

        {/* Alerta importante sobre o e-mail */}
        {!enviado && (
          <div className="flex gap-3 rounded-xl p-4 mb-6 text-xs text-white/95"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1.5px solid rgba(212,175,55,0.25)', color: '#FFD54F' }}>
            <ShieldAlert size={28} className="shrink-0" style={{ color: '#D4AF37' }} />
            <div>
              <strong className="block mb-0.5 text-[#D4AF37]">IMPORTANTE (CONTA GOOGLE):</strong>
              O e-mail cadastrado deve ser o mesmo e-mail (Gmail) que você usa na Play Store do seu celular ou TV para poder liberar o download!
            </div>
          </div>
        )}

        {/* Sucesso */}
        {enviado ? (
          <div className="text-center">
            <div className="rounded-2xl p-6 text-center mb-6"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-black text-lg mb-2" style={{ color: '#10B981' }}>Tudo Pronto!</p>
              <p className="text-sm text-white/70" style={{ lineHeight: '1.5' }}>
                Fique atento à sua caixa de entrada do Gmail. Enviaremos um link de convite oficial da Google Play Store.
              </p>
            </div>
            <Link href="/" className="block text-center text-sm font-bold no-underline transition-colors hover:opacity-80"
              style={{ color: '#D4AF37' }}>
              ← Voltar para a Página Inicial
            </Link>
          </div>
        ) : (
          /* Formulário */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Nome Completo */}
            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest font-bold mb-1.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                Nome Completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                placeholder="Ex: João Silva da Cruz"
                disabled={loading}
                className="w-full outline-none transition-all text-sm rounded-xl"
                style={{
                  padding: '14px 16px', boxSizing: 'border-box' as const,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  color: '#fff', fontFamily: 'Outfit, sans-serif',
                  opacity: loading ? 0.6 : 1
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* E-mail da Conta Google */}
            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest font-bold mb-1.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                E-mail (Conta Google / Gmail)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu.email.playstore@gmail.com"
                disabled={loading}
                className="w-full outline-none transition-all text-sm rounded-xl"
                style={{
                  padding: '14px 16px', boxSizing: 'border-box' as const,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  color: '#fff', fontFamily: 'Outfit, sans-serif',
                  opacity: loading ? 0.6 : 1
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest font-bold mb-1.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                WhatsApp / Telefone para Contato
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                required
                placeholder="Ex: (11) 99999-9999"
                disabled={loading}
                className="w-full outline-none transition-all text-sm rounded-xl"
                style={{
                  padding: '14px 16px', boxSizing: 'border-box' as const,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  color: '#fff', fontFamily: 'Outfit, sans-serif',
                  opacity: loading ? 0.6 : 1
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* Modelo da TV */}
            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest font-bold mb-1.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                Qual dispositivo você usará para testar?
              </label>
              <input
                type="text"
                value={modeloTv}
                onChange={e => setModeloTv(e.target.value)}
                required
                placeholder="Ex: Fire TV Stick, Mi Box, Android TV, etc."
                disabled={loading}
                className="w-full outline-none transition-all text-sm rounded-xl"
                style={{
                  padding: '14px 16px', boxSizing: 'border-box' as const,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  color: '#fff', fontFamily: 'Outfit, sans-serif',
                  opacity: loading ? 0.6 : 1
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* Checkbox de Compromisso */}
            <div className="flex items-start gap-3 mt-2">
              <input
                type="checkbox"
                id="compromisso"
                checked={compromisso}
                onChange={e => setCompromisso(e.target.checked)}
                required
                disabled={loading}
                className="mt-1 accent-[#D4AF37] cursor-pointer"
              />
              <label htmlFor="compromisso" className="text-xs select-none cursor-pointer"
                style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>
                Comprometo-me a manter o aplicativo instalado por 14 dias seguidos e abri-lo diariamente para validar os testes exigidos pela Google.
              </label>
            </div>

            {/* Erro */}
            {erro && (
              <div className="rounded-xl px-4 py-3 text-sm text-center mt-2"
                style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080' }}>
                ❌ {erro}
              </div>
            )}

            {/* Botão de Enviar */}
            <button
              type="submit"
              disabled={loading || !compromisso}
              className="mt-3 w-full rounded-xl font-extrabold text-base cursor-pointer transition-all hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ padding: '14px', background: '#D4AF37', color: '#090B10', border: 'none', fontFamily: 'Outfit, sans-serif' }}>
              {loading ? (
                <><InfinityIcon className="premium-trace" size={20} /> Enviando Cadastro...</>
              ) : (
                'Quero ser Testador Voluntário →'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
