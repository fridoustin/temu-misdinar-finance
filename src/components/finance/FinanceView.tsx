"use client";

import { useState } from "react";
import {
  filterTransactions,
  totalsOf,
  type FinanceData,
  type TransactionFilter,
} from "@/domain/finance";
import { FilterChips } from "@/components/ui/FilterChips";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { TotalsHero } from "./TotalsHero";
import { TransactionList } from "./TransactionList";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { useRouter } from "next/navigation";

type TypeFilter = TransactionFilter["type"];

const TYPE_OPTIONS: readonly (readonly [TypeFilter, string])[] = [
  ["all", "Semua"],
  ["income", "Pemasukan"],
  ["expense", "Pengeluaran"],
];

const INITIAL_FILTER: TransactionFilter = { type: "all", query: "", categoryId: "", from: "" };

export function FinanceView({ data }: { data: FinanceData }) {
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const router = useRouter();
  const update = (patch: Partial<TransactionFilter>) => setFilter((f) => ({ ...f, ...patch }));
  const visible = filterTransactions(data.transactions, filter, data.categories);

  return (
    <>
      <PageHeader title="Finance" />
      <TotalsHero label="Net" totals={totalsOf(visible)} />
      <SearchInput
        value={filter.query}
        onChange={(query) => update({ query })}
        placeholder="Cari transaksi"
      />
      <FilterChips<TypeFilter>
        options={TYPE_OPTIONS}
        value={filter.type}
        onChange={(type) => update({ type })}
      />
      <div className="adv two">
        <Select
          title="Kategori"
          value={filter.categoryId}
          onChange={(categoryId) => update({ categoryId })}
          options={[
            { value: "", label: "Semua kategori" },
            ...data.categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <DatePicker
          title="Sejak tanggal"
          value={filter.from}
          onChange={(from) => update({ from })}
          placeholder="Sejak tanggal"
          clearable
        />
      </div>
      <TransactionList
        transactions={visible}
        categories={data.categories}
        onSelect={(id) => router.push(`/finance/${id}`)}
      />
    </>
  );
}