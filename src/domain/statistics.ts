import { totalsOf, type Category, type Division, type Totals, type Transaction } from "@/domain/finance";
import type { Payment } from "@/domain/iuran";

/** "2026-10-05" menjadi "2026-10". */
export const monthOf = (isoDate: string): string => isoDate.slice(0, 7);

export const monthLabel = (month: string): string =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export interface MonthSummary extends Totals {
  month: string;
  balance: number; // saldo kas besar di akhir bulan
}

export interface MonthlyIuran {
  month: string;
  amount: number;
}

export interface CategoryRow {
  category: Category;
  income: number;
  expense: number;
}

export interface StatementRow {
  transaction: Transaction;
  balance: number;
}

export interface Statement {
  month: string;
  opening: number;
  income: number;
  expense: number;
  closing: number;
  rows: StatementRow[];
}

export interface DivisionRow {
  id: string;
  name: string;
  amount: number;
  share: number; // bagian dari total pengeluaran bulan itu, 0 sampai 1
}

/** Pengeluaran per divisi pada satu bulan, dari yang terbesar. */
export function expenseByDivision(
  transactions: Transaction[],
  divisions: Division[],
  month: string,
): DivisionRow[] {
  const sums = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || monthOf(t.date) !== month) continue;
    const key = t.divisionId ?? "";
    sums.set(key, (sums.get(key) ?? 0) + t.amount);
  }

  const total = [...sums.values()].reduce((sum, v) => sum + v, 0);

  return [...sums]
    .map(([id, amount]) => ({
      id,
      name: divisions.find((d) => d.id === id)?.name ?? "Tanpa divisi",
      amount,
      share: total ? amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Pemasukan, pengeluaran, dan cashflow (net) satu bulan. */
export const cashflowOf = (transactions: Transaction[], month: string): Totals =>
  totalsOf(transactions.filter((t) => monthOf(t.date) === month));

/** Ringkasan per bulan (hanya bulan yang ada transaksinya), terbaru di atas. */
export function monthlySummaries(transactions: Transaction[]): MonthSummary[] {
  const months = [...new Set(transactions.map((t) => monthOf(t.date)))].sort();

  let balance = 0;
  const list = months.map((month) => {
    const totals = totalsOf(transactions.filter((t) => monthOf(t.date) === month));
    balance += totals.net;
    return { month, ...totals, balance };
  });

  return list.reverse();
}

/** Iuran terkumpul per bulan (kas kecil), terbaru di atas. */
export function monthlyIuran(payments: Payment[]): MonthlyIuran[] {
  const sums = new Map<string, number>();
  for (const p of payments) {
    const month = monthOf(p.paymentDate);
    sums.set(month, (sums.get(month) ?? 0) + p.amount);
  }
  return [...sums]
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

export function categoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  month: string,
): CategoryRow[] {
  return categories
    .map((category) => {
      const own = transactions.filter(
        (t) => t.categoryId === category.id && monthOf(t.date) === month,
      );
      const { income, expense } = totalsOf(own);
      return { category, income, expense };
    })
    .filter((row) => row.income > 0 || row.expense > 0);
}

/** Data e-statement kas besar satu bulan: saldo awal, mutasi dengan saldo berjalan, saldo akhir. */
export function statementFor(transactions: Transaction[], month: string): Statement {
  const opening = totalsOf(transactions.filter((t) => monthOf(t.date) < month)).net;

  const inMonth = transactions
    .filter((t) => monthOf(t.date) === month)
    .sort((a, b) => a.date.localeCompare(b.date) || a.number.localeCompare(b.number));

  let balance = opening;
  const rows = inMonth.map((transaction) => {
    balance += transaction.type === "income" ? transaction.amount : -transaction.amount;
    return { transaction, balance };
  });

  const { income, expense } = totalsOf(inMonth);
  return { month, opening, income, expense, closing: balance, rows };
}