import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Lock, Download } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Material Catequese | Contos de Oração',
  description: 'Materiais exclusivos e Histórias em Quadrinhos para download.',
}

export default async function MaterialCatequesePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const etiqueta = (user.user_metadata?.etiqueta_plano || '').toLowerCase()
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'

  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  // Busca HQs do Supabase (apenas ativas)
  const { data: hqs } = await supabase
    .from('hqs')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

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
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-[#D4AF37]" size={22} />
            <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Exclusivo</span>
          </div>
          <h2 className="text-white text-3xl font-bold">Material de Catequese</h2>
          <p className="text-white/40 mt-2 text-sm">Histórias em Quadrinhos e materiais de apoio para download</p>
        </div>

        {/* Grid de HQs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {(hqs ?? []).map((item) => {
            const temAcessoLeitura = isAdmin || (item.planos_acesso && item.planos_acesso.some((p: string) => etiqueta.includes(p.toLowerCase()) || p.toLowerCase().includes(etiqueta)))
            const temAcessoPdf = isAdmin || (item.planos_pdf && item.planos_pdf.some((p: string) => etiqueta.includes(p.toLowerCase()) || p.toLowerCase().includes(etiqueta)))
            const pdfUrl = `https://contos-apks.b-cdn.net/hq/${item.slug}/pdf/${item.slug}.pdf`

            return (
              <div key={item.slug} className="group relative flex flex-col">
                <Link href={temAcessoLeitura ? `/hq/${item.slug}` : '/planos'} className="block">
                  {/* Capa */}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-xl transition-transform duration-300 group-hover:scale-105">
                    {item.capa_url ? (
                      <Image src={item.capa_url} alt={item.titulo} fill className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <BookOpen size={32} className="text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {!temAcessoLeitura && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-xl">
                        <Lock size={28} className="text-[#D4AF37]" />
                        <span className="text-white text-xs font-bold text-center px-3">Apenas planos Essencial e Pro</span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">
                        HQ • {item.total_paginas} pág.
                      </span>
                    </div>
                  </div>

                  {/* Título */}
                  <div className="mt-3 px-1">
                    <h3 className="text-white text-sm font-semibold leading-tight group-hover:text-[#D4AF37] transition-colors">
                      {item.titulo}
                    </h3>
                    {item.descricao && (
                      <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">{item.descricao}</p>
                    )}
                  </div>
                </Link>

              </div>
            )
          })}
        </div>

        {(!hqs || hqs.length === 0) && (
          <div className="text-center py-20 text-white/30">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhum material disponível no momento.</p>
          </div>
        )}
      </div>
    </main>
  )
}
