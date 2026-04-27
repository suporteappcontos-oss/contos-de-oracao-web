'use client'

import { Mail, Send, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function CopyLeadsButton({ emails }: { emails: string[] }) {
  const [open, setOpen] = useState(false)
  const [cupom, setCupom] = useState('')
  const [assunto, setAssunto] = useState('🎁 Um presente especial para você!')
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMensagem(`Olá! Percebemos que você iniciou sua assinatura nos Contos de Oração mas não chegou a finalizar. Sabemos que o dia a dia é corrido!\n\nPara te ajudar a dar o primeiro passo e ter acesso imediato a todo o nosso acervo de filmes, pregações e documentários exclusivos, preparamos algo super especial:\n\nUse o cupom promocional abaixo e ganhe desconto na assinatura:\n[CUPOM]\n\nClique no link abaixo para finalizar seu cadastro agora mesmo:\nhttps://contosdeoracao.online/assinar\n\nTe esperamos do outro lado,\nEquipe Contos de Oração`)
  }, [])

  // Troca a tag [CUPOM] pelo cupom real que o usuário digitou
  const textoFinal = mensagem.replace('[CUPOM]', cupom || '[DIGITE O CUPOM ACIMA]')

  const enviarEmails = async () => {
    if (!confirm(`Você tem certeza que deseja disparar este e-mail agora para ${emails.length} pessoas?`)) return;
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enviar-promocao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails,
          assunto,
          mensagem: textoFinal
        })
      })
      const data = await res.json()
      
      if (data.error) {
        alert('ERRO: ' + data.error)
      } else {
        alert('✅ Campanha disparada com sucesso via Resend para ' + emails.length + ' leads!')
        setOpen(false)
      }
    } catch (e: any) {
      alert('Erro na conexão: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => {
          if (emails.length === 0) return alert('Nenhum lead pendente encontrado.')
          setOpen(true)
        }}
        title="Enviar e-mail para recuperar os leads"
        className="flex items-center gap-2 bg-[#D4AF37] text-black hover:brightness-110 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg"
      >
        <Mail size={16} strokeWidth={2.5} />
        {`Disparar E-mail (${emails.length} Leads)`}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#090B10]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                   <Send size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-tight">Disparar Campanha</h3>
                  <p className="text-white/40 text-xs">O e-mail será enviado via Resend para {emails.length} leads.</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} disabled={loading} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Assunto do E-mail</label>
                  <input 
                    type="text" 
                    value={assunto}
                    onChange={e => setAssunto(e.target.value)}
                    className="w-full bg-[#090B10] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#D4AF37] text-[0.7rem] uppercase tracking-widest mb-2 font-black">Código do Cupom Ativo</label>
                  <input 
                    type="text" 
                    value={cupom}
                    onChange={e => setCupom(e.target.value)}
                    placeholder="Ex: VOLTA20"
                    className="w-full bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#D4AF37] font-black placeholder-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none uppercase tracking-wider text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Corpo do E-mail (Editável)</label>
                <textarea 
                  value={mensagem}
                  onChange={e => setMensagem(e.target.value)}
                  rows={8}
                  className="w-full bg-[#090B10] border border-white/10 rounded-xl px-4 py-4 text-white/80 text-sm focus:border-[#D4AF37] focus:outline-none resize-none leading-relaxed"
                />
                <p className="text-white/30 text-[0.65rem] mt-2">Dica: Deixe a tag [CUPOM] no texto, ela será substituída automaticamente pelo cupom que você digitar lá em cima!</p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="block text-white/30 text-[0.65rem] uppercase tracking-widest mb-2 font-bold">Pré-visualização de como o cliente vai ler:</label>
                <div className="text-white/90 text-sm whitespace-pre-wrap font-mono leading-relaxed opacity-70">
                  {textoFinal}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/5 bg-[#090B10]/50 flex justify-end">
              <button 
                onClick={enviarEmails}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] hover:brightness-110 text-black px-8 py-3.5 rounded-xl font-black transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                {loading ? 'Enviando pela Resend...' : <><Send size={18} strokeWidth={3}/> Enviar E-mail Agora</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
