'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validação de confirmação de senha
  if (password !== confirmPassword) {
    redirect('/login?error=senhas_diferentes')
  }

  const data = {
    email,
    password,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=credenciais_invalidas')
  }

  revalidatePath('/', 'layout')
  redirect('/watch') // No futuro a gente cria essa tela
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: undefined,
    }
  })

  if (error) {
    redirect('/login?error=erro_ao_registrar')
  }

  revalidatePath('/', 'layout')
  redirect('/watch')
}
