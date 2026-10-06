import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAuthClient() {
  const store = await cookies();

  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Dipanggil dari Server Component: abaikan, middleware yang menyegarkan sesi.
        }
      },
    },
  });
}

/** Pengguna yang sedang masuk, atau null jika pengunjung biasa. */
export async function getAdmin() {
  const supabase = await createAuthClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Dipanggil di awal setiap aksi tulis. */
export async function requireAdmin(): Promise<void> {
  if (!(await getAdmin())) {
    throw new Error("Hanya admin yang bisa melakukan ini. Silakan masuk dulu.");
  }
}