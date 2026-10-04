import { useState, type ChangeEvent, type FormEvent } from "react";
import { Paperclip, X } from "lucide-react";
import { recordPaymentAction } from "@/app/iuran/actions";
import {
  IuranData,
  MAX_EVIDENCE_BYTES,
  isValidAmount,
  previewAllocation,
} from "@/domain/iuran";
import { compressImage } from "@/shared/compressImage";
import { dayShort, fileSize, rupiah, todayIso } from "@/shared/format";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";

interface Props {
  data: IuranData;
  memberId?: string;
  onClose(): void;
  onDone(): void;
}

export function PaymentSheet({ data, memberId, onClose, onDone }: Props) {
  const methods = data.paymentMethods.filter((m) => m.isActive);

  const [id, setId] = useState(memberId ?? data.members[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [methodId, setMethodId] = useState(methods[0]?.id ?? "");
  const [digits, setDigits] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fee = data.weeklyFee;
  const amount = Number(digits);
  const weeks = amount / fee;
  const member = data.members.find((m) => m.id === id);
  const valid = isValidAmount(amount, fee);
  const slots = member && valid ? previewAllocation(member, amount, data) : [];

  async function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = ""; // agar file yang sama bisa dipilih lagi
    if (picked) setFile(await compressImage(picked));
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
      form.set("memberId", id);
      form.set("paymentDate", date);
      form.set("amount", String(amount));
      form.set("methodId", methodId);
      if (file) form.set("file", file);

      const result = await recordPaymentAction(form);
      if (result.error) throw new Error(result.error);
      onDone();
    } catch (x) {
      setError((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet title="Catat pembayaran" onClose={onClose} onSubmit={submit}>
      <div className="field">
        Nama Anggota
        <Select
          title="Pilih anggota"
          value={id}
          onChange={setId}
          options={data.members.map((m) => ({ value: m.id, label: m.name }))}
        />
      </div>

      <div className="field">
        Tanggal Pembayaran
        <DatePicker title="Tanggal pembayaran" value={date} onChange={setDate} />
      </div>

      <div className="field">
        Metode Pembayaran
        <Select
          title="Pilih metode pembayaran"
          value={methodId}
          onChange={setMethodId}
          options={methods.map((m) => ({ value: m.id, label: m.name }))}
        />
      </div>
      {methods.length === 0 && (
        <p className="err">Belum ada metode pembayaran aktif di tabel payment_methods.</p>
      )}

      <div className="field">
        Nominal
        <div className="quick">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              className={"chip" + (amount === n * fee ? " on" : "")}
              onClick={() => setDigits(String(n * fee))}
            >
              {rupiah(n * fee)}
            </button>
          ))}
        </div>
        <div className="money">
          <b>Rp</b>
          <input
            inputMode="numeric"
            placeholder="0"
            value={amount ? amount.toLocaleString("id-ID") : ""}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      </div>

      <div className="payinfo">
        {!amount ? (
          `Kelipatan ${rupiah(fee)} = 1 minggu.`
        ) : !valid ? (
          <span className="warn">Nominal harus kelipatan {rupiah(fee)}.</span>
        ) : (
          <>
            {rupiah(amount)} setara dengan <b>{weeks} minggu</b>
            <p className="cap">Pembayaran akan dialokasikan ke:</p>
            <ul>
              {slots.slice(0, 6).map((p) => (
                <li key={p.id}>
                  ✓ {dayShort(p.startDate)} - {dayShort(p.endDate)}
                </li>
              ))}
              {slots.length > 6 && <li className="muted">+ {slots.length - 6} minggu berikutnya</li>}
              {weeks > slots.length && (
                <li className="warn">{weeks - slots.length} minggu melebihi periode iuran</li>
              )}
            </ul>
          </>
        )}
      </div>

      <div className="field">
        Bukti pembayaran (opsional)
        {file ? (
          <div className="file-row">
            <Paperclip />
            <span>{file.name}</span>
            <small className="muted">{fileSize(file.size)}</small>
            <button type="button" aria-label="Hapus file" onClick={() => setFile(null)}>
              <X />
            </button>
          </div>
        ) : (
          <label className="file-add">
            <Paperclip />
            Tambah foto atau PDF
            <input type="file" accept="image/*,application/pdf" hidden onChange={pickFile} />
          </label>
        )}
      </div>

      {error && <p className="err">{error}</p>}
      <button className="btn" disabled={busy || !valid || !methodId || !id}>
        {busy ? "Menyimpan..." : "Simpan pembayaran"}
      </button>
    </Sheet>
  );
}