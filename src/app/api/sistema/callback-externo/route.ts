import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'
import crypto from 'crypto'

function formatarNomeCurto(nomeCompleto: string): string {
  const preposicoes = ['de', 'do', 'da', 'dos', 'das', 'e', 'di', 'del']
  const palavras = nomeCompleto.trim().split(/\s+/).filter(Boolean)
  if (palavras.length <= 2) return palavras.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
  const resultado = [palavras[0], palavras[1]]
  if (preposicoes.includes(palavras[1].toLowerCase()) && palavras[2]) resultado.push(palavras[2])
  return resultado.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    
    // Validação de Segurança da Kiwify
    const signature = request.nextUrl.searchParams.get('signature')
    const webhookToken = process.env.KIWIFY_WEBHOOK_TOKEN
    
    if (!webhookToken) {
      console.error('⛔ ERRO CRÍTICO: KIWIFY_WEBHOOK_TOKEN não está configurado. Rejeitando todas as requisições por segurança.')
      return NextResponse.json({ error: 'Configuração do servidor ausente' }, { status: 500 })
    }

    if (!signature) {
      console.error('⛔ Tentativa de acesso sem assinatura Kiwify bloqueada.')
      return NextResponse.json({ error: 'Assinatura ausente' }, { status: 401 })
    }

    const calculatedSignature = crypto
      .createHmac('sha1', webhookToken)
      .update(rawBody)
      .digest('hex')
    
    if (calculatedSignature !== signature) {
      console.error('⛔ Assinatura Kiwify inválida. Tentativa de invasão bloqueada.')
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    console.log(`🔔 Webhook Kiwify Recebido. Status: ${payload.order_status || payload.Subscription?.status || 'desconhecido'}`)

    const email = payload.Customer?.email
    const nome = payload.Customer?.full_name || 'Cliente'
    // Planos da Kiwify não tem o Max Telas no metadata, então deixaremos 1 como padrão ou 3 (você pode customizar no produto)
    const maxTelas = 3 
    const productId = payload.Product?.id || ''
    
    let etiquetaPlano = payload.Product?.name || 'Plano Premium'
    if (etiquetaPlano.toLowerCase().includes('anual')) {
      etiquetaPlano = 'Plano Anual'
    } else if (etiquetaPlano.toLowerCase().includes('mensal')) {
      etiquetaPlano = 'Plano Mensal'
    } else {
      etiquetaPlano = 'Plano Premium' // Fica mais bonito que o nome original do produto na Kiwify
    }

    if (!email) {
      return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })
    }

    const orderStatus = payload.order_status
    const subStatus = payload.Subscription?.status

    // -- APROVADO OU RENOVADO --
    if (orderStatus === 'paid' || subStatus === 'active') {
      const usuario = await buscarUsuarioPorEmail(email)
      const metaAtualizado = { plano_ativo: true, max_telas: maxTelas, kiwify_product_id: productId, etiqueta_plano: etiquetaPlano, nome: formatarNomeCurto(nome) }

      if (usuario) {
        await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
          user_metadata: metaAtualizado,
        })
        console.log(`✅ Acesso Kiwify Liberado/Renovado: ${email}`)
      } else {
        // Define uma senha provisória padrão para facilitar o acesso
        const senhaProvisoria = 'Contos2026'

        const { error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: senhaProvisoria,
          email_confirm: true,
          user_metadata: metaAtualizado,
        })
        
        if (!error) {
          console.log(`🎉 Novo Cliente Kiwify Criado com senha provisória: ${email}`)
        } else {
          console.error('Erro ao criar usuário:', error)
        }
      }
    }

    // -- CANCELADO OU REEMBOLSADO --
    if (orderStatus === 'refunded' || orderStatus === 'chargedback' || subStatus === 'canceled' || subStatus === 'past_due') {
      const usuario = await buscarUsuarioPorEmail(email)
      if (usuario) {
        await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
          user_metadata: { plano_ativo: false },
        })
        console.log(`🔒 Acesso Kiwify Revogado: ${email}`)
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processado' })
  } catch (err) {
    console.error('Erro processando webhook Kiwify:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
