import { notFound } from "next/navigation";
import { TransactionDetail } from "@/components/finance/TransactionDetail";
import { financeRepository } from "@/infrastructure/financeRepository";

export const dynamic = "force-dynamic";

export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const data = await financeRepository.getFinance();
  const transaction = data.transactions.find((t) => t.id === id);
  if (!transaction) notFound();

  const attachment = await financeRepository.getAttachment(id);
  return <TransactionDetail data={data} transaction={transaction} attachment={attachment} />;
}