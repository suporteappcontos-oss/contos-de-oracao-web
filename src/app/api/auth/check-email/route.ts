import { NextRequest, NextResponse } from 'next/server'
import { buscarUsuarioPorEmail } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ existe: false })

    const existente = await buscarUsuarioPorEmail(email)
    return NextResponse.json({ existe: !!existente })
  } catch (error) {
    return NextResponse.json({ existe: false })
  }
}
