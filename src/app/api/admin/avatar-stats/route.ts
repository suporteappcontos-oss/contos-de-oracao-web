import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') {
    return null
  }
  return supabase
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await verificarAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('perfis')
      .select('avatar_url')
      .not('avatar_url', 'is', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Agrupa e conta a ocorrência de cada avatar_url
    const stats: Record<string, number> = {}
    data.forEach((p: { avatar_url: string }) => {
      if (p.avatar_url) {
        stats[p.avatar_url] = (stats[p.avatar_url] || 0) + 1
      }
    })

    return NextResponse.json({ stats })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
