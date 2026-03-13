import { supabase } from "@/lib/supabase-client";

export async function changePassword(oldPassword: string, newPassword: string) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { success: false, error: "Utilisateur non connecté" }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  })

  if (signInError) {
    return { success: false, error: "Ancien mot de passe incorrect" }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}