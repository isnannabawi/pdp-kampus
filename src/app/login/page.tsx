"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw new Error("Email atau password yang dimasukkan salah.");
      const profileResponse = await fetch("/api/auth/me");
      if (!profileResponse.ok) {
        await supabase.auth.signOut();
        throw new Error(profileResponse.status === 403 ? "Akun Anda belum diberi akses portal internal." : "Sesi login tidak dapat diverifikasi.");
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="login-page"><div className="login-brand"><Link href="/" className="brand"><span className="brand-mark">✦</span><span>Sistem <strong>Prestasi</strong></span></Link></div><form className="login-card" onSubmit={handleSubmit}><p className="eyebrow">PORTAL INTERNAL</p><h1>Selamat datang<br /><em>kembali.</em></h1><p className="form-help">Masuk untuk mengelola dan memverifikasi pengajuan prestasi.</p><label>Email kampus<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@kampus.ac.id" autoComplete="email" /></label><label>Password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" autoComplete="current-password" /></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="button button-dark form-next" disabled={loading} type="submit">{loading ? "Memeriksa..." : "Masuk ke dashboard"} <span>→</span></button><Link href="/" className="back-link login-back">← Kembali ke beranda</Link></form><p className="login-footer">Akses terbatas untuk verifikator dan administrator.</p></main>;
}
