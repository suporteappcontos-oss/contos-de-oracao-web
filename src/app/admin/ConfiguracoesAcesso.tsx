'use client'

import React, { useState, useTransition } from 'react'
import { Smartphone, BookOpen, ShieldCheck, Save, Loader2 } from 'lucide-react'
import { salvarPermissoesPlanos } from './actions'
import { useRouter } from 'next/navigation'

export function ConfiguracoesAcesso({ initialConfig }: { initialConfig: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const planosDisponiveis = ['Básico', 'Essencial', 'Pro']
  
  const [planosApp, setPlanosApp] = useState<string[]>(initialConfig?.planos_app || ['Essencial', 'Pro'])
  const [planosHq, setPlanosHq] = useState<string[]>(initialConfig?.planos_hq || ['Essencial', 'Pro'])
  const [mensagem, setMensagem] = useState('')

  const togglePlanoApp = (plano: string) => {
    if (plano === 'Básico') return // Básico não pode ser desmarcado visualmente para o app, mas ele cai na regra de restrição
    if (planosApp.includes(plano)) {
      setPlanosApp(planosApp.filter(p => p !== plano))
    } else {
      setPlanosApp([...planosApp, plano])
    }
  }

  const togglePlanoHq = (plano: string) => {
    if (planosHq.includes(plano)) {
      setPlanosHq(planosHq.filter(p => p !== plano))
    } else {
      setPlanosHq([...planosHq, plano])
    }
  }

  const handleSalvar = () => {
    startTransition(async () => {
      const res = await salvarPermissoesPlanos(planosApp, planosHq)
      if (res.success) {
        setMensagem('Configurações salvas com sucesso!')
        setTimeout(() => setMensagem(''), 3000)
        router.refresh()
      } else {
        setMensagem('Erro ao salvar as configurações.')
      }
    })
  }

  return (
    <div className="space-y-8 max-w-3xl" aria-label="Configurações de Acesso">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-black mb-1">Controle de Acessos Dinâmico</h2>
          <p className="text-white/40 text-sm">Selecione quais planos têm acesso a cada recurso. As alterações refletem no App e na Web imediatamente.</p>
        </div>
        <button 
          onClick={handleSalvar}
          disabled={isPending}
          className="flex items-center gap-2 bg-[#D4AF37] hover:brightness-110 text-black px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar Configurações
        </button>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-xl text-sm font-bold border ${mensagem.includes('Erro') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
          {mensagem}
        </div>
      )}

      {/* Card: Acesso ao App */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #1a6dff, #4d9fff)' }}>
            <Smartphone size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-black text-base">Acesso Completo ao Aplicativo</h3>
            <p className="text-white/40 text-xs">Planos marcados têm acesso a todos os vídeos. Os não marcados acessam apenas o Perfil.</p>
          </div>
        </div>
        <div className="space-y-3">
          {planosDisponiveis.map(plano => {
            const isChecked = plano === 'Básico' ? false : planosApp.includes(plano) // Básico sempre falso no toggle real de conteúdo, mas visualmente ele tem a menção de restrito
            const isBasico = plano === 'Básico'
            return (
              <div key={plano} 
                   onClick={() => !isBasico && togglePlanoApp(plano)}
                   className={`flex items-center justify-between p-3 rounded-xl border transition-all ${!isBasico ? 'cursor-pointer hover:bg-white/5' : 'opacity-70'} ${isChecked ? 'bg-white/5 border-[#D4AF37]/30' : 'bg-white/2 border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${isBasico ? 'bg-white/10 text-white/50' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>{plano}</span>
                  <span className="text-white/50 text-xs">{isBasico ? 'Acesso restrito (somente perfil)' : 'Acesso total aos conteúdos do App'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-5 rounded-full flex items-center transition-all ${ isChecked ? 'bg-[#D4AF37]' : 'bg-white/10'}`}
                    style={{ justifyContent: isChecked ? 'flex-end' : 'flex-start', padding: '2px' }}>
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 p-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5">
          <p className="text-[#D4AF37] text-xs font-semibold">ℹ️ Os usuários sem plano ativo ou com plano Básico só conseguem acessar a tela de Perfil e Planos no App Mobile.</p>
        </div>
      </div>

      {/* Card: Download de HQs */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D67B)' }}>
            <BookOpen size={20} className="text-black" />
          </div>
          <div>
            <h3 className="text-white font-black text-base">Material didático e HQs</h3>
            <p className="text-white/40 text-xs">Planos que podem acessar e baixar os materiais exclusivos na plataforma Web</p>
          </div>
        </div>
        <div className="space-y-3">
          {planosDisponiveis.map(plano => {
            const isChecked = planosHq.includes(plano)
            return (
              <div key={plano} 
                   onClick={() => togglePlanoHq(plano)}
                   className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-white/5 transition-all ${isChecked ? 'bg-white/5 border-[#D4AF37]/30' : 'bg-white/2 border-white/5'}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]`}>{plano}</span>
                  <span className="text-white/50 text-xs">{isChecked ? 'Liberado para este plano' : 'Bloqueado para este plano'}</span>
                </div>
                <div className={`w-10 h-5 rounded-full flex items-center transition-all ${ isChecked ? 'bg-[#D4AF37]' : 'bg-white/10'}`}
                  style={{ justifyContent: isChecked ? 'flex-end' : 'flex-start', padding: '2px' }}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
