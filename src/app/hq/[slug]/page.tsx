import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Metadata } from 'next'
import HQReaderClient from './HQReaderClient'

const BUNNY_BASE = 'https://contos-midia-app.b-cdn.net/hq'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: hq } = await supabase.from('hqs').select('titulo').eq('slug', slug).single()
  if (!hq) return { title: 'HQ não encontrada' }
  return {
    title: `${hq.titulo} | HQ | Contos de Oração`,
    description: `Leia a HQ "${hq.titulo}" na plataforma Contos de Oração.`,
  }
}

export default async function HQPage({ params }: Props) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca dados da HQ no Supabase
  const { data: hq } = await supabase.from('hqs').select('*').eq('slug', slug).eq('ativo', true).single()
  if (!hq) notFound()

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const etiqueta = (user.user_metadata?.etiqueta_plano || '').toLowerCase()
  const isAdmin = user.email === 'suporte.appcontos@gmail.com'

  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  // Verifica acesso à leitura
  const temAcesso = isAdmin || (hq.planos_acesso && hq.planos_acesso.some((p: string) => etiqueta.includes(p.toLowerCase()) || p.toLowerCase().includes(etiqueta)))
  if (!temAcesso) redirect('/planos')

  // Verifica acesso ao PDF
  const podeBaixarPdf = isAdmin || (hq.planos_pdf && hq.planos_pdf.some((p: string) => etiqueta.includes(p.toLowerCase()) || p.toLowerCase().includes(etiqueta)))
  const pdfUrl = hq.tem_pdf
    ? (hq.link_pdf || `https://contos-midia-app.b-cdn.net/hq/${slug}/pdf/${slug}.pdf`)
    : null

  return (
    <HQReaderClient
      slug={slug}
      titulo={hq.titulo}
      totalPaginas={hq.total_paginas}
      baseUrl={`${BUNNY_BASE}/${slug}`}
      podeDownload={podeBaixarPdf}
      pdfUrl={podeBaixarPdf ? pdfUrl : null}
    />
  )
}
