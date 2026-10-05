import { categoryName, groupByDate, type Category, type Transaction } from "@/domain/finance";
import { dayLong } from "@/shared/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "./TransactionRow";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onSelect(id: string): void;
}

export function TransactionList({ transactions, categories, onSelect }: Props) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Tidak ada transaksi"
        text="Ubah pencarian atau filter, atau tambah transaksi baru."
      />
    );
  }

  return (
    <>
      {groupByDate(transactions).map(([date, items]) => (
        <section key={date}>
          <h4 className="day">{dayLong(date)}</h4>
          <ul className="list card">
            {items.map((t) => {
              const category = categoryName(categories, t.categoryId);
              return (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  title={t.note || category}
                  meta={`${t.number} - ${category}`}
                  onSelect={() => onSelect(t.number)}
                />
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}