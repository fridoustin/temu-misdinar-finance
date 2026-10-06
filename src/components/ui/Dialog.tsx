import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useBackClose } from "@/hooks/useBackClose";

interface Props {
  icon: ReactNode;
  tone?: "success" | "danger" | "neutral";
  title: string;
  message?: string;
  children?: ReactNode; // isi tambahan di bawah pesan, misalnya pesan error
  actions?: ReactNode; // tombol aksi
  /** Jika diisi, dialog bisa ditutup lewat klik latar, tombol Esc, dan tombol back. */
  onClose?(): void;
  trackHistory?: boolean;
}

const noop = () => {};

export function Dialog({
  icon,
  tone = "neutral",
  title,
  message,
  children,
  actions,
  onClose,
  trackHistory = true,
}: Props) {
  useBackClose(onClose ?? noop, trackHistory && Boolean(onClose));

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="overlay open dialog-layer"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <span className={`dialog-icon ${tone}`}>{icon}</span>
        <h2 id="dialog-title">{title}</h2>
        {message && <p>{message}</p>}
        {children}
        {actions && <div className="dialog-actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}