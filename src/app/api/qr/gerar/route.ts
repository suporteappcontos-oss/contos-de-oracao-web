import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST() {
  try {
    const admin = getAdminClient()

    // Gera token único de 6 caracteres
    const token = Math.random().toString(36).substring(2, 8).toUpperCase()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutos

    // Salva no Supabase (tabela qr_sessions)
    const { error } = await admin.from('qr_sessions').insert({
      token,
      expires_at: expiresAt.toISOString(),
      usado: false,
      user_id: null,
    })

    if (error) {
      console.error('Erro ao criar QR session:', error.message)
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }

    return NextResponse.json({ token, expires_at: expiresAt.toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
