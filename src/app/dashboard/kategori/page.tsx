"use client";

import { useEffect, useState } from "react";
import { AdminHeader, AdminShell } from "@/components/admin-shell";

type Category = { id: string; nama: string; tingkat_default: string; bobot_poin: number; aktif: boolean; pengajuan: { count: number }[] };

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  useEffect(() => { fetch("/api/admin/kategori").then((response) => response.json()).then(setCategories).catch(() => setCategories([])); }, []);
  const toggle = (id: string, aktif: boolean) => { setCategories((items) => items.map((item) => item.id === id ? { ...item, aktif: !aktif } : item)); fetch("/api/admin/kategori", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, aktif: !aktif }) }).catch(() => undefined); };
  return <AdminShell active="/dashboard/kategori"><AdminHeader eyebrow="KONFIGURASI SISTEM" title="Kategori prestasi" action="＋ Tambah kategori" actionHref="/dashboard/kategori?buat=1" />
    <div className="category-intro"><div><h2>Atur klasifikasi prestasi.</h2><p>Kategori digunakan untuk mengelompokkan pengajuan dan menghitung bobot poin secara konsisten.</p></div><button className="button button-primary" type="button" onClick={() => setShowForm(true)}>＋ Tambah kategori</button></div>
    {showForm && <div className="inline-form"><p className="eyebrow">KATEGORI BARU</p><div className="form-grid"><label>Nama kategori<input placeholder="Contoh: Inovasi Teknologi" /></label><label>Tingkat default<select defaultValue="NASIONAL"><option>LOKAL</option><option>NASIONAL</option><option>INTERNASIONAL</option></select></label><label>Bobot poin<input type="number" placeholder="50" /></label></div><div className="inline-form-actions"><button className="button button-outline" type="button" onClick={() => setShowForm(false)}>Batal</button><button className="button button-primary" type="button" onClick={() => setShowForm(false)}>Simpan kategori</button></div></div>}
    <section className="category-grid">{categories.map((category) => <article className={`category-item ${category.aktif ? "" : "inactive"}`} key={category.id}><div className="category-item-head"><span className="category-symbol">✦</span><button className="row-menu" type="button">⋮</button></div><h3>{category.nama}</h3><p>Standar tingkat <strong>{category.tingkat_default}</strong></p><div className="category-item-foot"><div><strong>{category.bobot_poin}</strong><span>poin dasar</span></div><div><strong>{category.pengajuan?.[0]?.count ?? 0}</strong><span>pengajuan</span></div><button className="switch" aria-label={`Aktifkan ${category.nama}`} aria-pressed={category.aktif} onClick={() => toggle(category.id, category.aktif)} type="button"><span /></button></div></article>)}</section>
  </AdminShell>;
}
