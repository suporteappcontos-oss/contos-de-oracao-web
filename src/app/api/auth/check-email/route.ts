import { NextRequest, NextResponse } from 'next/server'
import { buscarUsuarioPorEmail } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ existe: false, planoAtivo: false })

    const existente = await buscarUsuarioPorEmail(email)
    if (!existente) return NextResponse.json({ existe: false, planoAtivo: false })

    const planoAtivo = existente.user_metadata?.plano_ativo === true
    return NextResponse.json({ existe: true, planoAtivo })
  } catch (error) {
    return NextResponse.json({ existe: false, planoAtivo: false })
  }
}
