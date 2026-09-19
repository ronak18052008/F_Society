import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Handles authentication and role-based route access controls.
 * Supports both Supabase session tokens and client session cookies.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let supabaseResponse = NextResponse.next({ request });

  // Read cookies
  const hasAuthCookie = request.cookies.get("nivasa_auth")?.value === "1";
  const roleCookie = request.cookies.get("nivasa_role")?.value;

  let isAuthenticated = hasAuthCookie;
  let userRole = roleCookie || "tenant";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && key) {
    try {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        isAuthenticated = true;
        if (user.user_metadata?.role) {
          userRole = user.user_metadata.role;
        }
      }
    } catch {
      // Fallback to cookie check
    }
  }

  // 1. Protect /tenant routes
  if (pathname.startsWith("/tenant") && pathname !== "/tenant/login") {
    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole === "owner") {
      const ownerUrl = request.nextUrl.clone();
      ownerUrl.pathname = "/owner";
      return NextResponse.redirect(ownerUrl);
    }
  }

  // 2. Protect /owner routes
  if (pathname.startsWith("/owner") && pathname !== "/owner/login") {
    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole === "tenant") {
      const tenantUrl = request.nextUrl.clone();
      tenantUrl.pathname = "/tenant";
      return NextResponse.redirect(tenantUrl);
    }
  }

  // 3. Protect /copilot routes
  if (pathname.startsWith("/copilot")) {
    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Redirect logged-in users away from /login or /register variants
  const authPaths = [
    "/login",
    "/register",
    "/login/tenant",
    "/login/owner",
    "/tenant/login",
    "/owner/login",
  ];
  if (authPaths.includes(pathname) && isAuthenticated) {
    const targetDashboard = request.nextUrl.clone();
    targetDashboard.pathname = userRole === "owner" ? "/owner" : "/tenant";
    return NextResponse.redirect(targetDashboard);
  }

  return supabaseResponse;
}
