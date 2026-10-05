import { notFound } from "next/navigation";
import { CategoryDetail } from "@/components/kategori/CategoryDetail";
import { financeRepository } from "@/infrastructure/financeRepository";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const data = await financeRepository.getFinance();
  const category = data.categories.find((c) => c.id === id);
  if (!category) notFound();

  return <CategoryDetail category={category} transactions={data.transactions} />;
}