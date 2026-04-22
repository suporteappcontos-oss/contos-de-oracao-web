'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Atualiza a senha do usuário logado (após clicar no link do e-mail)
export async function atualizarSenha(formData: FormData) {
  const senha = formData.get('senha') as string
  const confirmar = formData.get('confirmar') as string

  if (!senha || senha.length < 6) {
    redirect('/atualizar-senha?erro=senha_curta')
  }

  if (senha !== confirmar) {
    redirect('/atualizar-senha?erro=senhas_diferentes')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: senha })

  if (error) {
    console.error('Erro ao atualizar senha:', error.message)
    redirect('/atualizar-senha?erro=erro_generico')
  }

  // Senha atualizada! Redireciona para o catálogo
  redirect('/watch')
}
