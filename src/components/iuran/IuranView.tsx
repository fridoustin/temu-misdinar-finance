"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { IuranData, currentPeriodIndex } from "@/domain/iuran";
import { periodOverview, totalCollected } from "@/application/iuran";
import { rupiah, todayIso } from "@/shared/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { IuranSummary } from "./IuranSummary";
import { MemberList } from "./MemberList";
import { PaymentSheet } from "./PaymentSheet";
import { PeriodCard } from "./PeriodCard";
import { PeriodSelector } from "./PeriodSelector";
import { MethodTotals } from "./MethodTotals";
import { useIsAdmin } from "@/components/layout/AdminProvider";

type Filter = "all" | "paid" | "unpaid";

const FILTERS: readonly (readonly [Filter, string])[] = [
  ["all", "Semua"],
  ["paid", "Sudah Bayar"],
  ["unpaid", "Belum Bayar"],
];

export function IuranView({ data }: { data: IuranData }) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [sel, setSel] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [paying, setPaying] = useState(false);
  const curIdx = currentPeriodIndex(data.periods, todayIso());
  const idx = sel ?? curIdx;

  if (!data.periods.length) {
    return <EmptyState title="Periode iuran belum dibuat" text="Isi tabel payment_periods di Supabase." />;
  }

  const cur = periodOverview(data, curIdx);
  const p = periodOverview(data, idx);
  const term = q.trim().toLowerCase();
  const rows = p.rows.filter(
    (r) =>
      (filter === "all" || r.paid === (filter === "paid")) &&
      (!term || r.member.name.toLowerCase().includes(term)),
  );

  return (
    <>
      <PageHeader
        title="Iuran Misdinar"
        subtitle={`Iuran Mingguan ${rupiah(data.weeklyFee)} / minggu`}
        action={
          isAdmin ? (
            <button className="btn small" onClick={() => setPaying(true)}>
              <Plus />
              Catat Pembayaran
            </button>
          ) : undefined
        }
      />
      <IuranSummary total={cur.total} paid={cur.paidCount} collected={totalCollected(data)} />
      <MethodTotals data={data} />
      <PeriodSelector periods={data.periods} selected={idx} onSelect={setSel} />
      <PeriodCard title={idx === curIdx ? "Iuran Minggu Ini" : `Iuran Minggu ${idx + 1}`} overview={p} />
      <SearchInput value={q} onChange={setQ} placeholder="Cari anggota" />
      <FilterChips<Filter> options={FILTERS} value={filter} onChange={setFilter} />
      <MemberList
        rows={rows}
        fee={data.weeklyFee}
        onSelect={(id) => router.push(`/iuran/${id}`)}
      />
      {paying && (
        <PaymentSheet data={data} onClose={() => setPaying(false)} onDone={() => setPaying(false)} />
      )}
    </>
  );
}