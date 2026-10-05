import { useState, type FormEvent } from "react";
import { categoriesFor, type FormOptions, type TransactionType } from "@/domain/finance";
import { MAX_EVIDENCE_BYTES } from "@/domain/iuran";
import { todayIso } from "@/shared/format";
import { DatePicker } from "@/components/ui/DatePicker";
import { EvidencePicker } from "@/components/ui/EvidencePicker";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { addTransactionAction } from "@/app/finance/action";

interface Props {
  options: FormOptions;
  onClose(): void;
  onDone(): void;
}

const TYPES: readonly (readonly [TransactionType, string])[] = [
  ["income", "Pemasukan"],
  ["expense", "Pengeluaran"],
];

export function TransactionSheet({ options, onClose, onDone }: Props) {
  const methods = options.paymentMethods.filter((m) => m.isActive);

  const [type, setType] = useState<TransactionType>("income");
  const [digits, setDigits] = useState("");
  const [categoryId, setCategoryId] = useState(
    categoriesFor("income", options.categories)[0]?.id ?? "",
  );
  const [methodId, setMethodId] = useState(methods[0]?.id ?? "");
  const [divisionId, setDivisionId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isExpense = type === "expense";
  const amount = Number(digits);
  const categoryOptions = categoriesFor(type, options.categories).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const ready = Boolean(amount && categoryId && methodId && (!isExpense || divisionId));

  function changeType(next: TransactionType) {
    setType(next);
    setCategoryId(categoriesFor(next, options.categories)[0]?.id ?? "");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (file && file.size > MAX_EVIDENCE_BYTES) {
      setError("Ukuran bukti maksimal 4 MB.");
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.set("type", type);
      form.set("categoryId", categoryId);
      form.set("methodId", methodId);
      if (isExpense) form.set("divisionId", divisionId);
      form.set("amount", String(amount));
      form.set("date", date);
      form.set("note", note);
      if (file) form.set("file", file);

      const result = await addTransactionAction(form);
      if (result.error) throw new Error(result.error);
      onDone();
    } catch (x) {
      setError((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet title="Tambah transaksi" onClose={onClose} onSubmit={submit}>
      <div className="seg" role="radiogroup" aria-label="Jenis transaksi">
        {TYPES.map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="type"
              checked={type === value}
              onChange={() => changeType(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <label className="field">
        Nominal
        <div className="money">
          <b>Rp</b>
          <input
            inputMode="numeric"
            placeholder="0"
            value={amount ? amount.toLocaleString("id-ID") : ""}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      </label>

      <div className="field">
        Kategori
        <Select
          title="Pilih kategori"
          value={categoryId}
          options={categoryOptions}
          onChange={setCategoryId}
        />
      </div>
      {categoryOptions.length === 0 && (
        <p className="err">Buat kategori dulu di halaman Kategori.</p>
      )}

      <div className="field">
        {isExpense ? "Sumber Dana" : "Metode Pembayaran"}
        <Select
          title={isExpense ? "Pilih sumber dana" : "Pilih metode pembayaran"}
          value={methodId}
          onChange={setMethodId}
          options={methods.map((m) => ({ value: m.id, label: m.name }))}
        />
      </div>
      {methods.length === 0 && (
        <p className="err">Belum ada metode pembayaran aktif di tabel payment_methods.</p>
      )}

      {isExpense && (
        <>
          <div className="field">
            Divisi
            <Select
              title="Pilih divisi"
              value={divisionId}
              onChange={setDivisionId}
              placeholder="Pilih divisi"
              options={options.divisions.map((d) => ({ value: d.id, label: d.name }))}
            />
          </div>
          {options.divisions.length === 0 && (
            <p className="err">Belum ada divisi di tabel divisions.</p>
          )}
        </>
      )}

      <div className="field">
        Tanggal
        <DatePicker title="Pilih tanggal" value={date} onChange={setDate} />
      </div>

      <label className="field">
        Catatan
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: Penjualan makanan"
        />
      </label>

      <div className="field">
        Bukti (opsional)
        <EvidencePicker file={file} onChange={setFile} />
      </div>

      {error && <p className="err">{error}</p>}
      <button className="btn" disabled={busy || !ready}>
        {busy ? "Menyimpan..." : "Simpan transaksi"}
      </button>
    </Sheet>
  );
}