import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, buscarUsuarioPorEmail } from '@/lib/supabase-admin'

function formatarNomeCurto(nomeCompleto: string): string {
  const preposicoes = ['de', 'do', 'da', 'dos', 'das', 'e', 'di', 'del', 'van', 'von']
  const palavras = nomeCompleto.trim().split(/\s+/).filter(Boolean)
  if (palavras.length <= 2) return palavras.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
  const resultado: string[] = [palavras[0], palavras[1]]
  if (preposicoes.includes(palavras[1].toLowerCase()) && palavras[2]) resultado.push(palavras[2])
  return resultado.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
}

export async function POST(request: NextRequest) {
  try {
    const tokenRecebido = request.headers.get('x-kiwify-token') || request.nextUrl.searchParams.get('token') || ''
    const tokenEsperado = process.env.KIWIFY_WEBHOOK_TOKEN || ''

    if (tokenEsperado && tokenRecebido !== tokenEsperado) {
      console.warn('⛔ Token inválido recebido:', tokenRecebido)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔔 Webhook Kiwify recebido:', JSON.stringify(body, null, 2))

    const evento = body?.event || body?.data?.status || body?.order_status || ''
    const email = body?.Customer?.email || body?.data?.customer?.email || body?.customer?.email || ''
    const nome = formatarNomeCurto(body?.Customer?.full_name || body?.data?.customer?.name || body?.customer?.name || 'Cliente')
    const produto = body?.Product?.name || body?.data?.product?.name || 'Contos de Oração'

    console.log(`📌 Evento: "${evento}" | Email: ${email} | Nome: ${nome}`)

    if (!email) {
      return NextResponse.json({ message: 'Email não encontrado, ignorado.' }, { status: 200 })
    }

    const eventosAprovados = ['paid', 'active', 'order_approved', 'subscription_active', 'approved']
    if (eventosAprovados.includes(evento)) {
      const jaExiste = await buscarUsuarioPorEmail(email)

      if (!jaExiste) {
        const { error: erroCreate } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { nome, produto, plano_ativo: true },
        })

        if (erroCreate) {
          console.error('❌ Erro ao criar usuário:', erroCreate.message)
          return NextResponse.json({ error: erroCreate.message }, { status: 500 })
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.online'
        await supabaseAdmin.auth.resetPasswordForEmail(email, {
          redirectTo: `${siteUrl}/atualizar-senha`,
        })
        console.log(`🎉 Usuário Kiwify criado: ${email}`)
      } else {
        await supabaseAdmin.auth.admin.updateUserById(jaExiste.id, {
          user_metadata: { plano_ativo: true, nome, produto },
        })
        console.log(`🔄 Plano Kiwify reativado: ${email}`)
      }
    }

    const eventosCancelamento = ['refunded', 'canceled', 'subscription_canceled', 'chargeback', 'subscription_overdue']
    if (eventosCancelamento.includes(evento)) {
      const usuario = await buscarUsuarioPorEmail(email)
      if (usuario) {
        await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
          user_metadata: { plano_ativo: false },
        })
        console.log(`🔒 Acesso Kiwify bloqueado: ${email}`)
      }
    }

    return NextResponse.json({ received: true, evento, email, status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('❌ Erro crítico no webhook Kiwify:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
