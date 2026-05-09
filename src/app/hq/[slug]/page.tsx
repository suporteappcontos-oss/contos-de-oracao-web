import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Metadata } from 'next'
import HQReaderClient from './HQReaderClient'

// ⚠️ ATENÇÃO: Quando adicionar novas HQs, cadastre aqui também!
const HQS: Record<string, {
  titulo: string
  totalPaginas: number
  planos: string[]
}> = {
  'nossa-senhora-fatima': {
    titulo: 'Nossa Senhora de Fátima',
    totalPaginas: 15,
    planos: ['Essencial', 'Pro', 'essencial', 'pro'],
  },
  // Adicione outras HQs aqui:
  // 'nome-da-hq': { titulo: '...', totalPaginas: X, planos: [...] },
}

const BUNNY_BASE = 'https://contos-apks.b-cdn.net/hq'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const hq = HQS[slug]
  if (!hq) return { title: 'HQ não encontrada' }
  return {
    title: `${hq.titulo} | HQ | Contos de Oração`,
    description: `Leia a HQ "${hq.titulo}" na plataforma Contos de Oração.`,
  }
}

export default async function HQPage({ params }: Props) {
  const { slug } = await params
  const hq = HQS[slug]
  if (!hq) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const etiqueta = user.user_metadata?.etiqueta_plano || ''
  const isAdmin = user.email === 'suporte.appcontos@gmail.com'

  // Sem plano → redireciona para expirado
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

  // Plano sem acesso à HQ → redireciona para planos
  const temAcesso = isAdmin || normalizedPlanosHq.includes(etiqueta.toLowerCase())
  if (!temAcesso) redirect('/planos')

  // Planos que podem baixar HQ
  const podeDownload = temAcesso

  return (
    <HQReaderClient
      slug={slug}
      titulo={hq.titulo}
      totalPaginas={hq.totalPaginas}
      baseUrl={`${BUNNY_BASE}/${slug}`}
      podeDownload={podeDownload}
    />
  )
}
