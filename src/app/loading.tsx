import { Infinity as InfinityIcon } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090B10] text-white">
      <InfinityIcon className="animate-pulse text-[#D4AF37] mb-4" size={64} style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.5))' }} />
      <h2 className="text-xl font-bold font-outfit tracking-wide">Carregando Contos de Oração...</h2>
      <p className="text-[#8197a4] text-sm mt-2">Preparando sua experiência premium</p>
    </div>
  )
}
