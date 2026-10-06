import { useState } from "react";
import { totalsByMethod, type IuranData } from "@/domain/iuran";
import { monthLabel, monthlyIuran } from "@/domain/statistics";
import { rupiah } from "@/shared/format";
import { Select } from "@/components/ui/Select";

const METHOD_COLORS = ["#4A2C20", "#B8895B", "#527A5A", "#A65D55"];
const colorAt = (i: number) => METHOD_COLORS[i % METHOD_COLORS.length];

export function MethodTotals({ data }: { data: IuranData }) {
  const [month, setMonth] = useState(""); // kosong = semua waktu

  const rows = totalsByMethod(data, month);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const options = [
    { value: "", label: "Semua waktu" },
    ...monthlyIuran(data.payments).map((m) => ({ value: m.month, label: monthLabel(m.month) })),
  ];

  return (
    <section className="card method-card">
      <div className="method-head">
        <div>
          <small className="muted">Total per metode</small>
          <b className="method-sum">{rupiah(total)}</b>
        </div>
        <Select
          compact
          searchable={false}
          title="Pilih periode"
          value={month}
          options={options}
          onChange={setMonth}
        />
      </div>

      {rows.length === 0 ? (
        <p className="cap">Belum ada pembayaran.</p>
      ) : (
        <>
          <div className="split">
            {rows.map((r, i) => (
              <span
                key={r.method.id}
                className="split-seg"
                style={{ width: `${(r.amount / total) * 100}%`, background: colorAt(i) }}
              />
            ))}
          </div>

          <ul className="method-grid">
            {rows.map((r, i) => (
              <li key={r.method.id}>
                <span className="method-name">
                  <span className="swatch" style={{ background: colorAt(i) }} />
                  {r.method.name}
                </span>
                <b>{rupiah(r.amount)}</b>
                <small className="muted">{r.count} pembayaran</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}