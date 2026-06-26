import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('avatars_santos')
      .select('id, nome, avatar_url')
      .order('nome', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ avatars: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno ao buscar avatares' }, { status: 500 })
  }
}
