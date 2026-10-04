"use server";

import { revalidatePath } from "next/cache";
import { recordPayment } from "@/application/iuran";
import type { Evidence } from "@/domain/iuran";
import { iuranRepository } from "@/infrastructure/iuranRepository";

type Result = { error?: string };

export async function recordPaymentAction(formData: FormData): Promise<Result> {
  try {
      const file = formData.get("file");
      const evidence: Evidence | null =
        file instanceof File && file.size > 0
          ? { name: file.name, type: file.type, bytes: await file.arrayBuffer() }
          : null;

    await recordPayment(
      iuranRepository,
      {
        memberId: String(formData.get("memberId") ?? ""),
        paymentDate: String(formData.get("paymentDate") ?? ""),
        amount: Number(formData.get("amount")),
        methodId: String(formData.get("methodId") ?? ""),
      },
      evidence,
    );
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/", "layout"); // Iuran, detail anggota, dan Kas Kecil di Home ikut diperbarui
  return {};
}