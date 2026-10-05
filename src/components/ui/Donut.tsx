import type { ReactNode } from "react";

export interface Segment {
  value: number;
  color: string;
}

interface Props {
  segments: Segment[];
  activeIndex?: number | null;
  onSelect?(index: number | null): void;
  size?: number;
  thickness?: number;
  children?: ReactNode; // isi bagian tengah
}

const GAP = 2; // jarak antar potongan, dalam px
const GROW = 6; // tambahan tebal potongan yang disorot

export function Donut({
  segments,
  activeIndex = null,
  onSelect,
  size = 124,
  thickness = 15,
  children,
}: Props) {
  // Sisakan ruang agar potongan yang menebal tidak terpotong tepi.
  const radius = (size - thickness - GROW) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Indeks asli dipertahankan agar cocok dengan daftar rincian.
  const visible = segments.map((s, index) => ({ ...s, index })).filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);
  const gap = visible.length > 1 ? GAP : 0;

  let offset = 0;

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          style={{ stroke: "var(--border)" }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(null);
          }}
        />
        {visible.map((s) => {
          const length = (s.value / total) * circumference;
          const dash = Math.max(length - gap, 0);
          const start = offset;
          offset += length;

          const isActive = s.index === activeIndex;
          const dimmed = activeIndex !== null && !isActive;

          return (
            <circle
              key={s.index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              strokeWidth={isActive ? thickness + GROW : thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-start}
              transform={`rotate(-90 ${center} ${center})`}
              style={{
                stroke: s.color,
                opacity: dimmed ? 0.35 : 1,
                transition: "stroke-width 0.15s, opacity 0.15s",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(isActive ? null : s.index);
              }}
            />
          );
        })}
      </svg>
      <div className="donut-center">{children}</div>
    </div>
  );
}