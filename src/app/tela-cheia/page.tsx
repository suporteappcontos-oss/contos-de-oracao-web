import Link from 'next/link'
import Image from 'next/image'
import { Monitor, ArrowRight, LogOut } from 'lucide-react'

export default function TelaCheia() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}
    >
      {/* Logo */}
      <Link href="/watch" className="flex items-center gap-3 mb-12">
        <Image src="/logo.png" alt="Contos de Oração" width={44} height={44} className="object-contain" />
        <div className="text-left">
          <div className="text-white font-black text-lg leading-tight">Contos de Oração</div>
          <div className="text-[0.55rem] font-extrabold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Premium</div>
        </div>
      </Link>

      {/* Card central */}
      <div
        className="w-full max-w-md rounded-3xl p-8 md:p-10"
        style={{ background: 'rgba(21,36,62,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Ícone */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
        >
          <Monitor size={36} style={{ color: '#D4AF37' }} />
        </div>

        <h1 className="text-white text-2xl md:text-3xl font-black mb-3 leading-tight">
          Limite de telas atingido
        </h1>
        <p className="text-[#8197a4] text-sm md:text-base leading-relaxed mb-8">
          O seu plano atual permite um número limitado de dispositivos assistindo ao mesmo tempo.
          Para liberar mais uma tela, faça upgrade do seu plano ou aguarde outro dispositivo encerrar.
        </p>

        {/* Ações */}
        <div className="flex flex-col gap-3">
          <Link
            href="/assinar"
            className="w-full py-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transition-all hover:brightness-110 hover:scale-[1.02]"
            style={{ background: '#D4AF37', color: '#090B10' }}
          >
            Fazer Upgrade de Plano <ArrowRight size={18} />
          </Link>

          <Link
            href="/watch"
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#8197a4' }}
          >
            Voltar ao Catálogo
          </Link>
        </div>

        <p className="text-[#4a6373] text-xs mt-6">
          As sessões inativas são encerradas automaticamente após 2 horas.
        </p>
      </div>

      {/* Rodapé */}
      <p className="text-[#4a6373] text-xs mt-10">
        © Contos de Oração · Todos os direitos reservados
      </p>
    </div>
  )
}
