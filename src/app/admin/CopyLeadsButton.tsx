'use client'

import { Mail, Check, X, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyLeadsButton({ emails }: { emails: string[] }) {
  const [open, setOpen] = useState(false)
  const [cupom, setCupom] = useState('')
  const [copiedEmails, setCopiedEmails] = useState(false)
  const [copiedText, setCopiedText] = useState(false)

  const emailText = `Assunto: 🎁 Um presente especial para você!

Olá! Percebemos que você iniciou sua assinatura nos Contos de Oração mas não chegou a finalizar. Sabemos que o dia a dia é corrido!

Para te ajudar a dar o primeiro passo e ter acesso imediato a todo o nosso acervo de filmes, pregações e documentários exclusivos, preparamos algo super especial:

Use o cupom promocional abaixo e ganhe desconto na assinatura:
${cupom || '[DIGITE SEU CUPOM AQUI]'}

Clique no link abaixo para finalizar seu cadastro agora mesmo:
https://contosdeoracao.online/assinar

Te esperamos do outro lado,
Equipe Contos de Oração`

  return (
    <>
      <button 
        onClick={() => {
          if (emails.length === 0) return alert('Nenhum lead pendente encontrado.')
          setOpen(true)
        }}
        title="Abre a ferramenta de envio de promoções"
        className="flex items-center gap-2 bg-[#D4AF37] text-black hover:brightness-110 px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg"
      >
        <Mail size={16} strokeWidth={2.5} />
        {`Enviar Promoção (${emails.length} Leads)`}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#090B10]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                   <Mail size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-tight">Campanha de Recuperação</h3>
                  <p className="text-white/40 text-xs">A IA gerou um e-mail conversivo para você.</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Código do Cupom Ativo</label>
                <input 
                  type="text" 
                  value={cupom}
                  onChange={e => setCupom(e.target.value)}
                  placeholder="Ex: VOLTA20"
                  className="w-full bg-[#090B10] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-[#D4AF37] font-black placeholder-[#D4AF37]/20 focus:border-[#D4AF37] focus:outline-none uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">E-mail Sugerido (Copywriting Vendedor)</label>
                <textarea 
                  readOnly 
                  value={emailText}
                  rows={10}
                  className="w-full bg-[#090B10] border border-white/10 rounded-xl px-4 py-4 text-white/80 text-sm focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-[#090B10]/50 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(emails.join(', '))
                  setCopiedEmails(true)
                  setTimeout(() => setCopiedEmails(false), 2000)
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-all text-sm border border-white/10"
              >
                {copiedEmails ? <Check size={16}/> : <Copy size={16}/>}
                Copiar {emails.length} E-mails (Para o CCO)
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(emailText)
                  setCopiedText(true)
                  setTimeout(() => setCopiedText(false), 2000)
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:brightness-110 text-black py-3 rounded-xl font-black transition-all text-sm"
              >
                {copiedText ? <Check size={16}/> : <Copy size={16}/>}
                Copiar Texto da Mensagem
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
