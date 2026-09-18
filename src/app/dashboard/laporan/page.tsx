"use client";

import { useEffect, useState } from "react";
import { AdminHeader, AdminShell } from "@/components/admin-shell";

type Report = { total: number; accepted: number; pending: number; revised: number; byType: { mahasiswa: number; dosen: number }; monthly: number[]; byStudy: [string, number][] };

export default function LaporanPage() {
  const [period, setPeriod] = useState("2024");
  const [report, setReport] = useState<Report>({ total: 0, accepted: 0, pending: 0, revised: 0, byType: { mahasiswa: 0, dosen: 0 }, monthly: [], byStudy: [] });
  useEffect(() => { fetch("/api/admin/laporan").then((response) => response.json()).then(setReport).catch(() => undefined); }, []);
  return <AdminShell active="/dashboard/laporan"><AdminHeader eyebrow="ANALISIS & REKAPITULASI" title="Laporan prestasi" action="↓ Unduh laporan" actionHref="/dashboard/laporan?download=1" />
    <div className="report-filter"><div><span>Periode laporan</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>2024</option><option>2023</option><option>2022</option></select></div><div className="report-filter-note">Data terakhir diperbarui 18 Desember 2024</div></div>
    <div className="metric-grid report-metrics"><div className="metric-card"><small>Total prestasi</small><strong>{report.total}</strong></div><div className="metric-card"><small>Mahasiswa berprestasi</small><strong>{report.byType.mahasiswa}</strong></div><div className="metric-card"><small>Dosen berprestasi</small><strong>{report.byType.dosen}</strong></div><div className="metric-card"><small>Menunggu verifikasi</small><strong>{report.pending}</strong></div></div>
    <div className="report-grid"><section className="table-card report-chart"><div className="card-title"><div><p className="eyebrow">TREN BULANAN</p><h2>Pengajuan sepanjang {period}</h2></div><span className="chart-total">{report.total} total</span></div><div className="bar-chart">{report.monthly.map((value, index) => <div className="bar-column" key={index}><span className="bar-value">{value}</span><i style={{ height: `${Math.min(100, value * 5)}%` }} /><small>{["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][index]}</small></div>)}</div></section><section className="table-card ranking-card"><div className="card-title"><div><p className="eyebrow">PERINGKAT UNIT</p><h2>Program studi</h2></div></div><div className="ranking-list">{report.byStudy.map(([name, total], index) => <div className="ranking-row" key={name}><strong>{`0${index + 1}`}</strong><i className="ranking-avatar blue">{name.slice(0, 2).toUpperCase()}</i><span>{name}<small>{total} prestasi</small></span><b>↗</b></div>)}</div></section></div>
  </AdminShell>;
}
