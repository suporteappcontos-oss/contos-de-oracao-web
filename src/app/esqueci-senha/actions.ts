'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Envia e-mail de recuperação de senha
export async function enviarResetSenha(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    redirect('/esqueci-senha?erro=email_vazio')
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contos-de-oracao-web.vercel.app'

  // O usuário vai receber um e-mail com um link que aponta para /api/auth/callback
  // que vai trocar o code por sessão e redirecionar para /atualizar-senha
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/atualizar-senha`,
  })

  if (error) {
    console.error('🔴 ERRO DO SUPABASE SMTP:', error)
    redirect('/esqueci-senha?erro=' + encodeURIComponent(error.message))
  }

  // Sempre redireciona para "enviado=true" se o envio SMTP for bem sucedido
  redirect('/esqueci-senha?enviado=true')
}
