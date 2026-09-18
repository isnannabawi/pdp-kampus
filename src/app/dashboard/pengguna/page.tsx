"use client";

import { useEffect, useState } from "react";
import { AdminHeader, AdminShell } from "@/components/admin-shell";

type User = { id: string; nama: string; email: string; role: string; active: boolean };

export default function PenggunaPage() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Semua");
  const [people, setPeople] = useState<User[]>([]);
  useEffect(() => { fetch("/api/admin/pengguna").then((response) => response.json()).then((data) => setPeople(data.map((item: User) => ({ ...item, nama: item.nama, role: item.role === "ADMIN" ? "Administrator" : "Verifikator" })))).catch(() => setPeople([])); }, []);
  const visible = people.filter((person) => activeTab === "Semua" || person.role === activeTab);
  return <AdminShell active="/dashboard/pengguna"><AdminHeader eyebrow="PENGELOLAAN AKSES" title="Pengguna internal" action="＋ Tambah pengguna" actionHref="/dashboard/pengguna?buat=1" />
    <div className="admin-toolbar"><div className="tab-list">{["Semua", "Administrator", "Verifikator"].map((tab) => <button type="button" className={activeTab === tab ? "selected" : ""} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>)}</div><button className="button button-primary" type="button" onClick={() => setShowForm(true)}>＋ Tambah pengguna</button></div>
    {showForm && <form className="inline-form" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const response = await fetch("/api/admin/pengguna", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nama: form.get("nama"), email: form.get("email"), role: form.get("role") === "Administrator" ? "ADMIN" : "VERIFIKATOR" }) }); if (response.ok) { setShowForm(false); const refreshed = await fetch("/api/admin/pengguna"); setPeople(await refreshed.json()); } }}><div><p className="eyebrow">PENGGUNA BARU</p><h2>Tambahkan akses internal</h2></div><div className="form-grid"><label>Nama lengkap<input name="nama" required placeholder="Nama pengguna" /></label><label>Email kampus<input name="email" required type="email" placeholder="nama@kampus.ac.id" /></label><label>Peran<select name="role" defaultValue="Verifikator"><option>Verifikator</option><option>Administrator</option></select></label></div><div className="inline-form-actions"><button className="button button-outline" type="button" onClick={() => setShowForm(false)}>Batal</button><button className="button button-primary" type="submit">Simpan pengguna</button></div></form>}
    <section className="table-card admin-table-card"><div className="card-title"><div><p className="eyebrow">AKUN TERDAFTAR</p><h2>{visible.length} pengguna internal</h2></div><span className="table-hint">Data dari profil_internal</span></div><div className="table-wrap"><table><thead><tr><th>PENGGUNA</th><th>EMAIL</th><th>PERAN</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>{visible.map((person) => <tr key={person.id}><td><div className="person-cell"><span className="person-avatar">{person.nama.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><strong>{person.nama}</strong></div></td><td>{person.email}</td><td><span className="role-label">{person.role}</span></td><td><span className={`status-pill ${person.active ? "status-diterima" : "status-muted"}`}>● {person.active ? "Aktif" : "Nonaktif"}</span></td><td><button className="text-action" type="button">Kelola</button></td></tr>)}</tbody></table></div></section>
  </AdminShell>;
}
