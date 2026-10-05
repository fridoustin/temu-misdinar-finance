import { KategoriView } from "@/components/kategori/KategoriView";
import { financeRepository } from "@/infrastructure/financeRepository";

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  return <KategoriView data={await financeRepository.getFinance()} />;
}