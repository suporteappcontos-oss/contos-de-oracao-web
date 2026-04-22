import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente Admin do Supabase (com poderes totais para criar usuários)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ✅ Formata nome para primeiras 2 palavras significativas
// "João Pires de Freitas Neto" → "João Pires"
// "Delmy de Oliveira Junior"   → "Delmy de Oliveira"
function formatarNomeCurto(nomeCompleto: string): string {
  const preposicoes = ['de', 'do', 'da', 'dos', 'das', 'e', 'di', 'del', 'van', 'von']
  const palavras = nomeCompleto.trim().split(/\s+/).filter(Boolean)
  if (palavras.length <= 2) {
    return palavras.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
  }
  const resultado: string[] = [palavras[0]]
  resultado.push(palavras[1])
  // Se a 2ª palavra é preposição (de, da, do...), inclui a 3ª também
  if (preposicoes.includes(palavras[1].toLowerCase()) && palavras[2]) {
    resultado.push(palavras[2])
  }
  return resultado.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ')
}

// ✅ Busca usuário por email — com limite de 1000 para evitar timeout
async function buscarUsuarioPorEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  if (error || !data) return null
  return data.users.find(u => u.email === email) ?? null
}

export async function POST(request: NextRequest) {
  try {
    // Verifica token secreto da Kiwify (opcional mas recomendado)
    const tokenRecebido = request.headers.get('x-kiwify-token') || request.nextUrl.searchParams.get('token') || ''
    const tokenEsperado = process.env.KIWIFY_WEBHOOK_TOKEN || ''

    if (tokenEsperado && tokenRecebido !== tokenEsperado) {
      console.warn('⛔ Token inválido recebido:', tokenRecebido)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔔 Webhook Kiwify recebido:', JSON.stringify(body, null, 2))

    // Kiwify envia o evento em diferentes formatos dependendo da versão
    const evento = body?.event || body?.data?.status || body?.order_status || ''
    const email = body?.Customer?.email || body?.data?.customer?.email || body?.customer?.email || ''
    const nome = formatarNomeCurto(body?.Customer?.full_name || body?.data?.customer?.name || body?.customer?.name || 'Cliente')
    const produto = body?.Product?.name || body?.data?.product?.name || 'Contos de Oração'

    console.log(`📌 Evento: "${evento}" | Email: ${email} | Nome: ${nome}`)

    if (!email) {
      console.warn('⚠️ Email não encontrado no payload, ignorando.')
      return NextResponse.json({ message: 'Email não encontrado, ignorado.' }, { status: 200 })
    }

    // ── COMPRA APROVADA / ASSINATURA ATIVA ──
    const eventosAprovados = ['paid', 'active', 'order_approved', 'subscription_active', 'approved']
    if (eventosAprovados.includes(evento)) {
      console.log(`✅ Compra aprovada para: ${email}`)

      const jaExiste = await buscarUsuarioPorEmail(email)

      if (!jaExiste) {
        // Cria o usuário sem senha — cliente vai definir a própria senha pelo e-mail
        const { error: erroCreate } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { nome, produto, plano_ativo: true },
        })

        if (erroCreate) {
          console.error('❌ Erro ao criar usuário:', erroCreate.message)
          return NextResponse.json({ error: erroCreate.message }, { status: 500 })
        }

        console.log(`🎉 Usuário criado: ${email}`)

        // Envia link de "Definir sua senha" → redireciona para /atualizar-senha
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contosdeoracao.online'
        const { error: erroReset } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
          redirectTo: `${siteUrl}/atualizar-senha`,
        })

        if (erroReset) {
          console.warn('⚠️ Erro ao enviar e-mail de senha:', erroReset.message)
        } else {
          console.log(`📧 E-mail de "Definir senha" enviado para: ${email}`)
        }

      } else {
        // Usuário já existe — reativa o plano
        await supabaseAdmin.auth.admin.updateUserById(jaExiste.id, {
          user_metadata: { plano_ativo: true, nome, produto },
        })
        console.log(`🔄 Plano reativado para: ${email}`)
      }
    }

    // ── CANCELAMENTO / REEMBOLSO ──
    const eventosCancelamento = ['refunded', 'canceled', 'subscription_canceled', 'chargeback', 'subscription_overdue']
    if (eventosCancelamento.includes(evento)) {
      console.log(`🚫 Cancelamento/Reembolso para: ${email}`)

      const usuario = await buscarUsuarioPorEmail(email)
      if (usuario) {
        await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
          user_metadata: { plano_ativo: false },
        })
        console.log(`🔒 Acesso bloqueado para: ${email}`)
      } else {
        console.warn(`⚠️ Usuário não encontrado para cancelamento: ${email}`)
      }
    }

    return NextResponse.json({ received: true, evento, email, status: 'ok' }, { status: 200 })

  } catch (error) {
    console.error('❌ Erro crítico no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
