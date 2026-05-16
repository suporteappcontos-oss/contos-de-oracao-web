import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: string[] = []

  // Corrigir Vídeos
  const { data: videos } = await supabase.from('videos').select('*')
  for (const v of videos || []) {
    if (v.thumbnail_url && v.thumbnail_url.includes('contos-apks')) {
      const novaUrl = v.thumbnail_url.replace('contos-apks', 'contos-midia-app')
      await supabase.from('videos').update({ thumbnail_url: novaUrl }).eq('id', v.id)
      results.push(`Vídeo atualizado: ${v.titulo}`)
    }
  }

  // Corrigir Materiais (Capa e Arquivo)
  const { data: materiais } = await supabase.from('materiais').select('*')
  for (const m of materiais || []) {
    let mudou = false
    const payload: any = {}
    
    if (m.capa_url && m.capa_url.includes('contos-apks')) {
      payload.capa_url = m.capa_url.replace('contos-apks', 'contos-midia-app')
      mudou = true
    }
    if (m.arquivo_url && m.arquivo_url.includes('contos-apks')) {
      payload.arquivo_url = m.arquivo_url.replace('contos-apks', 'contos-midia-app')
      mudou = true
    }

    if (mudou) {
      await supabase.from('materiais').update(payload).eq('id', m.id)
      results.push(`Material atualizado: ${m.titulo}`)
    }
  }

  // Corrigir Configurações no App (Não no DB, mas no config.json) - Isso já fizemos!
  
  return NextResponse.json({ success: true, updated: results })
}
