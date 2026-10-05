"use server";

import { revalidatePath } from "next/cache";
import { addCategory, addTransaction } from "@/application/finance";
import type { TransactionType } from "@/domain/finance";
import { financeRepository } from "@/infrastructure/financeRepository";
import { evidenceFrom } from "@/shared/evidence";

type Result = { error?: string };

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

function refresh() {
  revalidatePath("/", "layout"); // Finance, Kategori, dan Home ikut diperbarui
}

export async function addTransactionAction(form: FormData): Promise<Result> {
  try {
    await addTransaction(
      financeRepository,
      {
        type: text(form, "type") as TransactionType,
        categoryId: text(form, "categoryId"),
        methodId: text(form, "methodId"),
        divisionId: text(form, "divisionId") || null,
        amount: Number(form.get("amount")),
        date: text(form, "date"),
        note: text(form, "note"),
      },
      await evidenceFrom(form),
    );
  } catch (e) {
    return { error: (e as Error).message };
  }
  refresh();
  return {};
}

export async function addCategoryAction(name: string): Promise<Result> {
  try {
    await addCategory(financeRepository, name);
  } catch (e) {
    return { error: (e as Error).message };
  }
  refresh();
  return {};
}