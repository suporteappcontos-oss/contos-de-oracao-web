import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// App chama essa rota para confirmar o QR após escanear
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 })

    // Pega o usuário logado no app (via cookie/bearer)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = getAdminClient()

    // Busca a sessão
    const { data: session, error: sessionError } = await admin
      .from('qr_sessions')
      .select('*')
      .eq('token', token.toUpperCase())
      .eq('usado', false)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Token inválido ou já utilizado' }, { status: 404 })
    }

    // Verifica expiração
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'QR Code expirado. Gere um novo.' }, { status: 410 })
    }

    // Marca como usado e vincula o user_id
    await admin.from('qr_sessions').update({
      usado: true,
      user_id: user.id,
      confirmed_at: new Date().toISOString(),
    }).eq('token', token.toUpperCase())

    return NextResponse.json({ ok: true, email: user.email })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
