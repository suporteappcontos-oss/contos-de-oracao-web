import { NextRequest, NextResponse } from 'next/server'
import { buscarUsuarioPorEmail, buscarUsuarioPorTelefone } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const telefone = searchParams.get('telefone')
    
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
    
    let usuario = null
    if (email && email.trim() !== '') {
      usuario = await buscarUsuarioPorEmail(email.trim().toLowerCase())
    } else if (telefone && telefone.trim() !== '') {
      usuario = await buscarUsuarioPorTelefone(telefone.trim())
    } else {
      return NextResponse.json({ 
        encontrado: false, 
        mensagem: 'E-mail ou Telefone não fornecido.' 
      })
    }
    
    if (!usuario) {
      return NextResponse.json({ 
        encontrado: false, 
        mensagem: 'Nenhuma conta cadastrada localizada com os dados informados.' 
      })
    }
    
    const cleanEmail = usuario.email ? usuario.email.toLowerCase() : ''

    
    const metadata = usuario.user_metadata || {}
    const nome = metadata.nome || 'Cliente'

    // ── Consulta Stripe em tempo real ──────────────────────────────────────
    let planoAtivo = false
    let etiquetaPlano = 'Sem plano ativo'
    let proximaCobranca: string | null = null
    let venceEm: string | null = null
    let statusStripe = 'sem_assinatura'

    try {
      const { stripe } = await import('@/lib/stripe')

      // Busca o cliente no Stripe pelo email
      const customers = await stripe.customers.list({ email: cleanEmail, limit: 1 })

      if (customers.data.length > 0) {
        const customerId = customers.data[0].id

        // Busca assinaturas ativas do cliente
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 5,
          expand: ['data.items.data.price.product']
        })

        if (subscriptions.data.length > 0) {
          // Pega a assinatura mais recente
          const assinatura = subscriptions.data[0] as any
          statusStripe = assinatura.status

          // Status ativos: active e trialing
          planoAtivo = ['active', 'trialing'].includes(assinatura.status)

          // Nome do plano vindo do produto/preço Stripe
          const priceItem = assinatura.items.data[0]
          const produto = priceItem?.price?.product
          const interval = priceItem?.price?.recurring?.interval
          const isAnual = interval === 'year' || (produto && typeof produto === 'object' && 'name' in produto && (produto as any).name.toLowerCase().includes('anual'))
          etiquetaPlano = isAnual ? 'Plano Anual' : 'Plano Mensal'
        }
      }
    } catch (stripeErr: any) {
      // Se o Stripe falhar, usa o fallback do Supabase para não quebrar o fluxo
      console.error('Aviso: Stripe indisponível, usando fallback Supabase:', stripeErr.message)
      planoAtivo = metadata.plano_ativo === true
      const rawEt = (metadata.etiqueta_plano || '').toString().toLowerCase()
      etiquetaPlano = rawEt.includes('anual') ? 'Plano Anual' : (rawEt.includes('testador') ? 'Testador 🧪' : 'Plano Mensal')
      statusStripe = planoAtivo ? 'ativo (fallback)' : 'inativo (fallback)'
    }

    // ── Lógica de Acesso de Testador ──────────────────────────────────────
    if (metadata.testador && metadata.teste_valido_ate) {
      const dataValidade = new Date(metadata.teste_valido_ate)
      if (new Date() < dataValidade) {
        planoAtivo = true
        etiquetaPlano = metadata.etiqueta_plano || 'Testador 🧪'
        statusStripe = 'ativo (testador)'
        const dia = String(dataValidade.getDate()).padStart(2, '0')
        const mes = String(dataValidade.getMonth() + 1).padStart(2, '0')
        const ano = dataValidade.getFullYear()
        venceEm = `${dia}/${mes}/${ano}`
        proximaCobranca = venceEm
      } else if (!planoAtivo) {
        // Testador expirado e sem plano pago ativo
        planoAtivo = false
        etiquetaPlano = 'Expirado'
        statusStripe = 'expirado (testador)'
      }
    }

    const emTeste = statusStripe === 'em período de teste' || metadata.em_teste === true

    return NextResponse.json({
      encontrado: true,
      nome,
      email: usuario.email,
      plano_ativo: planoAtivo,
      em_teste: emTeste,
      etiqueta_plano: etiquetaPlano,
      status_stripe: statusStripe,
      proxima_cobranca: proximaCobranca,
      vence_em: venceEm,
      criado_em: usuario.created_at
    })
  } catch (error: any) {
    console.error('Erro na API de consulta de assinante:', error.message)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
