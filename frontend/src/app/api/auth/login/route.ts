import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { authenticateUser } from "@/lib/auth/user-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, expectedRole } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Please enter your email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Please enter your password." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try Supabase Auth if configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (url && key) {
      const cookieJar: { name: string; value: string; options?: any }[] = [];
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookieJar.push(...cookiesToSet);
          },
        },
      });

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!authError && authData.user) {
        let role = (authData.user.user_metadata?.role as string) || "tenant";
        let name = (authData.user.user_metadata?.name as string) || normalizedEmail.split("@")[0] || "Member";

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .maybeSingle();

          if (profile) {
            role = profile.role || role;
            name = profile.name || name;
          }
        } catch {}

        const res = NextResponse.json({
          success: true,
          user: {
            id: authData.user.id,
            name,
            email: authData.user.email || normalizedEmail,
            role,
          },
          redirectTo: role === "owner" ? "/owner" : "/tenant",
          roleMatched: expectedRole ? expectedRole === role : true,
        });

        // Apply any Supabase session cookies
        cookieJar.forEach(({ name: cName, value: cVal, options: cOpts }) => {
          res.cookies.set(cName, cVal, cOpts);
        });

        const maxAge = 60 * 60 * 24 * 7;
        res.cookies.set("nivasa_auth", "1", { path: "/", maxAge, sameSite: "lax" });
        res.cookies.set("nivasa_role", role, { path: "/", maxAge, sameSite: "lax" });
        res.cookies.set("nivasa_user_name", encodeURIComponent(name), { path: "/", maxAge, sameSite: "lax" });
        res.cookies.set("sb-access-token", `token-${authData.user.id}`, { path: "/", maxAge, sameSite: "lax" });

        return res;
      }
    }

    // 2. Fallback to local authentication store (for offline / demo users)
    const { user, error } = authenticateUser(normalizedEmail, password);

    if (error || !user) {
      return NextResponse.json({ error: error || "Invalid email or password." }, { status: 401 });
    }

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectTo: user.role === "owner" ? "/owner" : "/tenant",
      roleMatched: expectedRole ? expectedRole === user.role : true,
    });

    // Set secure authentication cookies for role-based navigation and middleware
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    res.cookies.set("nivasa_auth", "1", { path: "/", maxAge, sameSite: "lax" });
    res.cookies.set("nivasa_role", user.role, { path: "/", maxAge, sameSite: "lax" });
    res.cookies.set("nivasa_user_name", encodeURIComponent(user.name), { path: "/", maxAge, sameSite: "lax" });
    res.cookies.set("sb-access-token", `token-${user.id}`, { path: "/", maxAge, sameSite: "lax" });

    return res;
  } catch (err) {
    console.error("[Auth Login API] Error:", err);
    return NextResponse.json({ error: "Internal server error during authentication." }, { status: 500 });
  }
}
