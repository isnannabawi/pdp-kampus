import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("master_akademik")
    .select("id,nim_nip,nama,jenis,email_kampus,status_aktif,prodi:prodi_id(nama)")
    .order("nama");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
