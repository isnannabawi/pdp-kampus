import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("profil_internal").select("id,nama,role,prodi_scope_id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const users = await Promise.all((data ?? []).map(async (profile) => {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    return { ...profile, email: authUser.user?.email ?? "-", active: Boolean(authUser.user?.email_confirmed_at) };
  }));
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; nama?: string; role?: string };
  if (!body.email || !body.nama || !["ADMIN", "VERIFIKATOR"].includes(body.role ?? "")) return NextResponse.json({ error: "Nama, email, dan peran wajib diisi." }, { status: 400 });
  const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({ email: body.email, email_confirm: true });
  if (authError || !created.user) return NextResponse.json({ error: authError?.message ?? "Gagal membuat akun." }, { status: 500 });
  const { data, error } = await supabaseAdmin.from("profil_internal").insert({ id: created.user.id, nama: body.nama, role: body.role }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
