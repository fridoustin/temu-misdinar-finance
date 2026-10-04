export const WEEKLY_FEE = 5000;

export interface Member {
  id: string;
  name: string;
  nickname: string | null;
  joinDate: string;
  status: string;
}
export interface Period {
  id: string;
  startDate: string;
  endDate: string;
}
export interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}
export interface Payment {
  id: string;
  number: string; // PPA-I001
  memberId: string;
  methodId: string;
  paymentDate: string;
  amount: number;
}
export interface IuranData {
  weeklyFee: number;
  periods: Period[];
  members: Member[];
  payments: Payment[];
  paymentMethods: PaymentMethod[];
}

/** Indeks (0-based) periode pertama anggota: periode pertama yang berakhir pada/setelah join_date. */
export const joinIndex = (m: Member, periods: Period[]): number => {
  const i = periods.findIndex((p) => p.endDate >= m.joinDate);
  return i < 0 ? periods.length : i;
};

export const totalPaid = (memberId: string, payments: Payment[]): number =>
  payments
    .filter((p) => p.memberId === memberId)
    .reduce((s, p) => s + p.amount, 0);

export const weeksPaid = (paid: number, fee: number): number =>
  Math.floor(paid / fee);

export const isApplicable = (
  m: Member,
  idx: number,
  periods: Period[]
): boolean => idx >= joinIndex(m, periods);

/** Pembayaran dialokasikan ke periode paling awal yang belum lunas, mulai dari periode bergabung. */
export const isPaid = (m: Member, idx: number, d: IuranData): boolean => {
  const start = joinIndex(m, d.periods);
  return (
    idx >= start &&
    idx - start < weeksPaid(totalPaid(m.id, d.payments), d.weeklyFee)
  );
};

export const isValidAmount = (amount: number, fee: number): boolean =>
  amount > 0 && amount % fee === 0;

export const currentPeriodIndex = (
  periods: Period[],
  todayIso: string
): number => {
  if (!periods.length) return 0;
  const i = periods.findIndex(
    (p) => todayIso >= p.startDate && todayIso <= p.endDate
  );
  return i >= 0 ? i : todayIso < periods[0].startDate ? 0 : periods.length - 1;
};

export interface NewPayment {
  memberId: string;
  paymentDate: string;
  amount: number;
  methodId: string;
}

/** Bukti pembayaran yang akan diunggah. */
export interface Evidence {
  name: string;
  type: string;
  bytes: ArrayBuffer;
}

/** Bukti yang sudah tersimpan, dengan tautan sementara untuk dilihat. */
export interface AttachmentLink {
  paymentId: string;
  name: string;
  url: string;
}

/** Periode yang akan terisi oleh pembayaran baru (hanya preview, hasil final ada di database). */
export const previewAllocation = (
  m: Member,
  amount: number,
  d: IuranData
): Period[] => {
  const start =
    joinIndex(m, d.periods) +
    weeksPaid(totalPaid(m.id, d.payments), d.weeklyFee);
  return d.periods.slice(start, start + weeksPaid(amount, d.weeklyFee));
};

export const MAX_EVIDENCE_BYTES = 4 * 1024 * 1024;

export const isEvidenceType = (type: string): boolean =>
  type.startsWith("image/") || type === "application/pdf";