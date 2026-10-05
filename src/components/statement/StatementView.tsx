"use client";

import { Printer } from "lucide-react";
import { categoryName, type Category } from "@/domain/finance";
import { monthLabel, type Statement } from "@/domain/statistics";
import { dayLong, dayShort, rupiah, rupiahSigned, todayIso } from "@/shared/format";
import { useGoBack } from "@/hooks/useGoBack";
import { PageHeader } from "@/components/ui/PageHeader";

interface Props {
  statement: Statement;
  categories: Category[];
}

export function StatementView({ statement: s, categories }: Props) {
  const goBack = useGoBack("/");

  return (
    <>
      <div className="no-print">
        <PageHeader
          title="E-Statement"
          subtitle={monthLabel(s.month)}
          onBack={goBack}
          action={
            <button className="btn small" onClick={() => window.print()}>
              <Printer />
              Cetak / PDF
            </button>
          }
        />
      </div>

      <article className="card statement">
        <header className="st-head">
          <div>
            <b>TEMU MISDINAR FINANCE</b>
            <small>E-Statement Kas Besar</small>
          </div>
          <div className="st-meta">
            <small>Periode</small>
            <b>{monthLabel(s.month)}</b>
            <small>Dicetak {dayLong(todayIso())}</small>
          </div>
        </header>

        <div className="st-summary">
          <span>
            Saldo awal<b>{rupiahSigned(s.opening)}</b>
          </span>
          <span>
            Saldo akhir<b>{rupiahSigned(s.closing)}</b>
          </span>
          <span>
            Total masuk<b className="income">{rupiah(s.income)}</b>
          </span>
          <span>
            Total keluar<b className="expense">{rupiah(s.expense)}</b>
          </span>
        </div>

        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>No. Transaksi</th>
                <th className="st-desc">Keterangan</th>
                <th>Masuk</th>
                <th>Keluar</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="st-open">
                <td colSpan={5}>Saldo awal</td>
                <td>{rupiahSigned(s.opening)}</td>
              </tr>
              {s.rows.length === 0 && (
                <tr>
                  <td colSpan={6}>Tidak ada transaksi pada bulan ini.</td>
                </tr>
              )}
              {s.rows.map(({ transaction: t, balance }) => (
                <tr key={t.id}>
                  <td>{dayShort(t.date)}</td>
                  <td>{t.number}</td>
                  <td className="st-desc">
                    {t.note || categoryName(categories, t.categoryId)}
                    <small>{categoryName(categories, t.categoryId)}</small>
                  </td>
                  <td>{t.type === "income" ? rupiah(t.amount) : ""}</td>
                  <td>{t.type === "expense" ? rupiah(t.amount) : ""}</td>
                  <td>{rupiahSigned(balance)}</td>
                </tr>
              ))}
              <tr className="st-total">
                <td colSpan={3}>Total</td>
                <td>{rupiah(s.income)}</td>
                <td>{rupiah(s.expense)}</td>
                <td>{rupiahSigned(s.closing)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}