import { totalCollected } from "@/application/iuran";
import { TARGET_DANA, totalsOf, type FinanceData, type Totals } from "@/domain/finance";
import type { IuranData } from "@/domain/iuran";
import {
  monthlyIuran,
  monthlySummaries,
  type MonthlyIuran,
  type MonthSummary,
} from "@/domain/statistics";

export interface HomeSummary {
  kasBesar: Totals;
  kasKecil: number;
  target: number;
  months: MonthSummary[];
  kasKecilMonths: MonthlyIuran[];
}

/**
 * Kas besar = semua transaksi (finance).
 * Kas kecil = iuran, tabungan baju panitia. Keduanya tidak dicampur.
 */
export function homeSummary(finance: FinanceData, iuran: IuranData): HomeSummary {
  return {
    kasBesar: totalsOf(finance.transactions),
    kasKecil: totalCollected(iuran),
    target: TARGET_DANA,
    months: monthlySummaries(finance.transactions),
    kasKecilMonths: monthlyIuran(iuran.payments),
  };
}