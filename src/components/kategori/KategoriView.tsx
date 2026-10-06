"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { summarizeByCategory } from "@/application/finance";
import type { FinanceData, TransactionType } from "@/domain/finance";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SlideTabs } from "@/components/ui/SlideTabs";
import { CategoryCard } from "./CategoryCard";
import { CategorySheet } from "./CategorySheet";
import { useIsAdmin } from "../layout/AdminProvider";

const TABS: readonly (readonly [TransactionType, string])[] = [
  ["income", "Pemasukan"],
  ["expense", "Pengeluaran"],
];

export function KategoriView({ data }: { data: FinanceData }) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const params = useSearchParams();

  const [type, setType] = useState<TransactionType>(
    params.get("tab") === "expense" ? "expense" : "income",
  );
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [adding, setAdding] = useState(false);

  function changeTab(next: TransactionType) {
    if (next === type) return;
    setDirection(next === "expense" ? "right" : "left");
    setType(next);
    // Simpan tab di URL agar tombol back dari detail kategori kembali ke tab yang sama.
    window.history.replaceState(null, "", `?tab=${next}`);
  }

  const summaries = summarizeByCategory(data, type);

  return (
    <>
      <PageHeader
        title="Kategori"
        action={
          isAdmin ? (
            <button className="btn small" onClick={() => setAdding(true)}>
              <Plus />
              Kategori
            </button>
          ) : undefined
        }
      />

      <SlideTabs options={TABS} value={type} onChange={changeTab} />

      <div key={type} className={`slide-in-${direction}`}>
        {summaries.length === 0 ? (
          <EmptyState
            title={`Belum ada kategori ${type === "income" ? "pemasukan" : "pengeluaran"}`}
            text="Tambahkan kategori pertama."
          />
        ) : (
          <div className="stack">
            {summaries.map((s) => (
              <CategoryCard
                key={s.category.id}
                summary={s}
                type={type}
                onSelect={() => router.push(`/kategori/${s.category.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {adding && <CategorySheet onClose={() => setAdding(false)} onDone={() => setAdding(false)} />}
    </>
  );
}