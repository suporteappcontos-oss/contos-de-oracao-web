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
          const assinatura = subscriptions.data[0]
          statusStripe = assinatura.status

          // Status ativos: active e trialing
          planoAtivo = ['active', 'trialing'].includes(assinatura.status)

          // Nome do plano vindo do produto Stripe
          const priceItem = assinatura.items.data[0]
          const produto = priceItem?.price?.product
          if (produto && typeof produto === 'object' && 'name' in produto) {
            etiquetaPlano = (produto as { name: string }).name
          } else {
            etiquetaPlano = metadata.etiqueta_plano || 'Plano Ativo'
          }

          // Data de fim do período atual
          if (assinatura.current_period_end) {
            const dataFim = new Date(assinatura.current_period_end * 1000)
            const dia = String(dataFim.getDate()).padStart(2, '0')
            const mes = String(dataFim.getMonth() + 1).padStart(2, '0')
            const ano = dataFim.getFullYear()
            venceEm = `${dia}/${mes}/${ano}`

            // Próxima cobrança só se não estiver cancelada
            if (!assinatura.cancel_at_period_end) {
              proximaCobranca = venceEm
            }
          }

          // Status em português para o Lucas usar
          const statusMap: Record<string, string> = {
            active: 'ativo',
            trialing: 'em período de teste',
            past_due: 'com pagamento em atraso',
            canceled: 'cancelado',
            unpaid: 'com pagamento pendente',
            incomplete: 'pendente de confirmação',
            incomplete_expired: 'expirado'
          }
          statusStripe = statusMap[assinatura.status] || assinatura.status
        }
      }
    } catch (stripeErr: any) {
      // Se o Stripe falhar, usa o fallback do Supabase para não quebrar o fluxo
      console.error('Aviso: Stripe indisponível, usando fallback Supabase:', stripeErr.message)
      planoAtivo = metadata.plano_ativo === true
      etiquetaPlano = metadata.etiqueta_plano || 'Plano Básico'
      statusStripe = planoAtivo ? 'ativo (fallback)' : 'inativo (fallback)'
    }

    return NextResponse.json({
      encontrado: true,
      nome,
      email: usuario.email,
      plano_ativo: planoAtivo,
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
