'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // You might want to create a more specific error handling
    console.error('Login error:', error.message)
    redirect('/error?message=' + encodeURIComponent(error.message))
  }

  // Clear all caches and force a fresh session check
  revalidatePath('/', 'layout')
  
  // Use a more explicit redirect
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect('/error?message=' + encodeURIComponent(error.message))
  }

  if (authData.user && !authData.user.email_confirmed_at) {
    // User needs to confirm email
    redirect('/auth/confirm?message=' + encodeURIComponent('Check your email for the confirmation link!'))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}