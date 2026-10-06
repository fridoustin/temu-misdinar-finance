import { useState, type ReactNode } from "react";
import { Dialog } from "./Dialog";

interface Props {
  icon: ReactNode;
  tone?: "danger" | "neutral";
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Mengembalikan pesan error jika gagal. Jika berhasil, pemanggil yang berpindah halaman. */
  onConfirm(): Promise<string | void>;
  onClose(): void;
}

export function ConfirmDialog({
  icon,
  tone = "neutral",
  title,
  message,
  confirmLabel,
  cancelLabel = "Batal",
  onConfirm,
  onClose,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
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
    <Dialog
      icon={icon}
      tone={tone}
      title={title}
      message={message}
      onClose={busy ? undefined : onClose}
      trackHistory={false}
      actions={
        <>
          {/* Fokus awal di Batal, supaya tidak tertekan tanpa sengaja. */}
          <button type="button" className="btn outline" autoFocus disabled={busy} onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={"btn" + (tone === "danger" ? " danger" : "")}
            disabled={busy}
            onClick={confirm}
          >
            {busy ? "Memproses..." : confirmLabel}
          </button>
        </>
      }
    >
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
    </Dialog>
  );
}