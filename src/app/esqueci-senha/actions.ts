'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Envia e-mail de recuperação de senha
export async function enviarResetSenha(formData: FormData) {
  let emailRaw = formData.get('email') as string
  const email = emailRaw ? emailRaw.trim() : ''

  console.log('🟢 [Server Action] Disparou enviarResetSenha para:', email)

  if (!email) {
    redirect('/esqueci-senha?erro=email_vazio')
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contos-de-oracao-web.vercel.app'

  console.log('🟢 [Server Action] Enviando requisição para o Supabase...')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/atualizar-senha`,
  })

  console.log('🟢 [Server Action] Resposta do Supabase, erro:', error)

  if (error) {
    console.error('🔴 ERRO DO SUPABASE SMTP:', error)
    redirect('/esqueci-senha?erro=' + encodeURIComponent(error.message))
  }

  // Sempre redireciona para "enviado=true" se o envio SMTP for bem sucedido
  redirect('/esqueci-senha?enviado=true')
}
