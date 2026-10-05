import type { Evidence } from "@/domain/iuran";

/** Membaca satu file bukti dari FormData. Mengembalikan null jika tidak ada file. */
export async function evidenceFrom(formData: FormData, key = "file"): Promise<Evidence | null> {
  const file = formData.get(key);
  if (!(file instanceof File) || file.size === 0) return null;
  return { name: file.name, type: file.type, bytes: await file.arrayBuffer() };
}