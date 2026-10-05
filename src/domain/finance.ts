export type TransactionType = "income" | "expense";
import type { PaymentMethod } from "@/domain/iuran";

export const TARGET_DANA = 250_000_000;

export const INCOME_CATEGORIES = [
  "Donasi",
  "Sponsorship",
  "Cari Dana",
  "Penjualan",
  "Lainnya",
];

export const EXPENSE_CATEGORIES = [
  "Honorarium",
  "Konsumsi",
  "Perlengkapan",
  "Transportasi",
  "Dekorasi",
  "Produksi",
  "Pakaian/Kostum",
  "Administrasi",
  "Lainnya",
];

export const KAS_KECIL_CATEGORIES = ["Iuran"];

export interface Category {
  id: string;
  name: string;
}

export interface Division {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  number: string; // PPA-M001 atau PPA-K001
  type: TransactionType;
  categoryId: string;
  methodId: string; // metode pembayaran (pemasukan) atau sumber dana (pengeluaran)
  divisionId: string | null; // wajib untuk pengeluaran
  amount: number;
  date: string;
  note: string | null;
}

export interface NewTransaction {
  type: TransactionType;
  categoryId: string;
  methodId: string;
  divisionId: string | null;
  amount: number;
  date: string;
  note: string;
}

export interface TransactionAttachment {
  name: string;
  url: string;
}

/** Pilihan untuk form transaksi. */
export interface FormOptions {
  categories: Category[];
  divisions: Division[];
  paymentMethods: PaymentMethod[];
}

export const EMPTY_OPTIONS: FormOptions = { categories: [], divisions: [], paymentMethods: [] };

export interface FinanceData extends FormOptions {
  transactions: Transaction[];
}

export interface Totals {
  income: number;
  expense: number;
  net: number;
}

export interface TransactionFilter {
  type: "all" | TransactionType;
  query: string;
  categoryId: string; // kosong = semua kategori
  from: string; // kosong = semua tanggal
}

export const nameById = (
  list: { id: string; name: string }[],
  id: string | null,
  fallback = "-",
): string => list.find((x) => x.id === id)?.name ?? fallback;

export const categoryName = (categories: Category[], id: string): string =>
  nameById(categories, id, "Tanpa kategori");

export const totalsOf = (list: Transaction[]): Totals => {
  const sumOf = (type: TransactionType) =>
    list.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);

  const income = sumOf("income");
  const expense = sumOf("expense");
  return { income, expense, net: income - expense };
};

export const filterTransactions = (
  list: Transaction[],
  filter: TransactionFilter,
  categories: Category[],
): Transaction[] => {
  const query = filter.query.trim().toLowerCase();

  return list
    .filter((t) => {
      const text =
        `${t.number} ${t.note ?? ""} ${categoryName(categories, t.categoryId)}`.toLowerCase();
      return (
        (filter.type === "all" || t.type === filter.type) &&
        (!filter.categoryId || t.categoryId === filter.categoryId) &&
        (!filter.from || t.date >= filter.from) &&
        (!query || text.includes(query))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));
};

/** Mengelompokkan per tanggal. Urutan grup mengikuti urutan list. */
export const groupByDate = (list: Transaction[]): [string, Transaction[]][] => {
  const groups = new Map<string, Transaction[]>();
  for (const t of list) {
    groups.set(t.date, [...(groups.get(t.date) ?? []), t]);
  }
  return [...groups];
};

export const categoriesFor = (type: TransactionType, categories: Category[]): Category[] => {
  const names = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const known = new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...KAS_KECIL_CATEGORIES]);

  const ordered = names
    .map((name) => categories.find((c) => c.name === name))
    .filter((c): c is Category => c !== undefined);

  return [...ordered, ...categories.filter((c) => !known.has(c.name))];
};