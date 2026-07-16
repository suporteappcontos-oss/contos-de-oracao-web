'use client'

import { useState } from 'react'
import { FileText, Clock, User, Search, RotateCcw } from 'lucide-react'

interface LogAuditoria {
  id: string
  user_email: string
  acao: string
  criado_em: string
}

interface VisualizadorLogsProps {
  logs: LogAuditoria[]
}

export default function VisualizadorLogs({ logs }: VisualizadorLogsProps) {
  const [filtro, setFiltro] = useState('')

  // Filtragem local básica
  const logsFiltrados = logs.filter(log => {
    const termo = filtro.toLowerCase().trim()
    if (!termo) return true
    return (
      log.user_email?.toLowerCase().includes(termo) ||
      log.acao?.toLowerCase().includes(termo)
    )
  })

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-white text-xl font-black tracking-tight flex items-center gap-2">
            <FileText className="text-[#D4AF37]" size={20} />
            Logs de Auditoria
          </h3>
          <p className="text-white/50 text-xs mt-1">
            Histórico completo de alterações realizadas na plataforma pelos administradores.
          </p>
        </div>

        {/* Campo de Busca */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar por e-mail ou ação..."
            className="w-full bg-[#111827] border border-white/5 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37] focus:ring-0 transition-colors"
          />
          <Search className="absolute left-3.5 top-3.5 text-white/30" size={14} />
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {logsFiltrados.length === 0 ? (
            <div className="p-12 text-center text-white/30 space-y-2">
              <Clock size={32} className="mx-auto text-white/10" />
              <p className="text-xs font-bold">Nenhum registro encontrado</p>
              {filtro && (
                <button
                  onClick={() => setFiltro('')}
                  className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 mx-auto"
                >
                  <RotateCcw size={10} /> Limpar busca
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/40 font-bold uppercase tracking-wider text-[0.6rem]">
                  <th className="px-6 py-4 w-48">Data / Hora</th>
                  <th className="px-6 py-4 w-64">Administrador</th>
                  <th className="px-6 py-4">Ação Executada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logsFiltrados.map((log) => {
                  const data = new Date(log.criado_em)
                  const dataFormatada = data.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                  const horaFormatada = data.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 text-white/70 font-mono">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-[#D4AF37]/50" />
                          <span>{dataFormatada} às {horaFormatada}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                            <User size={10} className="text-white/40" />
                          </div>
                          <span className="font-bold text-white/80 font-mono">{log.user_email || 'Sistema / API'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-bold leading-relaxed">{log.acao}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
