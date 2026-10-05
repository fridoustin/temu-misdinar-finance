"use client";

import { Paperclip } from "lucide-react";
import {
  categoryName,
  nameById,
  type FinanceData,
  type Transaction,
  type TransactionAttachment,
} from "@/domain/finance";
import { dayLong, rupiah } from "@/shared/format";
import { useGoBack } from "@/hooks/useGoBack";
import { PageHeader } from "@/components/ui/PageHeader";

interface Props {
  data: FinanceData;
  transaction: Transaction;
  attachment: TransactionAttachment | null;
}

export function TransactionDetail({ data, transaction: t, attachment }: Props) {
  const goBack = useGoBack("/finance");
  const isIncome = t.type === "income";
  const typeLabel = isIncome ? "Pemasukan" : "Pengeluaran";

  const rows: [string, string][] = [
    ["Kategori", categoryName(data.categories, t.categoryId)],
    [isIncome ? "Metode pembayaran" : "Sumber dana", nameById(data.paymentMethods, t.methodId)],
  ];
  if (!isIncome) rows.push(["Divisi", nameById(data.divisions, t.divisionId)]);
  rows.push(["Tanggal", dayLong(t.date)]);
  if (t.note) rows.push(["Catatan", t.note]);

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
    </>
  );
}