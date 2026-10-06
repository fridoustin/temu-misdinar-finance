import { monthLabel, type MonthlyIuran } from "@/domain/statistics";
import { rupiah } from "@/shared/format";

export function HomeStats({ kasKecilMonths }: { kasKecilMonths: MonthlyIuran[] }) {
  if (kasKecilMonths.length === 0) return null;

  return (
    <>
      <div className="sec-head">
        <h2>Kas Kecil per bulan</h2>
      </div>
      <div className="card table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Iuran terkumpul</th>
            </tr>
          </thead>
          <tbody>
            {kasKecilMonths.slice(0, 12).map((m) => (
              <tr key={m.month}>
                <td>{monthLabel(m.month)}</td>
                <td>{rupiah(m.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}