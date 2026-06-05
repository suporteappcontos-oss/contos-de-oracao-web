'use client'

import { useState } from 'react'
import { criarUsuarioVitalicio } from './actions'
import { Plus, Check, Copy, AlertTriangle } from 'lucide-react'

const inputCls = 'w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm'
const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold'

export function FormAcessoVitalicio() {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{
    nome: string
    email: string
    senhaGerada: string
    plano: string
  } | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErro(null)
    setResultado(null)
    setCopiado(false)

    const formElement = e.currentTarget
    const formData = new FormData(formElement)
    try {
      const res = await criarUsuarioVitalicio(formData)
      if (res && 'error' in res && res.error) {
        setErro(res.error)
      } else if (res && 'success' in res && res.success) {
        setResultado({
          nome: res.nome || '',
          email: res.email || '',
          senhaGerada: res.senhaGerada || '',
          plano: res.plano || ''
        })
        formElement.reset()
      } else {
        setErro('Erro desconhecido ao criar usuário.')
      }
    } catch (err: any) {
      setErro(err.message || 'Ocorreu um erro no processamento.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!resultado) return
    const texto = `✨ *Seu Acesso Vitalício - Contos de Oração* ✨\n\nOlá, *${resultado.nome}*!\nSeu acesso infinito à plataforma foi liberado. Aqui estão seus dados de acesso:\n\n📧 *E-mail:* ${resultado.email}\n🔑 *Senha Temporária:* ${resultado.senhaGerada}\n💎 *Plano:* ${resultado.plano}\n\n*Acesse agora:* https://contosdeoracao.com.br/login\n\n_Você poderá redefinir sua senha a qualquer momento acessando a página "Esqueci a Senha" ou no seu painel de perfil._`
    
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <Plus size={20} className="text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-white text-lg font-extrabold tracking-tight">Liberar Acesso Vitalício (Cliente)</h2>
            <p className="text-white/40 text-xs">Cria uma conta de cliente com acesso vitalício ilimitado. A senha será gerada aleatoriamente.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelCls}>Nome Completo *</label>
              <input type="text" name="nome" required placeholder="Ex: João Silva" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Endereço de E-mail *</label>
              <input type="email" name="email" required placeholder="Ex: cliente@email.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Plano Vitalício *</label>
              <select name="plano" defaultValue="Individual" className={inputCls}>
                <option value="Individual" className="bg-[#090B10]">Individual (1 Tela)</option>
                <option value="Família" className="bg-[#090B10]">Família (5 Telas)</option>
              </select>
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs">
              <AlertTriangle size={16} />
              <span>{erro}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 text-black px-6 py-3 rounded-xl font-black text-xs tracking-wider uppercase transition-all hover:scale-105 hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}
            >
              {loading ? 'Processando...' : 'Cadastrar Vitalício'}
            </button>
          </div>
        </form>
      </div>

      {resultado && (
        <div className="bg-[#111827] border border-[#D4AF37]/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37] to-transparent opacity-5 rounded-bl-full" />
          
          <h3 className="text-white font-extrabold text-base flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            Usuário Vitalício Criado com Sucesso!
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5 bg-[#090B10]/40 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-white/40 block mb-1">NOME DO CLIENTE</span>
              <span className="text-white font-bold">{resultado.nome}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-1">PLANO ATRIBUÍDO</span>
              <span className="text-white font-bold text-[#D4AF37] uppercase">{resultado.plano}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-1">EMAIL DE ACESSO</span>
              <span className="text-white font-bold font-mono">{resultado.email}</span>
            </div>
            <div>
              <span className="text-white/40 block mb-1">SENHA GERADA (PRIMEIRO ACESSO)</span>
              <span className="text-[#10b981] font-black font-mono text-sm tracking-widest">{resultado.senhaGerada}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <span className="text-white/40 text-[0.7rem] text-center sm:text-left">
              ⚠️ Copie e envie esses dados para o cliente. A senha não poderá ser visualizada novamente.
            </span>
            <button
              onClick={handleCopy}
              className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${copiado ? 'bg-[#10b981] text-black' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}
            >
              {copiado ? (
                <>
                  <Check size={14} /> Copiado!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copiar Acesso (WhatsApp)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
