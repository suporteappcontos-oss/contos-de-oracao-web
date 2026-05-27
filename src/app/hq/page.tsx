import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Lock } from 'lucide-react'
import { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Histórias em Quadrinhos | Contos de Oração',
  description: 'Leia as HQs exclusivas da maior plataforma católica do Brasil.',
}

// Lista de HQs disponíveis — adicione novas aqui conforme forem sendo criadas
const HQS = [
  {
    slug: 'nossa-senhora-fatima',
    titulo: 'Nossa Senhora de Fátima',
    descricao: 'A história das aparições de Nossa Senhora às três pastorinhas em Fátima, Portugal.',
    capa: 'https://contos-midia-app.b-cdn.net/hq/nossa-senhora-fatima/HQ_01.png',
    totalPaginas: 15,
    planos: ['Essencial', 'Pro', 'essencial', 'pro'], // planos com acesso
  },
]

export default async function HQListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const etiqueta = user.user_metadata?.etiqueta_plano || ''
  const isAdmin = user.email === 'suporte.appcontos@gmail.com'

  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  return (
    <main className="min-h-screen" style={{ background: '#090B10' }}>
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link href="/watch" className="text-white/40 hover:text-white/70 transition-colors text-sm">
          ← Voltar
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <h1 className="text-white/80 text-sm font-semibold">Histórias em Quadrinhos</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Título da seção */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-[#D4AF37]" size={22} />
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">HQs Católicas</span>
          </div>
          <h2 className="text-white text-3xl font-bold">Histórias em Quadrinhos</h2>
          <p className="text-white/40 mt-2 text-sm">Histórias da fé ilustradas para toda a família</p>
        </div>

        {/* Grid de HQs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {HQS.map((hq) => {
            const temAcesso = isAdmin || hq.planos.includes(etiqueta)
            return (
              <div key={hq.slug} className="group relative">
                <Link
                  href={temAcesso ? `/hq/${hq.slug}` : '/planos'}
                  className="block"
                >
                  {/* Capa */}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-xl transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={hq.capa}
                      alt={hq.titulo}
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
                          Faça upgrade para acessar
                        </span>
                      </div>
                    )}

                    {/* Info na parte de baixo */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">
                        {hq.totalPaginas} páginas
                      </span>
                    </div>
                  </div>

                  {/* Título */}
                  <div className="mt-3 px-1">
                    <h3 className="text-white text-sm font-semibold leading-tight group-hover:text-[#D4AF37] transition-colors">
                      {hq.titulo}
                    </h3>
                    <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">
                      {hq.descricao}
                    </p>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {HQS.length === 0 && (
          <div className="text-center py-20 text-white/30">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhuma HQ disponível no momento.</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
