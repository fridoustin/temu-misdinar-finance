import {
  Category,
  FinanceData,
  FormOptions,
  NewTransaction,
  Totals,
  TransactionAttachment,
  totalsOf,
} from "@/domain/finance";
import { Evidence, MAX_EVIDENCE_BYTES, isEvidenceType } from "@/domain/iuran";

/** Port: diimplementasikan oleh layer infrastructure. */
export interface FinanceRepository {
  getFinance(): Promise<FinanceData>;
  getFormOptions(): Promise<FormOptions>;
  getAttachment(transactionId: string): Promise<TransactionAttachment | null>;
  addTransaction(t: NewTransaction, evidence: Evidence | null): Promise<void>;
  addCategory(name: string): Promise<void>;
}

export interface CategorySummary extends Totals {
  category: Category;
  count: number;
}

export function summarizeByCategory(data: FinanceData): CategorySummary[] {
  return data.categories.map((category) => {
    const own = data.transactions.filter((t) => t.categoryId === category.id);
    return { category, count: own.length, ...totalsOf(own) };
  });
}

export async function addTransaction(
  repo: FinanceRepository,
  t: NewTransaction,
  evidence: Evidence | null,
): Promise<void> {
  const isExpense = t.type === "expense";

  if (t.type !== "income" && t.type !== "expense") {
    throw new Error("Jenis transaksi tidak valid.");
  }
  if (!Number.isInteger(t.amount) || t.amount <= 0) {
    throw new Error("Nominal harus lebih dari Rp0.");
  }
  if (!t.categoryId) {
    throw new Error("Kategori wajib dipilih.");
  }
  if (!t.methodId) {
    throw new Error(isExpense ? "Sumber dana wajib dipilih." : "Metode pembayaran wajib dipilih.");
  }
  if (isExpense && !t.divisionId) {
    throw new Error("Divisi wajib dipilih untuk pengeluaran.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
    throw new Error("Tanggal tidak valid.");
  }
  if (evidence && !isEvidenceType(evidence.type)) {
    throw new Error("Bukti harus berupa foto atau PDF.");
  }
  if (evidence && evidence.bytes.byteLength > MAX_EVIDENCE_BYTES) {
    throw new Error("Ukuran bukti maksimal 4 MB.");
  }

  await repo.addTransaction(
    { ...t, note: t.note.trim(), divisionId: isExpense ? t.divisionId : null },
    evidence,
  );
}

export async function addCategory(repo: FinanceRepository, name: string): Promise<void> {
  const clean = name.trim();
  if (!clean) {
    throw new Error("Nama kategori wajib diisi.");
  }
  await repo.addCategory(clean);
}