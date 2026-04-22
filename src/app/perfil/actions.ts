'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Alterna favorito: adiciona se não existe, remove se já existe
export async function toggleFavorito(videoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: existente } = await supabase
    .from('favoritos')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()

  if (existente) {
    await supabase.from('favoritos').delete().eq('id', existente.id)
    revalidatePath('/watch')
    revalidatePath('/perfil')
    return { favoritado: false }
  } else {
    await supabase.from('favoritos').insert({ user_id: user.id, video_id: videoId })
    revalidatePath('/watch')
    revalidatePath('/perfil')
    return { favoritado: true }
  }
}

// Salva o nome do usuário no perfil
export async function salvarNome(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const nome = (formData.get('nome') as string)?.trim()
  if (!nome) return

  await supabase.auth.updateUser({ data: { nome } })

  revalidatePath('/perfil')
  revalidatePath('/watch')
}

// Cancela o próprio plano (define plano_ativo = false para testar o fluxo)
export async function cancelarPlano() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Atualiza o user_metadata do próprio usuário
  await supabase.auth.updateUser({
    data: { plano_ativo: false }
  })

  redirect('/?acesso=expirado')
}
