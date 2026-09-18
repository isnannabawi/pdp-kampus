"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/logout-button";

type DashboardSubmission = { id: string; kode_tiket: string; judul: string; status: string; created_at: string; master_akademik: { nama: string; prodi: { nama: string } | null } | null };
type AuthIdentity = { user: { email?: string }; profile: { nama: string; role: "ADMIN" | "VERIFIKATOR" } };

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<DashboardSubmission[]>([]);
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    Promise.all([fetch("/api/auth/me"), fetch("/api/admin/pengajuan")]).then(async ([authResponse, submissionsResponse]) => {
      if (!authResponse.ok) {
        window.location.replace(authResponse.status === 403 ? "/login?error=unauthorized" : "/login");
        return;
      }
      const [authData, submissionsData] = await Promise.all([authResponse.json(), submissionsResponse.json()]);
      if (mounted) {
        setIdentity(authData);
        setSubmissions(submissionsResponse.ok ? submissionsData : []);
        setAuthLoading(false);
      }
    }).catch(() => {
      if (mounted) window.location.replace("/login");
    });
    return () => { mounted = false; };
  }, []);
  if (authLoading || !identity) return <main className="auth-loading"><div className="login-card"><p className="eyebrow">PORTAL INTERNAL</p><h1>Memuat dashboard...</h1><p className="form-help">Memverifikasi sesi dan akses akun Anda.</p></div></main>;
  const initials = identity.profile.nama.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel = identity.profile.role === "ADMIN" ? "Administrator" : "Verifikator";
  return <main className="dashboard-shell"><aside className="dashboard-sidebar"><Link href="/" className="brand side-brand"><span className="brand-mark">✦</span><span>Sistem <strong>Prestasi</strong></span></Link><div className="side-label">MENU UTAMA</div><nav className="side-nav"><Link className="active" href="/dashboard"><span>⌂</span> Ringkasan</Link><Link href="/dashboard/pengajuan"><span>▣</span> Pengajuan <b>{submissions.filter((s) => s.status === "MENUNGGU").length}</b></Link><Link href="/dashboard/laporan"><span>◫</span> Laporan</Link></nav><div className="side-label">PENGELOLAAN</div><nav className="side-nav"><Link href="/dashboard/kategori"><span>⊙</span> Kategori Prestasi</Link><Link href="/dashboard/master-data"><span>⌑</span> Master Data</Link><Link href="/dashboard/pengguna"><span>♙</span> Pengguna</Link></nav><div className="side-bottom"><div className="profile-mini"><span>{initials}</span><div><strong>{identity.profile.nama}</strong><small>{roleLabel}</small></div><b>⋮</b></div><LogoutButton /></div></aside><section className="dashboard-content"><header className="dashboard-top"><div><p className="eyebrow">RINGKASAN ADMIN</p><h1>Selamat pagi, {identity.profile.nama.split(" ")[0]}.</h1><p className="dashboard-user-email">{identity.user.email}</p></div><div className="dash-actions"><Link className="button button-primary" href="/dashboard/pengajuan">＋ Pengajuan baru</Link></div></header><div className="dash-banner"><div><span className="banner-kicker">DATA TERKINI</span><h2>Kontribusi prestasi<br /><em>terus bertumbuh.</em></h2><p>Ringkasan ini dihitung langsung dari database pengajuan.</p></div><div className="mini-chart"><span style={{height:"35%"}}/><span style={{height:"50%"}}/><span style={{height:"42%"}}/><span style={{height:"63%"}}/><span style={{height:"57%"}}/><span style={{height:"82%"}}/><span style={{height:"74%"}}/><span style={{height:"94%"}}/></div></div><div className="metric-grid"><div className="metric-card"><small>Menunggu verifikasi</small><strong>{submissions.filter((s) => s.status === "MENUNGGU").length}</strong></div><div className="metric-card"><small>Diterima</small><strong>{submissions.filter((s) => s.status === "DITERIMA").length}</strong></div><div className="metric-card"><small>Perlu revisi</small><strong>{submissions.filter((s) => s.status === "DIREVISI").length}</strong></div><div className="metric-card"><small>Total prestasi</small><strong>{submissions.length}</strong></div></div><div className="dashboard-lower"><section className="table-card"><div className="card-title"><div><p className="eyebrow">AKTIVITAS TERBARU</p><h2>Pengajuan masuk</h2></div><Link href="/dashboard/pengajuan">Lihat semua →</Link></div><div className="table-wrap"><table><thead><tr><th>PENGAJUAN</th><th>PENGAJU</th><th>PROGRAM STUDI</th><th>STATUS</th><th>TANGGAL</th></tr></thead><tbody>{submissions.slice(0, 5).map((s) => <tr key={s.id}><td><strong>{s.judul}</strong><small>{s.kode_tiket}</small></td><td>{s.master_akademik?.nama ?? "-"}</td><td>{s.master_akademik?.prodi?.nama ?? "-"}</td><td><span className={`status-pill status-${s.status.toLowerCase()}`}>{s.status}</span></td><td>{new Date(s.created_at).toLocaleDateString("id-ID")}</td></tr>)}</tbody></table></div></section><section className="category-card"><div className="card-title"><div><p className="eyebrow">DISTRIBUSI</p><h2>Per status</h2></div></div><div className="donut"><div><strong>{submissions.length}</strong><span>Total</span></div></div><div className="legend"><span><i className="dot blue-dot" />Menunggu <b>{submissions.filter((s) => s.status === "MENUNGGU").length}</b></span><span><i className="dot yellow-dot" />Diterima <b>{submissions.filter((s) => s.status === "DITERIMA").length}</b></span><span><i className="dot purple-dot" />Direvisi <b>{submissions.filter((s) => s.status === "DIREVISI").length}</b></span></div></section></div></section></main>;
}
