import { useRouter } from "next/navigation";

/** Kembali ke layar sebelumnya. Jika halaman dibuka langsung lewat link, pindah ke `fallback`. */
export function useGoBack(fallback: string) {
  const router = useRouter();
  return () => (window.history.length > 1 ? router.back() : router.push(fallback));
}