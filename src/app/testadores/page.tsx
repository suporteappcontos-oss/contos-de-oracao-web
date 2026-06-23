'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Infinity as InfinityIcon, ShieldAlert, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react'
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
  const [sistemaCelular, setSistemaCelular] = useState<'android' | 'ios' | ''>('')
  const [sistemaTv, setSistemaTv] = useState<'android_tv' | 'outra' | ''>('')
  const [compromisso, setCompromisso] = useState(false)

  // Validação de elegibilidade (celular deve ser Android E tv deve ser Android TV/Fire TV)
  const celularPreenchido = sistemaCelular !== ''
  const tvPreenchida = sistemaTv !== ''
  
  const celularElegivel = sistemaCelular === 'android'
  const tvElegivel = sistemaTv === 'android_tv'
  
  const ambosPreenchidos = celularPreenchido && tvPreenchida
  const isElegivel = celularElegivel && tvElegivel

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !email.trim() || !whatsapp.trim() || !isElegivel || !compromisso) {
      setErro('Por favor, preencha todos os requisitos elegíveis e aceite o compromisso de teste.')
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
            sistema_celular: sistemaCelular,
            sistema_tv: sistemaTv,
            aceitou_termos: compromisso,
          }
        ])

      if (error) {
        if (error.code === '23505') {
          setErro('Este e-mail já está cadastrado como testador!')
        } else {
          setErro('Erro ao salvar cadastro. Certifique-se de que a tabela no Supabase foi criada com as novas colunas.')
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
      <div className="relative z-10 w-full max-w-[500px] mx-4 rounded-2xl p-8 md:p-10"
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
          {enviado ? 'Vaga Pré-Garantida!' : 'Seja um Testador Oficial'}
        </h1>
        
        <div className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
          {enviado ? (
            <p>
              Cadastro efetuado com sucesso! Estamos recrutando um **grupo fechado de apenas 16 testadores** para homologar o aplicativo na Google Play Store.
            </p>
          ) : (
            <p>
              Estamos selecionando um **grupo fechado de 16 testadores** para homologar nosso aplicativo de TV na Google Play Store. Ajude-nos participando do teste por 14 dias!
            </p>
          )}
        </div>

        {/* Sucesso */}
        {enviado ? (
          <div className="text-center">
            <div className="rounded-2xl p-6 text-center mb-6"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle2 size={44} className="mx-auto text-[#10B981] mb-3" />
              <p className="font-black text-lg mb-2" style={{ color: '#10B981' }}>Cadastro Concluído!</p>
              <p className="text-sm text-white/90 mb-2 font-bold" style={{ lineHeight: '1.5' }}>
                Sua vaga de testador está pré-garantida!
              </p>
              <p className="text-xs text-white/70" style={{ lineHeight: '1.5' }}>
                Seu cadastro foi registrado com sucesso. Em breve, nossa equipe entrará em contato diretamente pelo WhatsApp ou E-mail para fornecer as instruções de instalação e o link de acesso ao grupo fechado.
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
                placeholder="Seu nome e sobrenome"
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
                E-mail (Gmail cadastrado na Play Store)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu.email@gmail.com"
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
                WhatsApp para Contato
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

            {/* Requisitos de Dispositivo */}
            <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl flex flex-col gap-3">
              <span className="block text-[0.65rem] uppercase tracking-widest font-black text-[#D4AF37]">
                🛠️ Verificação de Requisitos
              </span>

              {/* Sistema do Celular */}
              <div>
                <label className="block text-[0.7rem] font-bold text-white/70 mb-1">
                  Sistema do seu Celular
                </label>
                <select
                  value={sistemaCelular}
                  onChange={e => setSistemaCelular(e.target.value as any)}
                  required
                  disabled={loading}
                  className="w-full outline-none text-sm rounded-lg"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                >
                  <option value="" style={{ background: '#090B10' }}>Selecione...</option>
                  <option value="android" style={{ background: '#090B10' }}>Android (Samsung, Motorola, Xiaomi, etc.)</option>
                  <option value="ios" style={{ background: '#090B10' }}>iPhone (iOS)</option>
                </select>
              </div>

              {/* Sistema da TV */}
              <div>
                <label className="block text-[0.7rem] font-bold text-white/70 mb-1">
                  Sistema do seu Aparelho de TV
                </label>
                <select
                  value={sistemaTv}
                  onChange={e => setSistemaTv(e.target.value as any)}
                  required
                  disabled={loading}
                  className="w-full outline-none text-sm rounded-lg"
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                  }}
                >
                  <option value="" style={{ background: '#090B10' }}>Selecione...</option>
                  <option value="android_tv" style={{ background: '#090B10' }}>Android TV / Fire TV Stick / Google TV</option>
                  <option value="outra" style={{ background: '#090B10' }}>Outro (Samsung Tizen, LG WebOS, Apple TV, etc.)</option>
                </select>
              </div>
            </div>

            {/* Aviso de Inelegibilidade */}
            {ambosPreenchidos && !isElegivel && (
              <div className="flex gap-3 rounded-xl p-4 text-xs"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}>
                <AlertTriangle size={24} className="shrink-0 text-red-500" />
                <div>
                  <strong className="block mb-0.5 text-red-400">Aparelhos Incompatíveis:</strong>
                  Infelizmente, as regras da Google exigem um celular Android e um dispositivo de TV com sistema Android (Android TV ou Fire Stick) para validar os testes. Você não poderá prosseguir.
                </div>
              </div>
            )}

            {/* Alerta de Email importante */}
            {isElegivel && (
              <div className="flex gap-3 rounded-xl p-4 text-xs"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1.5px solid rgba(212,175,55,0.2)', color: '#FFD54F' }}>
                <ShieldAlert size={24} className="shrink-0" style={{ color: '#D4AF37' }} />
                <div>
                  Certifique-se de que o e-mail informado acima é o mesmo Gmail que você utiliza logado na Google Play Store.
                </div>
              </div>
            )}

            {/* Checkbox de Compromisso */}
            {isElegivel && (
              <div className="flex items-start gap-3 mt-1">
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
                  Comprometo-me a manter o app instalado por 14 dias seguidos e abri-lo diariamente para validar os testes exigidos pela Google.
                </label>
              </div>
            )}

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
              disabled={loading || !isElegivel || !compromisso}
              className="mt-2 w-full rounded-xl font-extrabold text-base cursor-pointer transition-all hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
