import { notFound } from "next/navigation";
import { TransactionDetail } from "@/components/finance/TransactionDetail";
import { financeRepository } from "@/infrastructure/financeRepository";

export const dynamic = "force-dynamic";

export default async function TransactionPage({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const [key = ""] = Object.values(await params);

  const data = await financeRepository.getFinance();
  const transaction = data.transactions.find(
    (t) => t.number.toLowerCase() === key.toLowerCase() || t.id === key,
  );
  if (!transaction) notFound();

  const attachment = await financeRepository.getAttachment(transaction.id);
  return <TransactionDetail data={data} transaction={transaction} attachment={attachment} />;
}