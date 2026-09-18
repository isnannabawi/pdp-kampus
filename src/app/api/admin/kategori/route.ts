import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("kategori_prestasi").select("id,nama,tingkat_default,bobot_poin,aktif,pengajuan(count)").order("nama");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.nama || !body.tingkat_default || !Number.isInteger(Number(body.bobot_poin))) {
    return NextResponse.json({ error: "Nama, tingkat, dan bobot poin wajib diisi." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin.from("kategori_prestasi").insert({
    nama: body.nama, tingkat_default: body.tingkat_default, bobot_poin: Number(body.bobot_poin), aktif: true,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id || typeof body.aktif !== "boolean") return NextResponse.json({ error: "Data kategori tidak valid." }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("kategori_prestasi").update({ aktif: body.aktif }).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
