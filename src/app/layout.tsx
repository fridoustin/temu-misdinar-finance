import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AdminProvider } from "@/components/layout/AdminProvider";
import { Nav } from "@/components/layout/Nav";
import { EMPTY_OPTIONS } from "@/domain/finance";
import { getAdmin } from "@/infrastructure/auth";
import { financeRepository } from "@/infrastructure/financeRepository";

export const metadata: Metadata = { title: "Temu Misdinar Finance" };
export const viewport: Viewport = { themeColor: "#F7F1E7", viewportFit: "cover" };
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const admin = await getAdmin();

  // Pilihan form hanya dibutuhkan admin, jadi pengunjung tidak perlu memuatnya.
  const options = admin
    ? await financeRepository.getFormOptions().catch(() => EMPTY_OPTIONS)
    : EMPTY_OPTIONS;

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
        <AdminProvider isAdmin={Boolean(admin)}>
          <div className="app">
            <main id="view">{children}</main>
            <Nav options={options} />
          </div>
        </AdminProvider>
      </body>
    </html>
  );
}