import { useState, type FormEvent } from "react";
import { Sheet } from "./Sheet";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  /** Mengembalikan pesan error jika gagal. Jika berhasil, halaman pemanggil yang berpindah. */
  onConfirm(): Promise<string | void>;
  onClose(): void;
}

export function ConfirmSheet({ title, message, confirmLabel, onConfirm, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const failure = await onConfirm();
      if (failure) {
        setError(failure);
        setBusy(false);
      }
    } catch (x) {
      setError((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <Sheet title={title} onClose={onClose} onSubmit={submit} trackHistory={false}>
      <p>{message}</p>
      {error && <p className="err">{error}</p>}
      <button className="btn danger" disabled={busy}>
        {busy ? "Memproses..." : confirmLabel}
      </button>
      <button type="button" className="link" onClick={onClose}>
        Batal
      </button>
    </Sheet>
  );
}