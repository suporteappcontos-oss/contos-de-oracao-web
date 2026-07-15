import { NextRequest, NextResponse } from 'next/server'
import { buscarUsuarioPorEmail } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    // Autenticação de segurança
    const authHeader = request.headers.get('Authorization') || request.headers.get('apikey')
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceRoleKey || !authHeader) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }
    
    const keyToCheck = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader
    
    if (keyToCheck !== serviceRoleKey) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }
    
    if (!email || email.trim() === '') {
      return NextResponse.json({ 
        encontrado: false, 
        mensagem: 'E-mail não fornecido.' 
      })
    }
    
    const cleanEmail = email.trim().toLowerCase()
    const usuario = await buscarUsuarioPorEmail(cleanEmail)
    
    if (!usuario) {
      return NextResponse.json({ 
        encontrado: false, 
        mensagem: 'Nenhuma conta cadastrada com esse e-mail.' 
      })
    }
    
    const metadata = usuario.user_metadata || {}
    const planoAtivo = metadata.plano_ativo === true
    const nome = metadata.nome || 'Cliente'
    const etiquetaPlano = metadata.etiqueta_plano || 'Plano Básico'
    
    return NextResponse.json({
      encontrado: true,
      nome,
      email: usuario.email,
      plano_ativo: planoAtivo,
      etiqueta_plano: etiquetaPlano,
      criado_em: usuario.created_at
    })
  } catch (error: any) {
    console.error('Erro na API de consulta de assinante:', error.message)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
