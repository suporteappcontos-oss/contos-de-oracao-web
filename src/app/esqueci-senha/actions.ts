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
  
  // Melhor detecção da URL base para o redirecionamento funcionar em previews da Vercel
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL 
    : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://contos-de-oracao-web.vercel.app'

  console.log('🟢 [Server Action] Enviando requisição para o Supabase...')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/atualizar-senha`,
  })

  console.log('🟢 [Server Action] Resposta do Supabase, erro:', error)

  if (error) {
    console.error('🔴 ERRO DO SUPABASE SMTP:', error)
    
    let mensagemErro = 'Erro interno ao tentar enviar o e-mail de recuperação.'
    
    // O Supabase às vezes retorna um objeto de erro vazio `{}` se o SMTP falhar criticamente ou der timeout
    if (error.message && error.message !== '{}') {
      mensagemErro = error.message
    } else if (error.status === 400) {
      mensagemErro = 'E-mail inválido ou URL de redirecionamento não autorizada no Supabase.'
    } else if (error.status === 429) {
      mensagemErro = 'Muitas tentativas de envio. Aguarde alguns minutos.'
    } else if (error.status && error.status >= 500) {
      mensagemErro = 'Erro no servidor de e-mail (SMTP). Pode ser um problema com a Senha de App do Gmail.'
    }

    redirect('/esqueci-senha?erro=' + encodeURIComponent(mensagemErro))
  }

  // Sempre redireciona para "enviado=true" se o envio SMTP for bem sucedido
  redirect('/esqueci-senha?enviado=true')
}
