import Link from "next/link";

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
  const linkClass = (href: string) => (href === active ? "active" : "");

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
            <span>AF</span>
            <div><strong>Admin Fakultas</strong><small>Administrator</small></div>
            <b>⋮</b>
          </div>
          <Link href="/" className="logout">↪ Keluar</Link>
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
