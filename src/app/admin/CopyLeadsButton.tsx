'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function CopyLeadsButton({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (emails.length === 0) return alert('Nenhum lead pendente encontrado.')
    navigator.clipboard.writeText(emails.join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button 
      onClick={handleCopy}
      title="Copia todos os e-mails de clientes que não finalizaram o pagamento"
      className="flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'E-mails Copiados!' : `Copiar E-mails de Marketing (${emails.length} Leads)`}
    </button>
  )
}
