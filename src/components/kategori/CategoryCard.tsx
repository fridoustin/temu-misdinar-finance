import type { CategorySummary } from "@/application/finance";
import type { TransactionType } from "@/domain/finance";
import { rupiah } from "@/shared/format";

interface Props {
  summary: CategorySummary;
  type: TransactionType;
  onSelect(): void;
}

export function CategoryCard({ summary: s, type, onSelect }: Props) {
  return (
    <button className="card cat-card" onClick={onSelect}>
      <div className="cat-info">
        <b>{s.category.name}</b>
        <small className="muted">{s.count} transaksi</small>
      </div>
      <b className={type}>{rupiah(s.amount)}</b>
    </button>
  );
}