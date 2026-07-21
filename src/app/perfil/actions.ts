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

// Salva o avatar do usuário
export async function salvarAvatar(avatarUrl: string | null, pedidoSanto?: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  // Atualiza o user_metadata do próprio usuário
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl }
  })

  if (error) return { success: false, error: error.message }

  // Se houver pedido de santo, registra na tabela pedidos_santos usando o cliente admin
  if (pedidoSanto && pedidoSanto.trim()) {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-admin')
      await supabaseAdmin.from('pedidos_santos').insert({
        santo_nome: pedidoSanto.trim(),
        user_id: user.id,
        user_email: user.email
      })
    } catch (err) {
      console.error('Erro ao registrar pedido de santo no perfil:', err)
    }
  }

  revalidatePath('/perfil')
  revalidatePath('/watch')
  return { success: true }
}

// Salva o telefone/WhatsApp do usuário
export async function salvarTelefone(whatsapp: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const clean = whatsapp.trim()

  const { error } = await supabase.auth.updateUser({
    data: { whatsapp: clean, telefone: clean }
  })

  if (error) return { success: false, error: error.message }

  try {
    const { supabaseAdmin } = await import('@/lib/supabase-admin')
    await supabaseAdmin.from('perfis').update({ telefone: clean }).eq('id', user.id)
  } catch (e) {
    console.error('Erro ao sincronizar telefone na tabela perfis:', e)
  }

  revalidatePath('/perfil')
  return { success: true }
}

// Alterar senha do próprio usuário
export async function alterarSenha(novaSenha: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  if (!novaSenha || novaSenha.length < 6) {
    return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: novaSenha
  })

  if (error) return { success: false, error: error.message }

  return { success: true }
}
