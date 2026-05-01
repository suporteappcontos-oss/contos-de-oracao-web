'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Infinity as InfinityIcon } from 'lucide-react'

function GlobalLoaderInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Sempre que a rota muda, o loading deve parar
    setLoading(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (target?.href) {
        const url = new URL(target.href)
        // Se for navegação para outra página interna do mesmo domínio (e não hash/ancora)
        if (
          url.origin === window.location.origin && 
          url.pathname !== window.location.pathname &&
          !target.target // Ignora links _blank
        ) {
          setLoading(true)
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090B10]/80 backdrop-blur-sm transition-all duration-300">
      <InfinityIcon className="animate-spin text-[#D4AF37] mb-2" size={48} style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.5))' }} />
      <h2 className="text-white font-bold text-xl tracking-wider font-outfit">Carregando...</h2>
    </div>
  )
}

export default function GlobalLoader() {
  return (
    <Suspense fallback={null}>
      <GlobalLoaderInner />
    </Suspense>
  )
}
