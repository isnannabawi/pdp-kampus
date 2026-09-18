"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/logout-button";

const navigation = [
  { href: "/dashboard", label: "Ringkasan", icon: "⌂" },
  { href: "/dashboard/pengajuan", label: "Pengajuan", icon: "▣", badge: "12" },
  { href: "/dashboard/laporan", label: "Laporan", icon: "◫" },
];

const managementNavigation = [
  { href: "/dashboard/kategori", label: "Kategori Prestasi", icon: "⊙" },
  { href: "/dashboard/master-data", label: "Master Data", icon: "⌑" },
  { href: "/dashboard/pengguna", label: "Pengguna", icon: "♙" },
];

export function AdminShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const [identity, setIdentity] = useState<{ user: { email?: string }; profile: { nama: string; role: "ADMIN" | "VERIFIKATOR" } } | null>(null);
  const [loading, setLoading] = useState(true);
  const linkClass = (href: string) => (href === active ? "active" : "");

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me").then(async (response) => {
      if (!response.ok) {
        window.location.replace(response.status === 403 ? "/login?error=unauthorized" : "/login");
        return;
      }
      const data = await response.json();
      if (mounted) {
        setIdentity(data);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) window.location.replace("/login");
    });
    return () => { mounted = false; };
  }, []);

  if (loading || !identity) {
    return <main className="auth-loading"><div className="login-card"><p className="eyebrow">PORTAL INTERNAL</p><h1>Memuat halaman...</h1><p className="form-help">Memverifikasi sesi dan akses akun Anda.</p></div></main>;
  }

  const initials = identity.profile.nama.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = identity.profile.role === "ADMIN" ? "Administrator" : "Verifikator";

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link href="/" className="brand side-brand">
          <span className="brand-mark">✦</span>
          <span>Sistem <strong>Prestasi</strong></span>
        </Link>
        <div className="side-label">MENU UTAMA</div>
        <nav className="side-nav">
          {navigation.map((item) => (
            <Link className={linkClass(item.href)} href={item.href} key={item.href}>
              <span>{item.icon}</span> {item.label}
              {item.badge && <b>{item.badge}</b>}
            </Link>
          ))}
        </nav>
        <div className="side-label">PENGELOLAAN</div>
        <nav className="side-nav">
          {managementNavigation.map((item) => (
            <Link className={linkClass(item.href)} href={item.href} key={item.href}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="profile-mini">
            <span>{initials}</span>
            <div><strong>{identity.profile.nama}</strong><small>{roleLabel}</small></div>
            <b>⋮</b>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <section className="dashboard-content">{children}</section>
    </main>
  );
}

export function AdminHeader({
  eyebrow,
  title,
  action,
  actionHref,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <header className="dashboard-top">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>
      {action && actionHref && <Link className="button button-primary" href={actionHref}>{action}</Link>}
    </header>
  );
}
