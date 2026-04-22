'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Alterna favorito: adiciona se não existe, remove se já existe
export async function toggleFavorito(videoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Checa se já é favorito
  const { data: existente } = await supabase
    .from('favoritos')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()

  if (existente) {
    // Remove favorito
    await supabase.from('favoritos').delete().eq('id', existente.id)
    revalidatePath('/watch')
    revalidatePath('/perfil')
    return { favoritado: false }
  } else {
    // Adiciona favorito
    await supabase.from('favoritos').insert({ user_id: user.id, video_id: videoId })
    revalidatePath('/watch')
    revalidatePath('/perfil')
    return { favoritado: true }
  }
}
