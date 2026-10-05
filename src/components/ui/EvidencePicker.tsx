import type { ChangeEvent } from "react";
import { Paperclip, X } from "lucide-react";
import { compressImage } from "@/shared/compressImage";
import { fileSize } from "@/shared/format";

interface Props {
  file: File | null;
  onChange(file: File | null): void;
}

export function EvidencePicker({ file, onChange }: Props) {
  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    e.target.value = ""; // agar file yang sama bisa dipilih lagi
    if (picked) onChange(await compressImage(picked));
  }

  if (file) {
    return (
      <div className="file-row">
        <Paperclip />
        <span>{file.name}</span>
        <small className="muted">{fileSize(file.size)}</small>
        <button type="button" aria-label="Hapus file" onClick={() => onChange(null)}>
          <X />
        </button>
      </div>
    );
  }

  return (
    <label className="file-add">
      <Paperclip />
      Tambah foto atau PDF
      <input type="file" accept="image/*,application/pdf" hidden onChange={pick} />
    </label>
  );
}