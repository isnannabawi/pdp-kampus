"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminHeader, AdminShell } from "@/components/admin-shell";

type MasterRow = { nim_nip: string; nama: string; jenis: "MAHASISWA" | "DOSEN"; email_kampus: string; status_aktif: boolean; prodi: { nama: string } | null };

export default function MasterDataPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Semua");
  const [masterData, setMasterData] = useState<MasterRow[]>([]);
  useEffect(() => { fetch("/api/admin/master-data").then((response) => response.json()).then(setMasterData).catch(() => setMasterData([])); }, []);
  const filtered = useMemo(() => masterData.filter((row) => {
    const match = `${row.nim_nip} ${row.nama} ${row.prodi?.nama ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return match && (type === "Semua" || row.jenis === type.toUpperCase());
  }), [masterData, query, type]);
  return <AdminShell active="/dashboard/master-data"><AdminHeader eyebrow="DATA AKADEMIK" title="Master data" action="＋ Import data" actionHref="/dashboard/master-data?import=1" />
    <div className="data-tabs"><button className={type === "Semua" ? "selected" : ""} onClick={() => setType("Semua")} type="button">Semua data <b>{masterData.length}</b></button><button className={type === "Mahasiswa" ? "selected" : ""} onClick={() => setType("Mahasiswa")} type="button">Mahasiswa <b>{masterData.filter((row) => row.jenis === "MAHASISWA").length}</b></button><button className={type === "Dosen" ? "selected" : ""} onClick={() => setType("Dosen")} type="button">Dosen <b>{masterData.filter((row) => row.jenis === "DOSEN").length}</b></button></div>
    <div className="admin-toolbar"><div className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari NIM, NIP, nama, atau program studi..." /></div><button className="button button-outline" type="button">↓ Unduh template</button><button className="button button-primary" type="button">↑ Import CSV</button></div>
    <section className="table-card admin-table-card"><div className="card-title"><div><p className="eyebrow">DIREKTORI AKADEMIK</p><h2>{filtered.length} data ditampilkan</h2></div><span className="table-hint">Data dari master_akademik</span></div><div className="table-wrap"><table><thead><tr><th>NIM / NIP</th><th>NAMA</th><th>JENIS</th><th>PROGRAM STUDI</th><th>EMAIL KAMPUS</th><th>STATUS</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.nim_nip}><td><strong>{row.nim_nip}</strong></td><td>{row.nama}</td><td><span className="type-label">{row.jenis === "MAHASISWA" ? "Mahasiswa" : "Dosen"}</span></td><td>{row.prodi?.nama ?? "-"}</td><td>{row.email_kampus}</td><td><span className={`status-pill ${row.status_aktif ? "status-diterima" : "status-muted"}`}>● {row.status_aktif ? "Aktif" : "Nonaktif"}</span></td></tr>)}</tbody></table></div></section>
  </AdminShell>;
}
