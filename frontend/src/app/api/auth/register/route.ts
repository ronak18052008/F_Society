import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/user-store";
import type { UserRole } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please provide your full name (at least 2 characters)." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (role !== "tenant" && role !== "owner") {
      return NextResponse.json({ error: "Role must be either 'tenant' or 'owner'." }, { status: 400 });
    }

    const { user, error } = registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role: role as UserRole,
    });

    if (error || !user) {
      return NextResponse.json({ error: error || "Failed to create account." }, { status: 400 });
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
    });

    // Set secure authentication cookies for role-based navigation and middleware
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    res.cookies.set("nivasa_auth", "1", { path: "/", maxAge, sameSite: "lax" });
    res.cookies.set("nivasa_role", user.role, { path: "/", maxAge, sameSite: "lax" });
    res.cookies.set("nivasa_user_name", encodeURIComponent(user.name), { path: "/", maxAge, sameSite: "lax" });
    res.cookies.set("sb-access-token", `token-${user.id}`, { path: "/", maxAge, sameSite: "lax" });

    return res;
  } catch (err) {
    console.error("[Auth Register API] Error:", err);
    return NextResponse.json({ error: "Internal server error during registration." }, { status: 500 });
  }
}
