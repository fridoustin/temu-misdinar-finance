import type { IuranRepository } from "@/application/iuran";
import { WEEKLY_FEE, type AttachmentLink } from "@/domain/iuran";
import { db } from "./supabase";
import { BUCKET, SIGNED_URL_SECONDS, extensionOf } from "./storage";

export const iuranRepository: IuranRepository = {
  async getIuran() {
    const [members, periods, payments, methods] = await Promise.all([
      db
        .from("members")
        .select("id,name,nickname,join_date,status")
        .eq("status", "active")
        .order("id"),
      db.from("payment_periods").select("id,start_date,end_date").order("start_date"),
      db
        .from("payments")
        .select("id,payment_number,member_id,payment_method_id,payment_date,amount")
        .order("payment_date"),
      db.from("payment_methods").select("id,name,is_active").order("name"),
    ]);

    const error = members.error ?? periods.error ?? payments.error ?? methods.error;
    if (error) throw new Error(error.message);

    return {
      weeklyFee: WEEKLY_FEE,
      members: (members.data ?? []).map((x) => ({
        id: x.id,
        name: x.name,
        nickname: x.nickname,
        joinDate: x.join_date,
        status: x.status,
      })),
      periods: (periods.data ?? []).map((x) => ({
        id: x.id,
        startDate: x.start_date,
        endDate: x.end_date,
      })),
      payments: (payments.data ?? []).map((x) => ({
        id: x.id,
        number: x.payment_number,
        memberId: x.member_id,
        methodId: x.payment_method_id,
        paymentDate: x.payment_date,
        amount: x.amount,
      })),
      paymentMethods: (methods.data ?? []).map((x) => ({
        id: x.id,
        name: x.name,
        isActive: x.is_active,
      })),
    };
  },

  async getAttachments(memberId) {
    const owned = await db.from("payments").select("id").eq("member_id", memberId);
    if (owned.error) throw new Error(owned.error.message);

    const paymentIds = (owned.data ?? []).map((p) => p.id);
    if (paymentIds.length === 0) return [];

    const rows = await db
      .from("payment_attachments")
      .select("payment_id,file_path,file_name")
      .in("payment_id", paymentIds)
      .order("created_at");
    if (rows.error) throw new Error(rows.error.message);

    const files = rows.data ?? [];
    if (files.length === 0) return [];

    const signed = await db.storage
      .from(BUCKET)
      .createSignedUrls(files.map((f) => f.file_path), SIGNED_URL_SECONDS);
    if (signed.error) throw new Error(signed.error.message);

    return files.flatMap((f, i): AttachmentLink[] => {
      const url = signed.data[i]?.signedUrl;
      return url ? [{ paymentId: f.payment_id, name: f.file_name, url }] : [];
    });
  },

  async recordPayment(p, evidence) {
    const inserted = await db
      .from("payments")
      .insert({
        member_id: p.memberId,
        payment_date: p.paymentDate,
        amount: p.amount,
        payment_method_id: p.methodId,
      })
      .select("id,payment_number")
      .single();

    if (inserted.error?.code === "23503") {
      throw new Error("Anggota atau metode pembayaran tidak ditemukan.");
    }
    if (inserted.error) throw new Error(inserted.error.message);

    const { id, payment_number: number } = inserted.data;

    // Tanpa nomor, nama file tidak bisa dibentuk. Batalkan agar tidak ada pembayaran tanpa nomor.
    if (!number) {
      await db.from("payments").delete().eq("id", id);
      throw new Error("Nomor pembayaran belum terbentuk. Periksa trigger penomoran di database.");
    }

    if (!evidence) return;

    // Satu pembayaran, satu bukti. Nama file mengikuti nomor: payments/M005/PPA-I008.jpg
    const path = `payments/${p.memberId}/${number}.${extensionOf(evidence)}`;
    const storage = db.storage.from(BUCKET);

    try {
      const { error } = await storage.upload(path, evidence.bytes, { contentType: evidence.type });
      if (error) throw new Error(`Gagal mengunggah bukti: ${error.message}`);

      const attached = await db
        .from("payment_attachments")
        .insert({ payment_id: id, file_path: path, file_name: evidence.name });
      if (attached.error) throw new Error(attached.error.message);
    } catch (e) {
      await storage.remove([path]);
      await db.from("payments").delete().eq("id", id);
      throw e;
    }
  },
};