import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  const { data: profile, error } = await supabaseAdmin.from("profil_internal").select("nama,role").eq("id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!profile) return NextResponse.json({ error: "Akun belum memiliki akses internal." }, { status: 403 });
  return NextResponse.json({ user: { email: user.email }, profile });
}
