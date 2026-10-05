import { useEffect, useRef } from "react";

interface Entry {
  close(): void;
  pushed: boolean;
  popped: boolean;
}

const stack: Entry[] = [];
let ignoreNextPops = 0;
let listening = false;

function handlePop() {
  if (ignoreNextPops > 0) {
    ignoreNextPops -= 1;
    return;
  }
  const top = stack.pop();
  if (top) {
    top.popped = true;
    top.close();
  }
}

/** Tombol back (HP atau browser) menutup panel teratas dulu, bukan pindah halaman. */
export function useBackClose(onClose: () => void, enabled = true) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!enabled) return;

    if (!listening) {
      window.addEventListener("popstate", handlePop);
      listening = true;
    }

    const entry: Entry = { close: () => closeRef.current(), pushed: false, popped: false };

    // Ditunda satu tick agar aman dari mount ganda React Strict Mode (mode dev).
    const timer = setTimeout(() => {
      entry.pushed = true;
      stack.push(entry);
      history.pushState({ ...history.state, panel: true }, "");
    }, 0);

    return () => {
      clearTimeout(timer);
      if (!entry.pushed) return;

      const index = stack.indexOf(entry);
      if (index >= 0) stack.splice(index, 1);

      if (!entry.popped) {
        // Ditutup lewat tombol di layar: hapus entri riwayat yang tadi ditambahkan.
        ignoreNextPops += 1;
        history.back();
      }
    };
  }, [enabled]);
}