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
    <div aria-label="Ações de Controle do Usuário">
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
          <form action={alterarPlanoUsuario.bind(null, userId, 5, 'Mensal')}>
            <button
              type="submit"
              className="text-[10px] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/30 text-[#D4AF37] px-2 py-1 rounded transition-colors cursor-pointer"
              title="Mudar para Mensal (5 telas)"
            >
              M
            </button>
          </form>
          <form action={alterarPlanoUsuario.bind(null, userId, 5, 'Anual')}>
            <button
              type="submit"
              className="text-[10px] bg-[#22c55e]/10 hover:bg-[#22c55e]/30 text-[#22c55e] px-2 py-1 rounded transition-colors cursor-pointer"
              title="Mudar para Anual (5 telas)"
            >
              A
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
