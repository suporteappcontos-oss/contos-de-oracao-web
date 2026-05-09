import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Lock } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Material Catequese | Contos de Oração',
  description: 'Materiais exclusivos e Histórias em Quadrinhos para download.',
}

// Lista de materiais disponíveis
const MATERIAIS = [
  {
    slug: 'nossa-senhora-fatima',
    titulo: 'Nossa Senhora de Fátima',
    descricao: 'A história das aparições de Nossa Senhora às três pastorinhas em Fátima, Portugal.',
    capa: 'https://contos-apks.b-cdn.net/hq/nossa-senhora-fatima/HQ_01.png',
    tipo: 'História em Quadrinhos',
    totalPaginas: 15,
    planos: ['Essencial', 'Pro', 'essencial', 'pro'], // Apenas estes planos têm acesso (exclui o 'básico')
  },
]

export default async function MaterialCatequesePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const etiqueta = user.user_metadata?.etiqueta_plano || ''
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'

  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  let planosHq = ['Essencial', 'Pro']
  try {
    const res = await fetch(`https://contos-apks.b-cdn.net/config.json?t=${Date.now()}`, { cache: 'no-store' })
    if (res.ok) {
      const config = await res.json()
      if (config.planos_hq) planosHq = config.planos_hq
    }
  } catch (e) {}

  const normalizedPlanosHq = planosHq.map(p => p.toLowerCase())

  return (
    <main className="min-h-screen" style={{ background: '#090B10' }}>
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link href="/watch" className="text-white/40 hover:text-white/70 transition-colors text-sm">
          ← Voltar
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <h1 className="text-white/80 text-sm font-semibold">Material Catequese</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Título da seção */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-[#D4AF37]" size={22} />
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Exclusivo</span>
          </div>
          <h2 className="text-white text-3xl font-bold">Material de Catequese</h2>
          <p className="text-white/40 mt-2 text-sm">Histórias em Quadrinhos e materiais de apoio para download</p>
        </div>

        {/* Grid de Materiais */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {MATERIAIS.map((item) => {
            const temAcesso = isAdmin || normalizedPlanosHq.includes(etiqueta.toLowerCase())
            return (
              <div key={item.slug} className="group relative">
                <Link
                  href={temAcesso ? `/hq/${item.slug}` : '/planos'}
                  className="block"
                >
                  {/* Capa */}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-xl transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={item.capa}
                      alt={item.titulo}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Badge de acesso */}
                    {!temAcesso && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-xl">
                        <Lock size={28} className="text-[#D4AF37]" />
                        <span className="text-white text-xs font-bold text-center px-3">
                          Apenas planos Essencial e Pro
                        </span>
                      </div>
                    )}

                    {/* Info na parte de baixo */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">
                        {item.tipo} • {item.totalPaginas} pág.
                      </span>
                    </div>
                  </div>

                  {/* Título */}
                  <div className="mt-3 px-1">
                    <h3 className="text-white text-sm font-semibold leading-tight group-hover:text-[#D4AF37] transition-colors">
                      {item.titulo}
                    </h3>
                    <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">
                      {item.descricao}
                    </p>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {MATERIAIS.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhum material disponível no momento.</p>
          </div>
        )}
      </div>
    </main>
  )
}
