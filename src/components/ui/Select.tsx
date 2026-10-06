import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Picker } from "./Picker";
import { SearchInput } from "./SearchInput";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  title: string;
  value: string;
  options: SelectOption[];
  onChange(value: string): void;
  placeholder?: string;
  searchable?: boolean; // tampilkan kotak pencarian di dalam daftar
  compact?: boolean; // pil kecil, untuk ditaruh di baris judul
}

export function Select({
  title,
  value,
  options,
  onChange,
  placeholder = "Pilih",
  searchable = true,
  compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const current = options.find((o) => o.value === value);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  function choose(next: string) {
    onChange(next);
    handleClose();
  }

  function handleClose() {
    setOpen(false);
    setQuery(""); // reset kata kunci pencarian saat ditutup
  }

  return (
    <>
      <button
        type="button"
        className={"pick-btn" + (compact ? " sm" : "")}
        onClick={() => setOpen(true)}
      >
        <span className={current ? "" : "muted"}>{current?.label ?? placeholder}</span>
        <ChevronDown />
      </button>

      {open && (
        <Picker title={title} onClose={handleClose}>
          {searchable && <SearchInput value={query} onChange={setQuery} placeholder="Cari..." />}
          <ul className="opts">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    className={"opt" + (o.value === value ? " on" : "")}
                    onClick={() => choose(o.value)}
                  >
                    {o.label}
                    {o.value === value && <Check />}
                  </button>
                </li>
              ))
            ) : (
              <li className="muted" style={{ padding: "12px", textAlign: "center" }}>
                Tidak ditemukan
              </li>
            )}
          </ul>
        </Picker>
      )}
    </>
  );
}