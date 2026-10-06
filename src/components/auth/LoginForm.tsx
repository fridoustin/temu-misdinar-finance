"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, Lock } from "lucide-react";
import { loginAction } from "@/app/login/action";
import { Dialog } from "@/components/ui/Dialog";
import { useGoBack } from "@/hooks/useGoBack";

const REDIRECT_DELAY_MS = 1600;

// Muat ulang penuh agar status login di seluruh halaman ikut berubah.
const goHome = () => window.location.replace("/");

export function LoginForm() {
  const goBack = useGoBack("/");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [welcome, setWelcome] = useState<string | null>(null); // email setelah berhasil masuk

  useEffect(() => {
    if (welcome === null) return;
    const timer = setTimeout(goHome, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [welcome]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await loginAction(new FormData(e.currentTarget));
      if (result.error) throw new Error(result.error);
      setWelcome(result.email ?? "");
    } catch (x) {
      setError((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <header className="login-brand">
        <span className="login-logo">
          <Lock />
        </span>
        <h1>Masuk Admin</h1>
        <p>Khusus Bendahara</p>
      </header>

      <form className="card login" onSubmit={submit}>
        <label className="field">
          Email
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoFocus
            required
            onChange={() => setError("")}
          />
        </label>

        <label className="field">
          Password
          <div className="input-icon">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              onChange={() => setError("")}
            />
            <button
              type="button"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </label>

        {error && (
          <p className="err" role="alert">
            {error}
          </p>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <button type="button" className="link" onClick={goBack}>
        Kembali ke beranda
      </button>

      {welcome !== null && (
        <Dialog
          tone="success"
          icon={<Check />}
          title="Berhasil masuk"
          message={welcome ? `Selamat datang, ${welcome}.` : "Selamat datang."}
          actions={
            <button type="button" className="btn" autoFocus onClick={goHome}>
              Lanjut ke beranda
            </button>
          }
        />
      )}
    </div>
  );
}