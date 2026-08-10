import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  const projectId = process.env.POSTHOG_PROJECT_ID || '531922'

  if (!apiKey) {
    return NextResponse.json({ onlineAgora: 0, erro: 'API Key não configurada' }, { status: 200 })
  }

  try {
    const res = await fetch(`https://us.posthog.com/api/projects/${projectId}/query/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: 'SELECT count(distinct distinct_id) FROM events WHERE timestamp > now() - interval 5 minute'
        }
      }),
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ onlineAgora: 0 }, { status: 200 })
    }

    const data = await res.json()
    const count = data?.results?.[0]?.[0] || 0

    return NextResponse.json({ onlineAgora: Number(count) })
  } catch (error) {
    console.error('Erro ao consultar pessoas online no PostHog:', error)
    return NextResponse.json({ onlineAgora: 0 }, { status: 200 })
  }
}
