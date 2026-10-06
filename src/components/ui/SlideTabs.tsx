import type { CSSProperties } from "react";

interface Props<T extends string> {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange(value: T): void;
}

export function SlideTabs<T extends string>({ options, value, onChange }: Props<T>) {
  const index = Math.max(
    options.findIndex(([v]) => v === value),
    0,
  );
  const style = { "--count": options.length, "--index": index } as CSSProperties;

  return (
    <div className="tabs" role="tablist" style={style}>
      <span className="tabs-thumb" aria-hidden="true" />
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={v === value}
          className={v === value ? "on" : ""}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}