"use server";

import { createAuthClient, usernameToEmail } from "@/infrastructure/auth";

export async function loginAction(form: FormData): Promise<{ error?: string; username?: string }> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!username || !password) return { error: "Username dan password wajib diisi." };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  if (error) return { error: "Username atau password salah." };

  return { username };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
}