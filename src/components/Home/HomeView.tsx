"use client";

import { useRouter } from "next/navigation";
import type { HomeSummary } from "@/application/home";
import { TotalsHero } from "@/components/finance/TotalsHero";
import { CategoryCard } from "@/components/kategori/CategoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { KasKecilCard } from "./KasKecilCard";
import { TargetCard } from "./TargetCard";

export function HomeView({ summary }: { summary: HomeSummary }) {
  const router = useRouter();

  return (
    <>
      <PageHeader title="Temu Misdinar Finance" />
      <TotalsHero label="Saldo Kas Besar" totals={summary.kasBesar} large />
      <KasKecilCard amount={summary.kasKecil} onOpen={() => router.push("/iuran")} />
      <TargetCard collected={summary.kasBesar.income} target={summary.target} />

      <div className="sec-head">
        <h2>Recent</h2>
        <button className="link" onClick={() => router.push("/kategori")}>
          Lihat semua
        </button>
      </div>
      {summary.recent.length === 0 ? (
        <EmptyState title="Belum ada kegiatan" text="Tambahkan transaksi lewat tombol plus." />
      ) : (
        <div className="stack">
          {summary.recent.map((s) => (
            <CategoryCard
              key={s.category.id}
              summary={s}
              onSelect={() => router.push(`/kategori/${s.category.id}`)}
            />
          ))}
        </div>
      )}
    </>
  );
}