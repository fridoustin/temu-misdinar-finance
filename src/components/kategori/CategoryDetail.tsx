"use client";

import { useRouter } from "next/navigation";
import { totalsOf, type Category, type Transaction } from "@/domain/finance";
import { dayShort } from "@/shared/format";
import { useGoBack } from "@/hooks/useGoBack";
import { TotalsHero } from "@/components/finance/TotalsHero";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

interface Props {
  category: Category;
  transactions: Transaction[];
}

const GROUPS = [
  ["income", "Pemasukan"],
  ["expense", "Pengeluaran"],
] as const;

export function CategoryDetail({ category, transactions }: Props) {
  const router = useRouter();
  const goBack = useGoBack("/kategori");

  const own = transactions
    .filter((t) => t.categoryId === category.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader title={category.name} onBack={goBack} />
      <TotalsHero label="Net" totals={totalsOf(own)} />
      {own.length === 0 && (
        <EmptyState title="Belum ada transaksi" text="Tambahkan transaksi dan pilih kategori ini." />
      )}
      {GROUPS.map(([type, label]) => {
        const items = own.filter((t) => t.type === type);
        if (items.length === 0) return null;
        return (
          <section key={type}>
            <h4 className="day">{label}</h4>
            <ul className="list card">
              {items.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  title={t.note || category.name}
                  meta={`${t.number} - ${dayShort(t.date)}`}
                  onSelect={() => router.push(`/finance/${t.number}`)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}