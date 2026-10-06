import {
  Category,
  FinanceData,
  FormOptions,
  NewTransaction,
  TransactionAttachment,
  TransactionType,
  categoriesFor,
} from "@/domain/finance";
import { Evidence, MAX_EVIDENCE_BYTES, isEvidenceType } from "@/domain/iuran";

/** Port: diimplementasikan oleh layer infrastructure. */
export interface FinanceRepository {
  getFinance(): Promise<FinanceData>;
  getFormOptions(): Promise<FormOptions>;
  getAttachment(transactionId: string): Promise<TransactionAttachment | null>;
  addTransaction(t: NewTransaction, evidence: Evidence | null): Promise<void>;
  updateTransaction(id: string, t: NewTransaction, evidence: Evidence | null): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
  addCategory(name: string): Promise<void>;
}

export interface CategorySummary {
  category: Category;
  count: number;
  amount: number;
}

export function summarizeByCategory(data: FinanceData, type: TransactionType): CategorySummary[] {
  return categoriesFor(type, data.categories).map((category) => {
    const own = data.transactions.filter((t) => t.categoryId === category.id && t.type === type);
    return { category, count: own.length, amount: own.reduce((sum, t) => sum + t.amount, 0) };
  });
}

function validate(t: NewTransaction, evidence: Evidence | null): void {
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
}

const normalize = (t: NewTransaction): NewTransaction => ({
  ...t,
  note: t.note.trim(),
  divisionId: t.type === "expense" ? t.divisionId : null,
});

export async function addTransaction(
  repo: FinanceRepository,
  t: NewTransaction,
  evidence: Evidence | null,
): Promise<void> {
  validate(t, evidence);
  await repo.addTransaction(normalize(t), evidence);
}

/** Jenis transaksi tidak bisa diubah, karena nomornya (M atau K) ditentukan oleh jenisnya. */
export async function updateTransaction(
  repo: FinanceRepository,
  id: string,
  t: NewTransaction,
  evidence: Evidence | null,
): Promise<void> {
  if (!id) throw new Error("Transaksi tidak ditemukan.");
  validate(t, evidence);
  await repo.updateTransaction(id, normalize(t), evidence);
}

export async function deleteTransaction(repo: FinanceRepository, id: string): Promise<void> {
  if (!id) throw new Error("Transaksi tidak ditemukan.");
  await repo.deleteTransaction(id);
}

export async function addCategory(repo: FinanceRepository, name: string): Promise<void> {
  const clean = name.trim();
  if (!clean) {
    throw new Error("Nama kategori wajib diisi.");
  }
  await repo.addCategory(clean);
}