import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
    if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const nomeSanto = formData.get('nomeSanto') as string

    if (!file || !nomeSanto?.trim()) {
      return NextResponse.json({ error: 'Arquivo e nome do santo são obrigatórios' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'O arquivo deve ser uma imagem válida.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Nome do arquivo unico e sanitizado
    const cleanName = nomeSanto.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]/g, '_')     // substitui tudo que nao for alfanumerico por _
      .replace(/_+/g, '_')            // consolida multiplos _
      .trim()
    const ext = file.name.split('.').pop() || 'webp'
    const fileName = `avatar_${cleanName}_${Date.now()}.${ext}`
    
    // Credenciais BunnyCDN
    const STORAGE_ZONE = 'contos-midia-app'
    const ACCESS_KEY = process.env.BUNNY_API_KEY
    
    if (!ACCESS_KEY) {
      return NextResponse.json({ error: 'Chave BUNNY_API_KEY não configurada no servidor' }, { status: 500 })
    }

    const REGION_URL = 'br.storage.bunnycdn.com'
    const PULL_ZONE = 'https://contos-midia-app.b-cdn.net'
    
    // Upload para BunnyCDN na pasta avatars
    const response = await fetch(`https://${REGION_URL}/${STORAGE_ZONE}/avatars/${fileName}`, {
      method: 'PUT',
      headers: {
        'AccessKey': ACCESS_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    })

    if (!response.ok) {
      throw new Error(`Erro no BunnyCDN: ${response.statusText}`)
    }

    const fileUrl = `${PULL_ZONE}/avatars/${fileName}`

    // Salva no banco de dados
    const { data: newAvatar, error: dbError } = await supabase
      .from('avatars_santos')
      .insert({
        nome: nomeSanto.trim(),
        avatar_url: fileUrl
      })
      .select()
      .single()

    if (dbError) {
      if (dbError.code === '23505') { // unique violation
        return NextResponse.json({ error: 'Já existe um avatar cadastrado com este nome.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Erro ao registrar avatar no banco: ' + dbError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      avatar: newAvatar
    })

  } catch (error: any) {
    console.error('Erro no upload de avatar para o BunnyCDN:', error)
    return NextResponse.json(
      { error: 'Erro ao processar upload', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
    if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID do avatar é obrigatório' }, { status: 400 })
    }

    // Busca o avatar para obter a URL do BunnyCDN
    const { data: avatar, error: fetchError } = await supabase
      .from('avatars_santos')
      .select('avatar_url')
      .eq('id', id)
      .single()

    if (fetchError || !avatar) {
      return NextResponse.json({ error: 'Avatar não encontrado' }, { status: 404 })
    }

    // Deleta do banco
    const { error: deleteError } = await supabase
      .from('avatars_santos')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Tenta deletar do BunnyCDN (silencioso em caso de falha de conexão)
    try {
      const STORAGE_ZONE = 'contos-midia-app'
      const ACCESS_KEY = process.env.BUNNY_API_KEY
      const REGION_URL = 'br.storage.bunnycdn.com'
      
      const fileName = avatar.avatar_url.split('/').pop()
      if (fileName && ACCESS_KEY) {
        await fetch(`https://${REGION_URL}/${STORAGE_ZONE}/avatars/${fileName}`, {
          method: 'DELETE',
          headers: {
            'AccessKey': ACCESS_KEY,
          }
        })
      }
    } catch (e) {
      console.error('Falha ao deletar arquivo no Bunny CDN:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
