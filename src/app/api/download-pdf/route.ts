import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileUrl = searchParams.get('url')
  
  if (!fileUrl) {
    return new NextResponse('URL do arquivo não fornecida', { status: 400 })
  }

  try {
    // Busca o arquivo no servidor de destino (BunnyCDN)
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar arquivo: ${response.status} ${response.statusText}`)
    }

    // Pega os bytes do arquivo
    const blob = await response.blob()
    
    // Determina o nome do arquivo a partir da URL
    let fileName = fileUrl.split('/').pop() || 'hq.pdf'
    fileName = fileName.split('?')[0] // Limpa qualquer sujeira da URL como ?accessKey
    if (!fileName.endsWith('.pdf')) fileName += '.pdf'

    // Retorna o arquivo forçando o download como anexo (attachment)
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error: any) {
    console.error('Erro na rota de proxy de download:', error)
    return new NextResponse(`Erro interno: ${error.message}`, { status: 500 })
  }
}
