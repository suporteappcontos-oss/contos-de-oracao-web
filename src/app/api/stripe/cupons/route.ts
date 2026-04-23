import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  return perfil?.role === 'admin'
}

// ── GET — Listar cupons ──
export async function GET() {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const cupons = await stripe.coupons.list({ limit: 50 })

  return NextResponse.json({
    cupons: cupons.data.map(c => ({
      id: c.id,
      nome: c.name,
      desconto: c.percent_off ? `${c.percent_off}%` : `R$ ${((c.amount_off || 0) / 100).toFixed(2)}`,
      tipo: c.percent_off ? 'percentual' : 'fixo',
      duracao: c.duration,
      usos_max: c.max_redemptions,
      usos_atual: c.times_redeemed,
      ativo: c.valid,
      expira: c.redeem_by ? new Date(c.redeem_by * 1000).toLocaleDateString('pt-BR') : null,
    }))
  })
}

// ── POST — Criar cupom ──
export async function POST(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { nome, codigo, tipo, valor, duracao, usos_max, dias_expiracao } = body

  if (!nome || !tipo || !valor) {
    return NextResponse.json({ error: 'Nome, tipo e valor são obrigatórios' }, { status: 400 })
  }

  const params: Parameters<typeof stripe.coupons.create>[0] = {
    name: nome,
    duration: duracao || 'once',
  }

  if (tipo === 'percentual') {
    params.percent_off = Number(valor)
  } else {
    params.amount_off = Math.round(Number(valor) * 100)
    params.currency = 'brl'
  }

  if (usos_max) params.max_redemptions = Number(usos_max)
  if (dias_expiracao) {
    const expira = new Date()
    expira.setDate(expira.getDate() + Number(dias_expiracao))
    params.redeem_by = Math.floor(expira.getTime() / 1000)
  }

  const cupom = await stripe.coupons.create(params)

  // Cria código promocional se informado
  let promoCodigo = null
  if (codigo) {
    promoCodigo = await stripe.promotionCodes.create({
      // A versão da API 2026-03-25.dahlia usa promotion.coupon
      promotion: {
        type: 'coupon',
        coupon: cupom.id,
      },
      code: codigo.toUpperCase(),
    } as any)
  }

  return NextResponse.json({
    cupom: { id: cupom.id, nome: cupom.name },
    codigo: promoCodigo?.code || null,
  })
}

// ── DELETE — Desativar cupom ──
export async function DELETE(request: NextRequest) {
  if (!await verificarAdmin()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await request.json()
  await stripe.coupons.del(id)
  return NextResponse.json({ deletado: true })
}
