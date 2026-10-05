import { notFound } from "next/navigation";
import { StatementView } from "@/components/statement/StatementView";
import { statementFor } from "@/domain/statistics";
import { financeRepository } from "@/infrastructure/financeRepository";

export const dynamic = "force-dynamic";

export default async function StatementPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) notFound();

  const data = await financeRepository.getFinance();
  return <StatementView statement={statementFor(data.transactions, month)} categories={data.categories} />;
}