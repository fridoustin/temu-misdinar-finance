import type { Evidence } from "@/domain/iuran";
import { db } from "./supabase";

export const BUCKET = "bukti";
export const SIGNED_URL_SECONDS = 60 * 60;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export const extensionOf = (file: Evidence): string =>
  EXTENSIONS[file.type] ?? (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/\W/g, "");

export const bucket = () => db.storage.from(BUCKET);

/** Tautan sementara untuk melihat file. Urutan hasil sama dengan urutan path. */
export async function signedUrls(paths: string[]): Promise<(string | null)[]> {
  if (paths.length === 0) return [];
  const { data, error } = await bucket().createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error) throw new Error(error.message);
  return data.map((d) => d.signedUrl);
}