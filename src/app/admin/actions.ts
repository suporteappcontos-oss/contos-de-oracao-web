'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Verifica se o usuário é admin, senão redireciona ───
async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'admin') redirect('/')
  return { supabase, user }
}

// ─── Adicionar novo vídeo ───
export async function adicionarVideo(formData: FormData) {
  const { supabase } = await verificarAdmin()

  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const categoria = formData.get('categoria') as string
  const bunnyVideoId = formData.get('bunny_video_id') as string
  const thumbnailUrl = formData.get('thumbnail_url') as string
  const duracao = formData.get('duracao') as string

  const { error } = await supabase.from('videos').insert({
    titulo,
    descricao: descricao || null,
    categoria: categoria || 'Geral',
    bunny_video_id: bunnyVideoId,
    bunny_library_id: process.env.BUNNY_LIBRARY_ID || '642831',
    thumbnail_url: thumbnailUrl || null,
    duracao: duracao || null,
    ativo: true,
  })

  if (error) {
    console.error('❌ Erro ao adicionar vídeo:', error.message)
  } else {
    console.log(`✅ Vídeo "${titulo}" adicionado com sucesso!`)
  }

  revalidatePath('/admin')
  revalidatePath('/watch')
}

// ─── Ativar / Desativar vídeo ───
export async function toggleVideoAtivo(videoId: string, ativoAtual: boolean) {
  const { supabase } = await verificarAdmin()

  await supabase
    .from('videos')
    .update({ ativo: !ativoAtual })
    .eq('id', videoId)

  revalidatePath('/admin')
  revalidatePath('/watch')
}

// ─── Deletar vídeo permanentemente ───
export async function deletarVideo(videoId: string) {
  const { supabase } = await verificarAdmin()

  await supabase.from('videos').delete().eq('id', videoId)

  revalidatePath('/admin')
  revalidatePath('/watch')
}
