'use client'

import { useState, useTransition } from 'react'
import { Shield, UserPlus, Trash2, Loader2, Check, AlertCircle, Mail, KeyRound, Sparkles } from 'lucide-react'
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
    if (!confirm(`Tem certeza de que deseja rebaixar o administrador ${userEmail} para membro? Ele perderá acesso a este painel.`)) {
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
    <div className="space-y-10 animate-fadeIn" style={{ fontFamily: 'Outfit, sans-serif' }}>
      
      {/* ── SEÇÃO DE CABEÇALHO ASSIMÉTRICO ── */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/5 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-gradient-to-br from-[#111827]/80 to-[#0b0f19]/90 backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#D4AF37]/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <Shield size={12} /> Painel de Controle de Acesso
            </div>
            <h3 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-none">
              Gestão de Equipe e Credenciais
            </h3>
            <p className="text-white/50 text-xs md:text-sm max-w-xl">
              Gerencie privilégios administrativos e configure autenticação de dois fatores para os administradores ativos.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:self-center self-start">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="text-white/40 text-[0.55rem] font-bold uppercase tracking-wider">Status de Segurança</div>
              <div className="text-white text-xs font-black">2FA Pronto e Ativo</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── COLUNA DA ESQUERDA (CONFIGURAÇÕES E CADASTRO) ── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Promover Novo Admin */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/5 p-6 shadow-[0_15px_30px_rgba(0,0,0,0.4)] bg-gradient-to-b from-[#111827]/80 to-[#111827]/40 backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-[40px] rounded-full pointer-events-none" />
            
            <h4 className="text-white font-black text-sm mb-1.5 flex items-center gap-2">
              <UserPlus size={16} className="text-[#D4AF37]" />
              Novo Administrador
            </h4>
            <p className="text-white/40 text-[0.65rem] leading-relaxed mb-6">
              Promova um usuário cadastrado inserindo o e-mail abaixo.
            </p>
            
            <form onSubmit={handlePromover} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[0.55rem] uppercase tracking-widest text-white/50 font-black block">
                  E-mail do Usuário *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@gmail.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-mono"
                  />
                  <Mail className="absolute left-3.5 top-3.5 text-white/30" size={14} />
                </div>
                <p className="text-white/30 text-[0.6rem] leading-normal pt-1">
                  Aviso: O usuário já precisa ter uma conta normal ativa no site com este e-mail.
                </p>
              </div>

              {/* Status alerts */}
              {erro && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{erro}</span>
                </div>
              )}

              {sucesso && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                  <Check size={14} className="mt-0.5 shrink-0" />
                  <span>{sucesso}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-black disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4AF37]/10"
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
                    Promover a Administrador
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card: Segurança 2FA */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/5 p-6 shadow-[0_15px_30px_rgba(0,0,0,0.4)] bg-gradient-to-b from-[#111827]/80 to-[#111827]/40 backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-[40px] rounded-full pointer-events-none" />
            
            <h4 className="text-white font-black text-sm mb-1.5 flex items-center gap-2">
              <KeyRound size={16} className="text-[#D4AF37]" />
              Segurança Extra (2FA)
            </h4>
            <p className="text-white/40 text-[0.65rem] leading-relaxed mb-6">
              Cada administrador deve ativar a autenticação de dois fatores no seu próprio celular.
            </p>
            
            <a
              href="/painel-equipe-cod/mfa"
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black text-center text-[#D4AF37] hover:text-white bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all no-underline block"
            >
              Configurar 2FA / Autenticador
            </a>
          </div>

        </div>

        {/* ── COLUNA DA DIREITA (TABELA E LISTA DE USUÁRIOS) ── */}
        <div className="lg:col-span-8">
          
          <div className="relative overflow-hidden rounded-[2rem] border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-gradient-to-br from-[#111827]/80 to-[#0b0f19]/90 backdrop-blur-xl">
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-white font-black text-sm">Administradores Ativos</h4>
                <p className="text-white/30 text-[0.65rem] mt-0.5">Total de {admins.length} administradores com acesso ao painel.</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 font-bold uppercase tracking-wider text-[0.6rem]">
                    <th className="px-8 py-4">Nome / Usuário</th>
                    <th className="px-8 py-4">E-mail</th>
                    <th className="px-8 py-4">Data de Cadastro</th>
                    <th className="px-8 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {admins.map((admin) => {
                    const isCurrentUser = admin.email.toLowerCase() === currentUserEmail.toLowerCase()
                    const isSuperAdmin = admin.email.toLowerCase() === 'suporte.appcontos@gmail.com'

                    return (
                      <tr key={admin.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/5 to-white/0 border border-[#D4AF37]/20 flex items-center justify-center font-black text-[0.75rem] text-[#D4AF37] uppercase">
                              {admin.nome.substring(0, 2)}
                            </div>
                            <div>
                              <span className="font-bold text-white block text-xs">{admin.nome}</span>
                              {isSuperAdmin && (
                                <span className="text-[0.55rem] text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded-md font-black uppercase mt-0.5 inline-block border border-[#D4AF37]/10">
                                  Dono / Geral
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-white/70 font-mono text-[0.7rem] selection:bg-[#D4AF37]/20">{admin.email}</td>
                        <td className="px-8 py-5 text-white/50 text-[0.7rem]">
                          {new Date(admin.criado_em).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-8 py-5 text-right">
                          {isCurrentUser ? (
                            <span className="text-white/30 text-[0.65rem] italic bg-white/5 px-2 py-1 rounded-md">Você (Logado)</span>
                          ) : isSuperAdmin ? (
                            <span className="text-[#D4AF37] text-[0.65rem] font-bold bg-[#D4AF37]/5 px-2 py-1 rounded-md border border-[#D4AF37]/10">Imutável</span>
                          ) : (
                            <button
                              onClick={() => handleRebaixar(admin.id, admin.email)}
                              disabled={isPending}
                              className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
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

    </div>
  )
}
