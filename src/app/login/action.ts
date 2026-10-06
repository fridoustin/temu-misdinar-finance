"use server";

import { createAuthClient } from "@/infrastructure/auth";

export async function loginAction(form: FormData): Promise<{ error?: string; email?: string }> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Email dan password wajib diisi." };

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email atau password salah." };

  return { email: data.user.email ?? email };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
}