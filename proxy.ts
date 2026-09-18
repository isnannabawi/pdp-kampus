import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const isProtected = request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/api/admin");
  if (!user && isProtected) {
    if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "Autentikasi diperlukan." }, { status: 401 });
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && isProtected) {
    const { data: profile } = await supabase.from("profil_internal").select("id").eq("id", user.id).maybeSingle();
    if (!profile) {
      if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "Akun tidak memiliki akses internal." }, { status: 403 });
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
    }
  }
  if (user && request.nextUrl.pathname === "/login") return NextResponse.redirect(new URL("/dashboard", request.url));
  return response;
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/api/admin/:path*"],
};
