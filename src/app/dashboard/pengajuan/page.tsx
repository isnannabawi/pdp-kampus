"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminHeader, AdminShell } from "@/components/admin-shell";

type Submission = { id: string; kode_tiket: string; judul: string; status: string; created_at: string; master_akademik: { nama: string; prodi: { nama: string } | null } | null; kategori: { nama: string } | null };

export default function PengajuanPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua status");
  const [rows, setRows] = useState<Submission[]>([]);
  useEffect(() => { fetch("/api/admin/pengajuan").then(async (response) => { if (!response.ok) throw new Error("Gagal memuat pengajuan"); setRows(await response.json()); }).catch(() => setRows([])); }, []);
  const filtered = useMemo(() => rows.filter((row) => {
    const matchesQuery = `${row.judul} ${row.master_akademik?.nama ?? ""} ${row.kode_tiket}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "Semua status" || row.status === status.toUpperCase());
  }), [query, rows, status]);

  function updateStatus(code: string, nextStatus: string) {
    setRows((current) => current.map((row) => row.id === code ? { ...row, status: nextStatus.toUpperCase() } : row));
    fetch("/api/admin/pengajuan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: code, status: nextStatus.toUpperCase() }) }).catch(() => undefined);
  }

  return <AdminShell active="/dashboard/pengajuan"><AdminHeader eyebrow="PENGELOLAAN PENGAJUAN" title="Semua pengajuan" action="＋ Pengajuan baru" actionHref="/ajukan" />
    <div className="admin-toolbar"><div className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul, nama, atau kode tiket..." /></div><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Semua status</option><option>Menunggu</option><option>Diterima</option><option>Direvisi</option><option>Ditolak</option></select><button className="button button-outline" type="button">↓ Export</button></div>
    <div className="admin-summary"><div><strong>{rows.filter((row) => row.status === "MENUNGGU").length}</strong><span>Menunggu verifikasi</span></div><div><strong>{rows.filter((row) => row.status === "DITERIMA").length}</strong><span>Sudah diterima</span></div><div><strong>{rows.filter((row) => row.status === "DIREVISI").length}</strong><span>Perlu revisi</span></div><div><strong>{rows.length}</strong><span>Total pengajuan</span></div></div>
    <section className="table-card admin-table-card"><div className="card-title"><div><p className="eyebrow">DAFTAR TERBARU</p><h2>{filtered.length} pengajuan ditemukan</h2></div><span className="table-hint">Klik status untuk memperbarui</span></div><div className="table-wrap"><table><thead><tr><th>PENGAJUAN</th><th>PENGAJU</th><th>KATEGORI</th><th>STATUS</th><th>TANGGAL</th><th /></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><strong>{row.judul}</strong><small>{row.kode_tiket}</small></td><td><strong>{row.master_akademik?.nama ?? "-"}</strong><small>{row.master_akademik?.prodi?.nama ?? "-"}</small></td><td>{row.kategori?.nama ?? "-"}</td><td><select className={`status-select status-${row.status.toLowerCase()}`} value={row.status} onChange={(event) => updateStatus(row.id, event.target.value)}><option value="MENUNGGU">MENUNGGU</option><option value="DITERIMA">DITERIMA</option><option value="DIREVISI">DIREVISI</option><option value="DITOLAK">DITOLAK</option></select></td><td>{new Date(row.created_at).toLocaleDateString("id-ID")}</td><td><button className="row-menu" type="button" aria-label={`Aksi ${row.kode_tiket}`}>⋮</button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state">Tidak ada data pengajuan di database.</div>}</div></section>
  </AdminShell>;
}
