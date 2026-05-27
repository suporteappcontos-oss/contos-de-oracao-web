'use client'

import { Trash2 } from 'lucide-react'
import { deletarUsuario, togglePlanoUsuario, alterarPlanoUsuario } from './actions'

interface BotoesControleUsuarioProps {
  userId: string
  nome: string
  email: string
  planoAtivo: boolean
}

export function BotoesControleUsuario({
  userId,
  nome,
  email,
  planoAtivo,
}: BotoesControleUsuarioProps) {
  const handleExcluir = async (e: React.FormEvent<HTMLFormElement>) => {
    const nomeExibicao = nome !== '—' ? nome : email
    if (!confirm(`Tem certeza que deseja excluir permanentemente a conta de ${nomeExibicao}? O acesso será cancelado imediatamente.`)) {
      e.preventDefault()
    }
  }

  return (
    <>
      <div className="flex gap-2 items-center">
        <form action={deletarUsuario.bind(null, userId)} onSubmit={handleExcluir}>
          <button
            type="submit"
            className="text-red-400 hover:text-red-500 bg-red-500/10 hover:bg-red-500/20 p-2.5 rounded-xl border border-red-500/20 transition-all cursor-pointer"
            title="Excluir Conta Permanentemente"
          >
            <Trash2 size={15} />
          </button>
        </form>
        <form action={togglePlanoUsuario.bind(null, userId, planoAtivo)}>
          <button
            type="submit"
            className={`text-xs px-5 py-2.5 rounded-xl font-bold transition-all border shadow-sm hover:-translate-y-0.5 cursor-pointer ${
              planoAtivo
                ? 'text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
                : 'text-black border-transparent bg-[#D4AF37] hover:brightness-110'
            }`}
          >
            {planoAtivo ? 'Suspender' : 'Liberar Acesso'}
          </button>
        </form>
      </div>
      {planoAtivo && (
        <div className="flex gap-1 mt-1">
          <form action={alterarPlanoUsuario.bind(null, userId, 1, 'Básico')}>
            <button
              type="submit"
              className="text-[10px] bg-white/10 hover:bg-white/20 text-white/70 px-2 py-1 rounded transition-colors cursor-pointer"
              title="Mudar para Básico"
            >
              B
            </button>
          </form>
          <form action={alterarPlanoUsuario.bind(null, userId, 2, 'Essencial')}>
            <button
              type="submit"
              className="text-[10px] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/30 text-[#D4AF37] px-2 py-1 rounded transition-colors cursor-pointer"
              title="Mudar para Essencial"
            >
              E
            </button>
          </form>
          <form action={alterarPlanoUsuario.bind(null, userId, 4, 'Pro')}>
            <button
              type="submit"
              className="text-[10px] bg-[#10b981]/10 hover:bg-[#10b981]/30 text-[#10b981] px-2 py-1 rounded transition-colors cursor-pointer"
              title="Mudar para Pro"
            >
              P
            </button>
          </form>
        </div>
      )}
    </>
  )
}
