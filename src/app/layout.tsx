import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { financeRepository } from "@/infrastructure/financeRepository";
import { EMPTY_OPTIONS } from "@/domain/finance";

export const metadata: Metadata = {
  title: "Temu Misdinar Finance",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};
export const viewport: Viewport = { themeColor: "#F7F1E7", viewportFit: "cover" };
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Jika gagal, navigasi tetap tampil dengan pilihan kosong.
  const options = await financeRepository.getFormOptions().catch(() => EMPTY_OPTIONS);
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app">
          <main id="view">{children}</main>
          <Nav options={options} />
        </div>
      </body>
    </html>
  );
}