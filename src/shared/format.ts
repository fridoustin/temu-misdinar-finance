const utc = (iso: string) => new Date(iso + "T00:00:00Z");
export const rupiah = (n: number) =>
  "Rp" + Math.abs(n).toLocaleString("id-ID");
export const dayShort = (iso: string) =>
  utc(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
export const rangeLabel = (a: string, b: string) =>
  `${dayShort(a)} - ${dayShort(b)} ${b.slice(0, 4)}`;
export const dayLong = (iso: string) =>
  utc(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export const rupiahSigned = (n: number) => (n < 0 ? "-" : "") + rupiah(n);

/** Tanggal hari ini (zona waktu perangkat) dalam format YYYY-MM-DD. */
export const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

/** Ringkas untuk ruang sempit: 2.700.000 menjadi "2,7 jt". */
export const rupiahCompact = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const fmt = (value: number, unit: string) =>
    `${sign}${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })} ${unit}`;

  if (abs >= 1e9) return fmt(abs / 1e9, "M");
  if (abs >= 1e6) return fmt(abs / 1e6, "jt");
  if (abs >= 1e3) return fmt(abs / 1e3, "rb");
  return `${sign}${abs}`;
};