"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { House, LogIn, Plus, Tags, Users, Wallet } from "lucide-react";
import type { FormOptions } from "@/domain/finance";
import { TransactionSheet } from "@/components/finance/TransactionSheet";
import { useIsAdmin } from "./AdminProvider";

const LEFT_TABS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/finance", label: "Finance", Icon: Wallet },
];

const RIGHT_TABS = [
  { href: "/kategori", label: "Kategori", Icon: Tags },
  { href: "/iuran", label: "Iuran", Icon: Users },
];

export function Nav({ options }: { options: FormOptions }) {
  const path = usePathname();
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [adding, setAdding] = useState(false);
  
  if (path === "/login") return null;

  const renderTab = ({ href, label, Icon }: (typeof LEFT_TABS)[number]) => (
    <button key={href} className={path === href ? "on" : ""} onClick={() => router.push(href)}>
      <Icon />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <nav className="nav" aria-label="Navigasi utama">
        {LEFT_TABS.map(renderTab)}
        {isAdmin ? (
          <button className="fab" aria-label="Tambah transaksi" onClick={() => setAdding(true)}>
            <Plus />
          </button>
        ) : (
          <button className="fab" aria-label="Masuk sebagai admin" onClick={() => router.push("/login")}>
            <LogIn />
          </button>
        )}
        {RIGHT_TABS.map(renderTab)}
      </nav>

      {/* Di luar <nav>: backdrop-filter pada nav akan membatasi posisi fixed milik sheet. */}
      {adding && (
        <TransactionSheet
          options={options}
          onClose={() => setAdding(false)}
          onDone={() => setAdding(false)}
        />
      )}
    </>
  );
}