import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { senha, confirmar } = await request.json()

    if (!senha || senha.length < 6) {
      return NextResponse.json({ ok: false, error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
    }

    if (senha !== confirmar) {
      return NextResponse.json({ ok: false, error: 'As senhas não coincidem. Tente novamente.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('🔴 ERRO getUser na API de atualizar senha:', userError)
      return NextResponse.json({
        ok: false,
        error: 'Sessão de recuperação expirada ou inválida. Por favor, solicite a redefinição de senha novamente.'
      }, { status: 401 })
    }

    const { error } = await supabase.auth.updateUser({ password: senha })

    if (error) {
      console.error('🔴 ERRO updateUser:', error)
      let msg = 'Erro ao atualizar senha.'
      if (error.message.includes('same password') || error.message.includes('different')) {
        msg = 'A nova senha deve ser diferente da senha anterior.'
      } else if (error.message.includes('6 characters')) {
        msg = 'A senha deve ter pelo menos 6 caracteres.'
      } else if (error.message.includes('session')) {
        msg = 'Sessão expirada. Solicite a redefinição de senha novamente.'
      }
      return NextResponse.json({ ok: false, error: msg }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('🔴 Exceção na API de atualizar senha:', err)
    return NextResponse.json({ ok: false, error: 'Ocorreu um erro interno. Tente novamente.' }, { status: 500 })
  }
}
