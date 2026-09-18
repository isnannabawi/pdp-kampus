import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("pengajuan").select("status,created_at,master_akademik(jenis,prodi:prodi_id(nama))");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as unknown as Array<{ status: string; created_at: string; master_akademik: { jenis: string; prodi: { nama: string } | null } | null }>;
  const monthly = Array.from({ length: 12 }, (_, month) => rows.filter((row) => new Date(row.created_at).getMonth() === month).length);
  const byType = { mahasiswa: rows.filter((row) => row.master_akademik?.jenis === "MAHASISWA").length, dosen: rows.filter((row) => row.master_akademik?.jenis === "DOSEN").length };
  const byStudy = Object.entries(rows.reduce<Record<string, number>>((result, row) => {
    const study = row.master_akademik?.prodi?.nama ?? "Tidak diketahui";
    result[study] = (result[study] ?? 0) + 1;
    return result;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return NextResponse.json({ total: rows.length, accepted: rows.filter((row) => row.status === "DITERIMA").length, pending: rows.filter((row) => row.status === "MENUNGGU").length, revised: rows.filter((row) => row.status === "DIREVISI").length, byType, monthly, byStudy });
}
