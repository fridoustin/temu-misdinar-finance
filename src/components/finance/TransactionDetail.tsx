"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Pencil, Trash2 } from "lucide-react";
import { deleteTransactionAction } from "@/app/finance/action";
import {
  categoryName,
  nameById,
  type FinanceData,
  type Transaction,
  type TransactionAttachment,
} from "@/domain/finance";
import { dayLong, rupiah } from "@/shared/format";
import { useGoBack } from "@/hooks/useGoBack";
import { ConfirmSheet } from "@/components/ui/ConfirmSheet";
import { PageHeader } from "@/components/ui/PageHeader";
import { TransactionSheet } from "./TransactionSheet";

interface Props {
  data: FinanceData;
  transaction: Transaction;
  attachment: TransactionAttachment | null;
}

export function TransactionDetail({ data, transaction: t, attachment }: Props) {
  const router = useRouter();
  const goBack = useGoBack("/finance");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isIncome = t.type === "income";
  const typeLabel = isIncome ? "Pemasukan" : "Pengeluaran";

  const rows: [string, string][] = [
    ["Kategori", categoryName(data.categories, t.categoryId)],
    [isIncome ? "Metode pembayaran" : "Sumber dana", nameById(data.paymentMethods, t.methodId)],
  ];
  if (!isIncome) rows.push(["Divisi", nameById(data.divisions, t.divisionId)]);
  rows.push(["Tanggal", dayLong(t.date)]);
  if (t.note) rows.push(["Catatan", t.note]);

  async function remove(): Promise<string | void> {
    const result = await deleteTransactionAction(t.id);
    if (result.error) return result.error;
    router.replace("/finance"); // halaman ini sudah tidak ada, jadi jangan ditinggalkan di riwayat
  }

  return (
    <>
      <PageHeader title={t.number} subtitle={typeLabel} onBack={goBack} />

      <section className="hero compact">
        <p>{typeLabel}</p>
        <h1>
          {isIncome ? "+" : "-"} {rupiah(t.amount)}
        </h1>
      </section>

      <ul className="list card">
        {rows.map(([label, value]) => (
          <li key={label} className="prow">
            <span className="muted">{label}</span>
            <span className="prow-value">{value}</span>
          </li>
        ))}
      </ul>

      <h4 className="day">Bukti</h4>
      {attachment ? (
        <ul className="list card">
          <li className="prow">
            <a className="proof" href={attachment.url} target="_blank" rel="noreferrer">
              <Paperclip />
              {attachment.name}
            </a>
          </li>
        </ul>
      ) : (
        <p className="cap">Tidak ada bukti.</p>
      )}

      <div className="btn-row">
        <button className="btn outline" onClick={() => setEditing(true)}>
          <Pencil />
          Edit
        </button>
        <button className="btn danger" onClick={() => setDeleting(true)}>
          <Trash2 />
          Hapus
        </button>
      </div>

      {editing && (
        <TransactionSheet
          options={data}
          transaction={t}
          currentProof={attachment?.name ?? null}
          onClose={() => setEditing(false)}
          onDone={() => setEditing(false)}
        />
      )}
      {deleting && (
        <ConfirmSheet
          title="Hapus transaksi?"
          message={`${t.number} (${rupiah(t.amount)}) akan dihapus permanen beserta buktinya. Nomor ini tidak akan dipakai lagi.`}
          confirmLabel="Hapus transaksi"
          onConfirm={remove}
          onClose={() => setDeleting(false)}
        />
      )}
    </>
  );
}