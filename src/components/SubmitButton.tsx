'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export default function SubmitButton({ 
  children, 
  formAction 
}: { 
  children: React.ReactNode
  formAction?: (payload: FormData) => void
}) {
  const { pending } = useFormStatus()

  return (
    <button 
      formAction={formAction}
      disabled={pending}
      className="w-full mt-3 py-4 font-extrabold rounded-xl text-base transition-all hover:brightness-110 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      style={{ background: '#D4AF37', color: '#090B10', fontFamily: 'Outfit, sans-serif' }}
    >
      {pending ? (
        <><Loader2 className="animate-spin" size={18} /> Entrando...</>
      ) : (
        children
      )}
    </button>
  )
}
