/**
 * Utilitário para consumir a API pública da Kiwify
 * Docs: https://docs.kiwify.com.br
 */

const BASE_URL = 'https://public-api.kiwify.com'

// ─── Gera Bearer Token OAuth ───
async function getKiwifyToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.KIWIFY_CLIENT_ID,
      client_secret: process.env.KIWIFY_CLIENT_SECRET,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Kiwify OAuth falhou: ${res.status}`)
  }

  const data = await res.json()
  return data.access_token as string
}

// ─── Headers padrão autenticados ───
async function getHeaders() {
  const token = await getKiwifyToken()
  return {
    Authorization: `Bearer ${token}`,
    'x-kiwify-account-id': process.env.KIWIFY_ACCOUNT_ID!,
    'Content-Type': 'application/json',
  }
}

// ─── Tipos ───
export type KiwifySale = {
  id: string
  status: string
  created_at: string
  product_name: string
  total: number
  customer: { name: string; email: string }
  payment_method: string
}

export type KiwifyStats = {
  total_revenue: number
  total_sales: number
  approved_sales: number
  refunded_sales: number
}

// ─── Listar últimas vendas ───
export async function getKiwifyVendas(limit = 20): Promise<KiwifySale[]> {
  try {
    const headers = await getHeaders()
    const res = await fetch(`${BASE_URL}/v1/sales?page_size=${limit}`, {
      headers,
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || data.sales || []
  } catch (e) {
    console.error('Erro ao buscar vendas Kiwify:', e)
    return []
  }
}

// ─── Estatísticas de vendas ───
export async function getKiwifyStats(): Promise<KiwifyStats | null> {
  try {
    const headers = await getHeaders()
    const res = await fetch(`${BASE_URL}/v1/sales/stats`, {
      headers,
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    console.error('Erro ao buscar stats Kiwify:', e)
    return null
  }
}

// ─── Listar produtos ───
export async function getKiwifyProdutos() {
  try {
    const headers = await getHeaders()
    const res = await fetch(`${BASE_URL}/v1/products`, {
      headers,
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch (e) {
    console.error('Erro ao buscar produtos Kiwify:', e)
    return []
  }
}

// ─── Reembolsar venda ───
export async function reembolsarVenda(saleId: string): Promise<boolean> {
  try {
    const headers = await getHeaders()
    const res = await fetch(`${BASE_URL}/v1/sales/${saleId}/refund`, {
      method: 'POST',
      headers,
    })
    return res.ok
  } catch (e) {
    console.error('Erro ao reembolsar venda:', e)
    return false
  }
}
