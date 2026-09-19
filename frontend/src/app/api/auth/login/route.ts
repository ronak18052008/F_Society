import { NextRequest, NextResponse } from "next/server";
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

    const { user, error } = authenticateUser(email.trim(), password);

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
