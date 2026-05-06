'use client'

import { useFormStatus } from 'react-dom'
import { Infinity as InfinityIcon } from 'lucide-react'

export default function SubmitButton({ 
  children, 
  formAction,
  textLoading = "Carregando..."
}: { 
  children: React.ReactNode
  formAction?: (payload: FormData) => void
  textLoading?: string
  className?: string
  style?: React.CSSProperties
}) {
  const { pending } = useFormStatus()

  return (
    <button 
      formAction={formAction}
      disabled={pending}
      className={className || "w-full mt-3 py-4 font-extrabold rounded-xl text-base transition-all hover:brightness-110 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"}
      style={style || { background: '#D4AF37', color: '#090B10', fontFamily: 'Outfit, sans-serif' }}
    >
      {pending ? (
        <><InfinityIcon className="animate-spin" size={18} /> {textLoading}</>
      ) : (
        children
      )}
    </button>
  )
}
