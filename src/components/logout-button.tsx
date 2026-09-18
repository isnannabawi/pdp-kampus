"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LogoutButton() {
  const router = useRouter();
  return <button className="logout" type="button" onClick={async () => { const supabase = createSupabaseBrowserClient(); await supabase.auth.signOut(); router.replace("/login"); router.refresh(); }}>↪ Keluar</button>;
}
