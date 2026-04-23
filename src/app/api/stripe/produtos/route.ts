import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'

// Verifica se é admin
async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  return perfil?.role === 'admin'
}

// ── GET — Listar produtos e preços ──
export async function GET() {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const products = await stripe.products.list({ active: true, limit: 20 })
  const prices = await stripe.prices.list({ active: true, limit: 50 })

  const resultado = products.data.map(p => ({
    id: p.id,
    nome: p.name,
    descricao: p.description,
    beneficios: p.metadata.beneficios || '',
    ativo: p.active,
    precos: prices.data
      .filter(pr => pr.product === p.id)
      .map(pr => ({
        id: pr.id,
        valor: pr.unit_amount,
        moeda: pr.currency,
        intervalo: pr.recurring?.interval,
        intervalo_count: pr.recurring?.interval_count,
        ativo: pr.active,
      }))
  }))

  return NextResponse.json({ produtos: resultado })
}

// ── POST — Criar produto com preços ──
export async function POST(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { nome, descricao, preco, intervalo, beneficios } = body

  if (!nome || !preco || isNaN(preco)) {
    return NextResponse.json({ error: 'Nome e preço são obrigatórios e devem ser válidos' }, { status: 400 })
  }

try {
  // Cria o produto
  const produto = await stripe.products.create({
    name: nome,
    ...(descricao ? { description: descricao } : {}),
    metadata: {
      beneficios: beneficios || 'Acesso ilimitado ao catálogo, Resolução Full HD, Suporte prioritário'
    }
  })

  // Cria o preço
  const price = await stripe.prices.create({
    product: produto.id,
    unit_amount: Math.round(preco * 100),
    currency: 'brl',
    recurring: { interval: intervalo || 'month' },
  })

  return NextResponse.json({
    produto: { id: produto.id, nome: produto.name },
    preco: { id: price.id, valor: preco, intervalo },
  })
} catch (error: any) {
  console.error("Erro ao criar produto:", error)
  return NextResponse.json({ error: error.message || 'Erro interno no Stripe' }, { status: 500 })
}
}

// ── DELETE — Desativar (Arquivar) produto ──
export async function DELETE(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await request.json()
  
  if (!id) return NextResponse.json({ error: 'ID do produto obrigatório' }, { status: 400 })

  await stripe.products.update(id, { active: false })
  return NextResponse.json({ success: true })
}

// ── PUT — Editar produto ──
export async function PUT(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, nome, beneficios } = await request.json()
  
  if (!id || !nome) return NextResponse.json({ error: 'ID e Nome são obrigatórios' }, { status: 400 })

  await stripe.products.update(id, { 
    name: nome,
    metadata: {
      beneficios: beneficios || ''
    }
  })
  return NextResponse.json({ success: true })
}
