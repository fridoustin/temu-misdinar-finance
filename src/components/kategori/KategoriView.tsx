"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { summarizeByCategory } from "@/application/finance";
import type { FinanceData } from "@/domain/finance";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoryCard } from "./CategoryCard";
import { CategorySheet } from "./CategorySheet";

export function KategoriView({ data }: { data: FinanceData }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const summaries = summarizeByCategory(data);

  return (
    <>
      <PageHeader
        title="Kategori"
        action={
          <button className="btn small" onClick={() => setAdding(true)}>
            <Plus />
            Kategori
          </button>
        }
      />
      {summaries.length === 0 ? (
        <EmptyState title="Belum ada kategori" text="Tambahkan kategori pertama." />
      ) : (
        <div className="stack">
          {summaries.map((s) => (
            <CategoryCard
              key={s.category.id}
              summary={s}
              onSelect={() => router.push(`/kategori/${s.category.id}`)}
            />
          ))}
        </div>
      )}
      {adding && <CategorySheet onClose={() => setAdding(false)} onDone={() => setAdding(false)} />}
    </>
  );
}