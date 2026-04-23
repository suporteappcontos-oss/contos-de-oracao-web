'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') redirect('/')
  return { supabase, user }
}

// ─── Adicionar vídeo ───
export async function adicionarVideo(formData: FormData) {
  const { supabase } = await verificarAdmin()
  const { error } = await supabase.from('videos').insert({
    titulo: formData.get('titulo') as string,
    descricao: (formData.get('descricao') as string) || null,
    categoria: (formData.get('categoria') as string) || 'Geral',
    bunny_video_id: formData.get('bunny_video_id') as string,
    bunny_library_id: process.env.BUNNY_LIBRARY_ID || '642831',
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    duracao: (formData.get('duracao') as string) || null,
    ativo: true,
  })
  if (error) console.error('❌ Erro ao adicionar vídeo:', error.message)
  revalidatePath('/admin')
  revalidatePath('/watch')
}

// ─── Editar vídeo ───
export async function editarVideo(videoId: string, formData: FormData) {
  const { supabase } = await verificarAdmin()
  await supabase.from('videos').update({
    titulo: formData.get('titulo') as string,
    descricao: (formData.get('descricao') as string) || null,
    categoria: formData.get('categoria') as string,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    duracao: (formData.get('duracao') as string) || null,
  }).eq('id', videoId)
  revalidatePath('/admin')
  revalidatePath('/watch')
  redirect('/admin?tab=videos')
}

// ─── Ativar / Desativar vídeo ───
export async function toggleVideoAtivo(videoId: string, ativoAtual: boolean) {
  const { supabase } = await verificarAdmin()
  await supabase.from('videos').update({ ativo: !ativoAtual }).eq('id', videoId)
  revalidatePath('/admin')
  revalidatePath('/watch')
}

// ─── Deletar vídeo ───
export async function deletarVideo(videoId: string) {
  const { supabase } = await verificarAdmin()
  await supabase.from('videos').delete().eq('id', videoId)
  revalidatePath('/admin')
  revalidatePath('/watch')
}

// ─── Ativar / Bloquear assinante ───
export async function togglePlanoUsuario(userId: string, planoAtual: boolean) {
  await verificarAdmin()
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { plano_ativo: !planoAtual },
  })
  if (error) console.error('❌ Erro ao atualizar plano:', error.message)
  revalidatePath('/admin')
}
