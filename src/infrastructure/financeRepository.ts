import type { FinanceRepository } from "@/application/finance";
import type { FormOptions } from "@/domain/finance";
import { bucket, extensionOf, signedUrls } from "./storage";
import { db } from "./supabase";

/** Menerjemahkan error database menjadi pesan yang mudah dibaca. */
function failIf(error: { code: string; message: string } | null): void {
  if (!error) return;
  if (error.code === "23503") {
    throw new Error("Kategori, metode pembayaran, atau divisi tidak ditemukan.");
  }
  if (error.code === "23514") {
    throw new Error("Divisi wajib untuk pengeluaran dan tidak boleh ada untuk pemasukan.");
  }
  throw new Error(error.message);
}

async function loadOptions(): Promise<FormOptions> {
  const [categories, divisions, methods] = await Promise.all([
    db.from("categories").select("id,name").order("name"),
    db.from("divisions").select("id,name").order("name"),
    db.from("payment_methods").select("id,name,is_active").order("name"),
  ]);

  const error = categories.error ?? divisions.error ?? methods.error;
  if (error) throw new Error(error.message);

  return {
    categories: (categories.data ?? []).map((x) => ({ id: x.id, name: x.name })),
    divisions: (divisions.data ?? []).map((x) => ({ id: x.id, name: x.name })),
    paymentMethods: (methods.data ?? []).map((x) => ({
      id: x.id,
      name: x.name,
      isActive: x.is_active,
    })),
  };
}

export const financeRepository: FinanceRepository = {
  getFormOptions: loadOptions,

  async getFinance() {
    const [options, transactions] = await Promise.all([
      loadOptions(),
      db
        .from("transactions")
        .select(
          "id,transaction_number,type,category_id,payment_method_id,division_id,amount,transaction_date,note",
        )
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);
    if (transactions.error) throw new Error(transactions.error.message);

    return {
      ...options,
      transactions: (transactions.data ?? []).map((x) => ({
        id: x.id,
        number: x.transaction_number,
        type: x.type,
        categoryId: x.category_id,
        methodId: x.payment_method_id,
        divisionId: x.division_id,
        amount: x.amount,
        date: x.transaction_date,
        note: x.note,
      })),
    };
  },

  async getAttachment(transactionId) {
    const { data, error } = await db
      .from("transaction_attachments")
      .select("file_path,file_name")
      .eq("transaction_id", transactionId)
      .order("created_at")
      .limit(1);
    if (error) throw new Error(error.message);

    const row = data?.[0];
    if (!row) return null;

    const [url] = await signedUrls([row.file_path]);
    return url ? { name: row.file_name, url } : null;
  },

  async addTransaction(t, evidence) {
    const inserted = await db
      .from("transactions")
      .insert({
        type: t.type,
        category_id: t.categoryId,
        payment_method_id: t.methodId,
        division_id: t.divisionId,
        amount: t.amount,
        transaction_date: t.date,
        note: t.note || null,
      })
      .select("id,transaction_number")
      .single();
    failIf(inserted.error);

    const { id, transaction_number: number } = inserted.data!;

    // Tanpa nomor, nama file tidak bisa dibentuk. Batalkan agar tidak ada transaksi tanpa nomor.
    if (!number) {
      await db.from("transactions").delete().eq("id", id);
      throw new Error("Nomor transaksi belum terbentuk. Periksa trigger penomoran di database.");
    }

    if (!evidence) return;

    // Satu transaksi, satu bukti. Nama file mengikuti nomor: transactions/PPA-M001.jpg
    const path = `transactions/${number}.${extensionOf(evidence)}`;

    try {
      const { error } = await bucket().upload(path, evidence.bytes, { contentType: evidence.type });
      if (error) throw new Error(`Gagal mengunggah bukti: ${error.message}`);

      const attached = await db
        .from("transaction_attachments")
        .insert({ transaction_id: id, file_path: path, file_name: evidence.name });
      if (attached.error) throw new Error(attached.error.message);
    } catch (e) {
      await bucket().remove([path]);
      await db.from("transactions").delete().eq("id", id);
      throw e;
    }
  },

  async updateTransaction(id, t, evidence) {
    const current = await db
      .from("transactions")
      .select("transaction_number")
      .eq("id", id)
      .single();
    if (current.error) throw new Error("Transaksi tidak ditemukan.");
    const number = current.data.transaction_number;

    const updated = await db
      .from("transactions")
      .update({
        category_id: t.categoryId,
        payment_method_id: t.methodId,
        division_id: t.divisionId,
        amount: t.amount,
        transaction_date: t.date,
        note: t.note || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    failIf(updated.error);

    if (!evidence) return;

    // Bukti baru menggantikan yang lama. Nama file tetap mengikuti nomor transaksi.
    const old = await db.from("transaction_attachments").select("file_path").eq("transaction_id", id);
    const oldPaths = (old.data ?? []).map((r) => r.file_path);
    const path = `transactions/${number}.${extensionOf(evidence)}`;

    const { error } = await bucket().upload(path, evidence.bytes, {
      contentType: evidence.type,
      upsert: true,
    });
    if (error) throw new Error(`Data tersimpan, tetapi bukti gagal diunggah: ${error.message}`);

    await db.from("transaction_attachments").delete().eq("transaction_id", id);
    const attached = await db
      .from("transaction_attachments")
      .insert({ transaction_id: id, file_path: path, file_name: evidence.name });
    if (attached.error) throw new Error(attached.error.message);

    const stale = oldPaths.filter((p) => p !== path);
    if (stale.length > 0) await bucket().remove(stale);
  },

  async deleteTransaction(id) {
    const { data, error } = await db.rpc("delete_transaction", { p_id: id });
    if (error) throw new Error(error.message);

    const paths = (data ?? []) as string[];
    if (paths.length > 0) await bucket().remove(paths);
  },

  async addCategory(name) {
    const { error } = await db.from("categories").insert({ name });
    if (error) throw new Error(error.message);
  },
};