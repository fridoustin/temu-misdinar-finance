"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Plus } from "lucide-react";
import { AttachmentLink, IuranData, Member, isPaid, joinIndex } from "@/domain/iuran";
import { dayLong, dayShort, rupiah } from "@/shared/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pill } from "@/components/ui/Pill";
import { PaymentSheet } from "./PaymentSheet";
import { useIsAdmin } from "../layout/AdminProvider";

interface Props {
  data: IuranData;
  member: Member;
  attachments: AttachmentLink[];
}

export function MemberDetail({ data, member: m, attachments }: Props) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [paying, setPaying] = useState(false);

  const paid = data.periods.map((_, i) => isPaid(m, i, data));
  const last = paid.lastIndexOf(true);
  const next = data.periods[Math.max(last + 1, joinIndex(m, data.periods))];
  const periodRows = [
    ...data.periods.filter((_, i) => paid[i]).map((p) => ({ p, ok: true })),
    ...(next ? [{ p: next, ok: false }] : []),
  ];

  const payments = data.payments
    .filter((p) => p.memberId === m.id)
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  const methodName = (id: string) => data.paymentMethods.find((x) => x.id === id)?.name ?? "-";

  // Jika halaman dibuka langsung lewat link (tanpa riwayat), kembali ke daftar iuran.
  const goBack = () => (window.history.length > 1 ? router.back() : router.push("/iuran"));

  return (
    <>
      <PageHeader title={m.name} subtitle={m.nickname} onBack={goBack} />

      <section className="hero compact">
        <p>Status pembayaran</p>
        <h1>
          {last >= 0 ? "Lunas sampai " + dayLong(data.periods[last].endDate) : "Belum ada pembayaran"}
        </h1>
      </section>

      {isAdmin && (
        <button className="btn" onClick={() => setPaying(true)}>
          <Plus />
          Catat Pembayaran
        </button>
      )}

      <h4 className="day">Riwayat</h4>
      <ul className="list card">
        {payments.length === 0 && <li className="prow muted">Belum ada riwayat</li>}
        {payments.map((p) => (
          <li key={p.id} className="prow">
            <div className="prow-main">
              <b>{p.number}</b>
              <small className="muted">
                {dayShort(p.paymentDate)} - {methodName(p.methodId)}
              </small>
              {attachments
                .filter((a) => a.paymentId === p.id)
                .map((a) => (
                  <a key={a.url} className="proof" href={a.url} target="_blank" rel="noreferrer">
                    <Paperclip />
                    {a.name}
                  </a>
                ))}
            </div>
            <div className="prow-amount">
              <b>{rupiah(p.amount)}</b>
              <small className="muted">{Math.floor(p.amount / data.weeklyFee)} minggu</small>
            </div>
          </li>
        ))}
      </ul>

      <h4 className="day">Periode</h4>
      <ul className="list card">
        {periodRows.map(({ p, ok }) => (
          <li key={p.id} className="prow">
            <span>
              {dayShort(p.startDate)} - {dayShort(p.endDate)}
            </span>
            <Pill ok={ok}>{ok ? "Lunas" : "Belum Lunas"}</Pill>
          </li>
        ))}
      </ul>

      {paying && (
        <PaymentSheet
          data={data}
          memberId={m.id}
          onClose={() => setPaying(false)}
          onDone={() => setPaying(false)}
        />
      )}
    </>
  );
}