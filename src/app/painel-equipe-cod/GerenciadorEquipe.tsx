'use client'

import { useState, useTransition } from 'react'
import { Shield, UserPlus, Trash2, Loader2, Check, AlertCircle, Mail } from 'lucide-react'
import { promoverEmailParaAdmin, rebaixarAdminParaMembro } from './actions'

interface AdminMember {
  id: string
  email: string
  nome: string
  role: string
  criado_em: string
}

interface GerenciadorEquipeProps {
  admins: AdminMember[]
  currentUserEmail: string
}

export default function GerenciadorEquipe({ admins, currentUserEmail }: GerenciadorEquipeProps) {
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const handlePromover = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setErro(null)
    setSucesso(null)

    startTransition(async () => {
      const res = await promoverEmailParaAdmin(email)
      if (res.success) {
        setSucesso(`O usuário com e-mail ${email} foi promovido a Administrador com sucesso!`)
        setEmail('')
      } else {
        setErro(res.error || 'Erro ao promover usuário.')
      }
    })
  }

  const handleRebaixar = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza de que deseja rebaixar o administrador ${userEmail} para membro? ele perderá acesso a este painel.`)) {
      return
    }

    setErro(null)
    setSucesso(null)

    startTransition(async () => {
      const res = await rebaixarAdminParaMembro(userId)
      if (res.success) {
        setSucesso(`O administrador ${userEmail} foi rebaixado para membro com sucesso.`)
      } else {
        setErro(res.error || 'Erro ao rebaixar administrador.')
      }
    })
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Título & Descrição */}
      <div>
        <h3 className="text-white text-xl font-black tracking-tight flex items-center gap-2">
          <Shield className="text-[#D4AF37]" size={20} />
          Equipe de Administradores
        </h3>
        <p className="text-white/50 text-xs mt-1">
          Gerencie quem possui acesso administrativo completo ao painel do Contos de Oração.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Adicionar Admin */}
        <div className="lg:col-span-1 bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl h-fit">
          <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-[#D4AF37]" />
            Adicionar Novo Admin
          </h4>
          
          <form onSubmit={handlePromover} className="space-y-4">
            <div>
              <label className="text-[0.65rem] uppercase tracking-wider text-white/40 font-black block mb-1.5">
                E-mail do Usuário *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37] focus:ring-0 transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 text-white/30" size={14} />
              </div>
              <p className="text-white/30 text-[0.65rem] mt-2">
                O usuário já deve possuir um cadastro ativo na plataforma com este e-mail antes de ser promovido.
              </p>
            </div>

            {/* Status alerts */}
            {erro && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            {sucesso && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0" />
                <span>{sucesso}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-black disabled:opacity-60 transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Promover a Admin
                </>
              )}
            </button>
          </form>
        </div>

        {/* Segurança da Conta (2FA) */}
        <div className="space-y-6 lg:col-span-1 flex flex-col">
          <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl h-fit">
            <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Shield size={16} className="text-[#D4AF37]" />
              Segurança da Conta (2FA)
            </h4>
            <p className="text-white/40 text-[0.7rem] leading-relaxed mb-4">
              Proteja sua conta individual configurando a verificação em duas etapas via aplicativo autenticador (Google Authenticator).
            </p>
            <a
              href="/painel-equipe-cod/mfa"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-center text-[#D4AF37] hover:text-[#fff] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all no-underline block"
            >
              Configurar 2FA / Autenticador
            </a>
          </div>
        </div>

        {/* Lista de Admins Atuais */}
        <div className="lg:col-span-2 bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/5">
            <h4 className="text-white font-bold text-sm">Administradores Ativos</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/40 font-bold uppercase tracking-wider text-[0.6rem]">
                  <th className="px-6 py-4">Nome / Usuário</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Data de Cadastro</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {admins.map((admin) => {
                  const isCurrentUser = admin.email.toLowerCase() === currentUserEmail.toLowerCase()
                  const isSuperAdmin = admin.email.toLowerCase() === 'suporte.appcontos@gmail.com'

                  return (
                    <tr key={admin.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center font-black text-[0.7rem] text-[#D4AF37] border border-[#D4AF37]/20 uppercase">
                            {admin.nome.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{admin.nome}</span>
                            {isSuperAdmin && (
                              <span className="text-[0.6rem] text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded font-black uppercase mt-0.5 inline-block">
                                Dono / Geral
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70 font-mono">{admin.email}</td>
                      <td className="px-6 py-4 text-white/50">
                        {new Date(admin.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isCurrentUser ? (
                          <span className="text-white/30 text-[0.65rem] italic">Você (Logado)</span>
                        ) : isSuperAdmin ? (
                          <span className="text-[#D4AF37] text-[0.65rem] font-bold">Imutável</span>
                        ) : (
                          <button
                            onClick={() => handleRebaixar(admin.id, admin.email)}
                            disabled={isPending}
                            className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Rebaixar para Membro"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
