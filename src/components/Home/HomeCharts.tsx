import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import type { FinanceData } from "@/domain/finance";
import {
  cashflowOf,
  expenseByDivision,
  monthLabel,
  type MonthSummary,
} from "@/domain/statistics";
import { rupiah, rupiahCompact, rupiahSigned, shortName } from "@/shared/format";
import { Donut } from "@/components/ui/Donut";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";

interface Props {
  months: MonthSummary[];
  finance: Pick<FinanceData, "transactions" | "divisions">;
}

type Panel = "expense" | "cashflow";

const DIVISION_COLORS = [
  "#4A2C20",
  "#B8895B",
  "#527A5A",
  "#A65D55",
  "#795548",
  "#D8C3A5",
  "#8C6A4F",
  "#6B8F71",
];
const colorAt = (i: number) => DIVISION_COLORS[i % DIVISION_COLORS.length];

/** Atribut agar elemen non-tombol bisa ditekan dan diakses lewat keyboard. */
const pressable = (action: () => void) => ({
  role: "button",
  tabIndex: 0,
  onClick: action,
  onKeyDown: (e: KeyboardEvent) => e.key === "Enter" && action(),
});

export function HomeCharts({ months, finance }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(months[0]?.month ?? "");
  const [panel, setPanel] = useState<Panel>("expense");
  const [expenseIdx, setExpenseIdx] = useState<number | null>(null);
  const [flowIdx, setFlowIdx] = useState<number | null>(null);

  if (months.length === 0) {
    return <EmptyState title="Belum ada statistik" text="Grafik muncul setelah ada transaksi." />;
  }

  const byDivision = expenseByDivision(finance.transactions, finance.divisions, selected);
  const flow = cashflowOf(finance.transactions, selected);
  const flowRows = [
    { name: "Pemasukan", short: "Masuk", amount: flow.income, color: "var(--income)" },
    { name: "Pengeluaran", short: "Keluar", amount: flow.expense, color: "var(--expense)" },
  ];
  const flowTotal = flow.income + flow.expense;
  const label = monthLabel(selected);

  const activeDivision = expenseIdx !== null ? byDivision[expenseIdx] : null;
  const activeFlow = flowIdx !== null ? flowRows[flowIdx] : null;

  function changeMonth(month: string) {
    setSelected(month);
    setExpenseIdx(null);
    setFlowIdx(null);
  }

  function pickExpense(index: number | null) {
    setExpenseIdx(index);
    setPanel("expense");
  }

  function pickFlow(index: number | null) {
    setFlowIdx(index);
    setPanel("cashflow");
  }

  return (
    <>
      <Select
        title="Pilih bulan"
        value={selected}
        onChange={changeMonth}
        options={months.map((m) => ({ value: m.month, label: monthLabel(m.month) }))}
      />

      <div className="donut-grid">
        <div
          className={"card donut-card" + (panel === "expense" ? " on" : "")}
          {...pressable(() => setPanel("expense"))}
        >
          <b>Pengeluaran</b>
          <Donut
            segments={byDivision.map((d, i) => ({ value: d.amount, color: colorAt(i) }))}
            activeIndex={expenseIdx}
            onSelect={pickExpense}
          >
            {activeDivision ? (
              <>
                <small>{shortName(activeDivision.name)}</small>
                <b>{rupiahCompact(activeDivision.amount)}</b>
                <small>{Math.round(activeDivision.share * 100)}%</small>
              </>
            ) : (
              <>
                <small>Total</small>
                <b>{rupiahCompact(flow.expense)}</b>
              </>
            )}
          </Donut>
          <small className="muted">Per divisi</small>
        </div>

        <div
          className={"card donut-card" + (panel === "cashflow" ? " on" : "")}
          {...pressable(() => setPanel("cashflow"))}
        >
          <b>Cashflow</b>
          <Donut
            segments={flowRows.map((r) => ({ value: r.amount, color: r.color }))}
            activeIndex={flowIdx}
            onSelect={pickFlow}
          >
            {activeFlow ? (
              <>
                <small>{activeFlow.short}</small>
                <b>{rupiahCompact(activeFlow.amount)}</b>
                <small>{Math.round((activeFlow.amount / (flowTotal || 1)) * 100)}%</small>
              </>
            ) : (
              <>
                <small>Net</small>
                <b>{rupiahCompact(flow.net)}</b>
              </>
            )}
          </Donut>
          <small className="muted">Masuk dan keluar</small>
        </div>
      </div>

      {panel === "expense" ? (
        <section className="card detail">
          <div className="detail-head">
            <b>Pengeluaran per divisi</b>
            <span>{rupiah(flow.expense)}</span>
          </div>
          {byDivision.length === 0 ? (
            <p className="cap">Belum ada pengeluaran pada bulan ini.</p>
          ) : (
            <ul className="rank">
              {byDivision.map((d, i) => (
                <li
                  key={d.id || "none"}
                  className={i === expenseIdx ? "on" : ""}
                  {...pressable(() => pickExpense(i === expenseIdx ? null : i))}
                >
                  <span className="swatch" style={{ background: colorAt(i) }} />
                  <span className="rank-name">
                    {d.name}
                    <small>{Math.round(d.share * 100)}%</small>
                  </span>
                  <b>{rupiah(d.amount)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="card detail">
          <div className="detail-head">
            <b>Cashflow</b>
            <span>{rupiahSigned(flow.net)}</span>
          </div>
          <ul className="rank">
            {flowRows.map((r, i) => (
              <li
                key={r.name}
                className={i === flowIdx ? "on" : ""}
                {...pressable(() => pickFlow(i === flowIdx ? null : i))}
              >
                <span className="swatch" style={{ background: r.color }} />
                <span className="rank-name">{r.name}</span>
                <b>{rupiah(r.amount)}</b>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button className="btn outline" onClick={() => router.push(`/statement/${selected}`)}>
        <FileText />
        E-statement {label}
      </button>
    </>
  );
}