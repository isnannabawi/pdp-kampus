import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("pengajuan")
    .select("id,kode_tiket,judul,status,created_at,tanggal_kegiatan,master_akademik(nim_nip,nama,jenis,prodi:prodi_id(nama)),kategori:kategori_id(nama)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json() as { id?: string; status?: string; catatan_verifikator?: string };
  if (!body.id || !body.status || !["MENUNGGU", "DIREVISI", "DITERIMA", "DITOLAK"].includes(body.status)) {
    return NextResponse.json({ error: "Data status tidak valid." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin.from("pengajuan").update({
    status: body.status,
    catatan_verifikator: body.catatan_verifikator ?? null,
    updated_at: new Date().toISOString(),
  }).eq("id", body.id).select("id,status").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
