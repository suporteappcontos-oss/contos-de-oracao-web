import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
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
    
    const { data: faqs, error } = await supabaseAdmin
      .from('ia_base_conhecimento')
      .select('categoria, pergunta, conteudo')
      .eq('ativo', true)
      .order('criado_em', { ascending: false })
      
    if (error) throw error
    
    return NextResponse.json({ faqs: faqs ?? [] })
  } catch (error: any) {
    console.error('Erro na API de consulta de FAQ:', error.message)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
