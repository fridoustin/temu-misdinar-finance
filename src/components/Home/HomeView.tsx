"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/action";
import type { HomeSummary } from "@/application/home";
import type { FinanceData } from "@/domain/finance";
import { TotalsHero } from "@/components/finance/TotalsHero";
import { useIsAdmin } from "@/components/layout/AdminProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
  const isAdmin = useIsAdmin();
  const [leaving, setLeaving] = useState(false);

  async function logout(): Promise<void> {
    await logoutAction();
    // Muat ulang penuh agar status login di seluruh halaman ikut berubah.
    window.location.replace("/");
  }

  return (
    <>
      <PageHeader
        title="Temu Misdinar Finance"
        subtitle={isAdmin ? "Masuk sebagai admin" : "Mode lihat saja"}
        action={
          isAdmin ? (
            <button className="btn small outline" onClick={() => setLeaving(true)}>
              <LogOut />
              Keluar
            </button>
          ) : undefined
        }
      />
      <TotalsHero label="Saldo Kas Besar" totals={summary.kasBesar} large />
      <KasKecilCard amount={summary.kasKecil} onOpen={() => router.push("/iuran")} />
      <TargetCard collected={summary.kasBesar.income} target={summary.target} />
      <HomeCharts months={summary.months} finance={finance} />
      <HomeStats kasKecilMonths={summary.kasKecilMonths} />

      {leaving && (
        <ConfirmDialog
          icon={<LogOut />}
          title="Keluar dari akun?"
          message="Anda akan kembali ke mode lihat saja. Untuk menambah atau mengubah data, Anda perlu masuk lagi."
          confirmLabel="Ya, keluar"
          onConfirm={logout}
          onClose={() => setLeaving(false)}
        />
      )}
    </>
  );
}