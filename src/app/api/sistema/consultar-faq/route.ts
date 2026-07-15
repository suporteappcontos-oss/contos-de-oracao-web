import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')?.trim() ?? ''

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

    let faqs: { categoria: string; pergunta: string; conteudo: string }[] = []

    // ── Busca inteligente por relevância ──────────────────────────────────────
    if (query.length > 2) {
      const stopWords = new Set([
        'que', 'como', 'para', 'com', 'não', 'uma', 'mais', 'isso', 'tem',
        'meu', 'minha', 'meus', 'minhas', 'você', 'por', 'isso', 'esse',
        'essa', 'quando', 'onde', 'qual', 'quais', 'fazer', 'posso', 'devo',
        'preciso', 'tenho', 'pode', 'sei', 'sou', 'estou'
      ])

      const keywords = query
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove acentos
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w))
        .slice(0, 6)

      if (keywords.length > 0) {
        const filters = keywords
          .map(kw => `pergunta.ilike.%${kw}%,conteudo.ilike.%${kw}%`)
          .join(',')

        const { data: relevant } = await supabaseAdmin
          .from('ia_base_conhecimento')
          .select('categoria, pergunta, conteudo')
          .eq('ativo', true)
          .or(filters)
          .limit(4)

        if (relevant && relevant.length > 0) {
          faqs = relevant
        }
      }
    }

    // ── Fallback: retorna os 5 FAQs mais recentes se nada foi encontrado ──────
    if (faqs.length === 0) {
      const { data: fallback, error } = await supabaseAdmin
        .from('ia_base_conhecimento')
        .select('categoria, pergunta, conteudo')
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
        .limit(5)

      if (error) throw error
      faqs = fallback ?? []
    }

    return NextResponse.json({ faqs })
  } catch (error: any) {
    console.error('Erro na API de consulta de FAQ:', error.message)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

