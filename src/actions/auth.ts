'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: 'E-mail ou senha incorretos' }
    }

    revalidatePath('/painel', 'layout')
    return { success: true }
  } catch (e: any) {
    console.error('Server action login error:', e)
    return { error: 'Erro no servidor: ' + (e.message || String(e)) }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getCurrentUserEmail() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return data?.user?.email || 'admin@digitaltech.com'
  } catch (e) {
    return 'admin@digitaltech.com'
  }
}
