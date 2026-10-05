"use server";

import { revalidatePath } from "next/cache";
import {
  addCategory,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/application/finance";
import type { NewTransaction, TransactionType } from "@/domain/finance";
import { financeRepository } from "@/infrastructure/financeRepository";
import { evidenceFrom } from "@/shared/evidence";

type Result = { error?: string };

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

const transactionFrom = (form: FormData): NewTransaction => ({
  type: text(form, "type") as TransactionType,
  categoryId: text(form, "categoryId"),
  methodId: text(form, "methodId"),
  divisionId: text(form, "divisionId") || null,
  amount: Number(form.get("amount")),
  date: text(form, "date"),
  note: text(form, "note"),
});

/** Menjalankan tugas, lalu menyegarkan Finance, Kategori, dan Home. */
async function run(task: () => Promise<void>): Promise<Result> {
  try {
    await task();
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function addTransactionAction(form: FormData): Promise<Result> {
  return run(async () =>
    addTransaction(financeRepository, transactionFrom(form), await evidenceFrom(form)),
  );
}

export async function updateTransactionAction(id: string, form: FormData): Promise<Result> {
  return run(async () =>
    updateTransaction(financeRepository, id, transactionFrom(form), await evidenceFrom(form)),
  );
}

export async function deleteTransactionAction(id: string): Promise<Result> {
  return run(() => deleteTransaction(financeRepository, id));
}

export async function addCategoryAction(name: string): Promise<Result> {
  return run(() => addCategory(financeRepository, name));
}