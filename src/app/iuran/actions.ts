"use server";

import { revalidatePath } from "next/cache";
import { recordPayment } from "@/application/iuran";
import { iuranRepository } from "@/infrastructure/iuranRepository";
import { evidenceFrom } from "@/shared/evidence";
import { requireAdmin } from "@/infrastructure/auth";

type Result = { error?: string };

export async function recordPaymentAction(formData: FormData): Promise<Result> {
  try {
    await requireAdmin();
    const evidence = await evidenceFrom(formData);
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