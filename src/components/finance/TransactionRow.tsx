import type { KeyboardEvent } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@/domain/finance";
import { rupiah } from "@/shared/format";

interface Props {
  transaction: Transaction;
  title: string;
  meta: string;
  onSelect?(): void;
}

export function TransactionRow({ transaction: t, title, meta, onSelect }: Props) {
  const isIncome = t.type === "income";
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

  const interactive = onSelect
    ? {
        role: "button",
        tabIndex: 0,
        onClick: onSelect,
        onKeyDown: (e: KeyboardEvent) => e.key === "Enter" && onSelect(),
      }
    : {};

  return (
    <li className={"tx" + (onSelect ? " clickable" : "")} {...interactive}>
      <span className={`dot ${t.type}`}>
        <Icon />
      </span>
      <div className="tx-body">
        <b>{title}</b>
        <small>{meta}</small>
      </div>
      <span className={`amt ${t.type}`}>
        {isIncome ? "+" : "-"} {rupiah(t.amount)}
      </span>
    </li>
  );
}