import { monthLabel, type MonthlyIuran, type MonthSummary } from "@/domain/statistics";
import { rupiah, rupiahSigned } from "@/shared/format";

interface Props {
  months: MonthSummary[];
  kasKecilMonths: MonthlyIuran[];
}

export function HomeStats({ months, kasKecilMonths }: Props) {
  return (
    <>
      {months.length > 0 && (
        <>
          <div className="sec-head">
            <h2>Ringkasan bulanan</h2>
          </div>
          <div className="card table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Pemasukan</th>
                  <th>Pengeluaran</th>
                  <th>Net</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {months.slice(0, 12).map((m) => (
                  <tr key={m.month}>
                    <td>{monthLabel(m.month)}</td>
                    <td className="income">{rupiah(m.income)}</td>
                    <td className="expense">{rupiah(m.expense)}</td>
                    <td>{rupiahSigned(m.net)}</td>
                    <td>{rupiahSigned(m.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {kasKecilMonths.length > 0 && (
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
      )}
    </>
  );
}