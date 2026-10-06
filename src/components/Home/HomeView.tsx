"use client";

import { useRouter } from "next/navigation";
import type { HomeSummary } from "@/application/home";
import type { FinanceData } from "@/domain/finance";
import { TotalsHero } from "@/components/finance/TotalsHero";
import { PageHeader } from "@/components/ui/PageHeader";
import { HomeCharts } from "./HomeCharts";
import { HomeStats } from "./HomeStats";
import { KasKecilCard } from "./KasKecilCard";
import { TargetCard } from "./TargetCard";

interface Props {
  summary: HomeSummary;
  finance: FinanceData;
}

export function HomeView({ summary, finance }: Props) {
  const router = useRouter();

  return (
    <>
      <PageHeader title="Temu Misdinar Finance" />
      <TotalsHero label="Saldo Kas Besar" totals={summary.kasBesar} large />
      <KasKecilCard amount={summary.kasKecil} onOpen={() => router.push("/iuran")} />
      <TargetCard collected={summary.kasBesar.income} target={summary.target} />
      <HomeCharts months={summary.months} finance={finance} />
      <HomeStats kasKecilMonths={summary.kasKecilMonths} />
    </>
  );
}