import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { SessionUser, UserRole } from "@/types";
import type { Profile } from "@/types/database";

export const DEMO_TENANT_USER: SessionUser = {
  id: "demo-tenant-id",
  name: "Ronak Marvaniya",
  email: "tenant@demo.nivasa",
  role: "tenant",
  city: "Ahmedabad",
};

export const DEMO_OWNER_USER: SessionUser = {
  id: "demo-owner-id",
  name: "Rudra Joshi",
  email: "owner@demo.nivasa",
  role: "owner",
  city: "Ahmedabad",
};

function setAuthCookies(role: UserRole, name: string) {
  if (typeof document !== "undefined") {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `nivasa_auth=1; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `nivasa_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `nivasa_user_name=${encodeURIComponent(name)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

function clearAuthCookies() {
  if (typeof document !== "undefined") {
    document.cookie = "nivasa_auth=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "nivasa_role=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "nivasa_user_name=; path=/; max-age=0; SameSite=Lax";
  }
}

export async function signUpUser(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  city?: string;
  phone?: string;
}): Promise<{ user: SessionUser | null; error: string | null }> {
  const normalizedEmail = params.email.trim().toLowerCase();

  if (!isSupabaseConfigured) {
    const fallbackUser: SessionUser = {
      id: `user-${normalizedEmail}`,
      name: params.name.trim(),
      email: normalizedEmail,
      role: params.role,
      city: params.city,
      phone: params.phone,
    };
    setAuthCookies(params.role, params.name.trim());
    return { user: fallbackUser, error: null };
  }

  const supabase = createClient();
  if (!supabase) {
    return { user: null, error: "Database client unavailable." };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: params.password,
    options: {
      data: {
        name: params.name.trim(),
        role: params.role,
      },
    },
  });

  if (authError || !authData.user) {
    return { user: null, error: authError?.message ?? "Failed to create account" };
  }

  // Ensure profile row exists in public.profiles
  try {
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      name: params.name.trim(),
      email: normalizedEmail,
      role: params.role,
      city: params.city ?? null,
      phone: params.phone ?? null,
    });
  } catch (err) {
    console.warn("Profile upsert notice:", err);
  }

  const user: SessionUser = {
    id: authData.user.id,
    name: params.name.trim(),
    email: normalizedEmail,
    role: params.role,
    city: params.city,
    phone: params.phone,
    supabaseId: authData.user.id,
    emailVerified: !!authData.user.email_confirmed_at,
  };

  setAuthCookies(params.role, params.name.trim());

  return { user, error: null };
}

export async function signInUser(params: {
  email: string;
  password: string;
  expectedRole?: UserRole;
}): Promise<{ user: SessionUser | null; error: string | null }> {
  const normalizedEmail = params.email.trim().toLowerCase();

  // 1. Explicit demo credentials shortcut
  if (
    normalizedEmail === "tenant@demo.nivasa" ||
    normalizedEmail === "demo.tenant@nivasa.living"
  ) {
    setAuthCookies("tenant", DEMO_TENANT_USER.name);
    return { user: DEMO_TENANT_USER, error: null };
  }

  if (
    normalizedEmail === "owner@demo.nivasa" ||
    normalizedEmail === "demo.owner@nivasa.living"
  ) {
    setAuthCookies("owner", DEMO_OWNER_USER.name);
    return { user: DEMO_OWNER_USER, error: null };
  }

  // 2. Real Supabase Authentication
  if (isSupabaseConfigured) {
    const supabase = createClient();
    if (supabase) {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: params.password,
        });

      if (!authError && authData.user) {
        // Fetch authoritative profile record from public.profiles
        let role: UserRole =
          (authData.user.user_metadata?.role as UserRole) || "tenant";
        let name: string =
          (authData.user.user_metadata?.name as string) ||
          normalizedEmail.split("@")[0] ||
          "Member";

        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .maybeSingle();

          if (profile) {
            const typed = profile as Profile;
            role = (typed.role as UserRole) || role;
            name = typed.name || name;
          } else {
            // Self-heal: create missing profile
            await supabase.from("profiles").upsert({
              id: authData.user.id,
              name,
              email: normalizedEmail,
              role,
            });
          }
        } catch (profileErr) {
          console.warn("Profile retrieval warning:", profileErr);
        }

        const authenticatedUser: SessionUser = {
          id: authData.user.id,
          name,
          email: normalizedEmail,
          role,
          supabaseId: authData.user.id,
          emailVerified: !!authData.user.email_confirmed_at,
        };

        setAuthCookies(role, name);

        return { user: authenticatedUser, error: null };
      }

      // If Supabase returned an error, check if local fallback has this user
      // (e.g. for offline development / test users created locally)
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: params.password,
            expectedRole: params.expectedRole,
          }),
        });
        const localData = await res.json();
        if (res.ok && localData.success && localData.user) {
          const localUser: SessionUser = {
            id: localData.user.id,
            name: localData.user.name,
            email: localData.user.email,
            role: localData.user.role,
          };
          setAuthCookies(localUser.role, localUser.name);
          return { user: localUser, error: null };
        }
      } catch {}

      // Return clean user-facing error message
      const errorMsg =
        authError?.message === "Invalid login credentials"
          ? "Invalid email or password. Please verify your credentials."
          : authError?.message || "Invalid email or password.";

      return { user: null, error: errorMsg };
    }
  }

  // 3. Fallback when Supabase is unconfigured (offline / demo mode)
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        password: params.password,
        expectedRole: params.expectedRole,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const fallbackUser: SessionUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };
      setAuthCookies(fallbackUser.role, fallbackUser.name);
      return { user: fallbackUser, error: null };
    }
    return { user: null, error: data.error || "Invalid email or password." };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : "Authentication error occurred.",
    };
  }
}

export async function signOutUser(): Promise<{ error: string | null }> {
  clearAuthCookies();

  if (isSupabaseConfigured) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message ?? null };
    }
  }
  return { error: null };
}

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) {
    return null;
  }
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    const typedProfile = profile as Profile | null;
    const role = (typedProfile?.role as UserRole) || (authUser.user_metadata?.role as UserRole) || "tenant";
    const name = typedProfile?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Member";

    return {
      id: authUser.id,
      name,
      email: authUser.email || "",
      role,
      city: typedProfile?.city ?? undefined,
      phone: typedProfile?.phone ?? undefined,
      supabaseId: authUser.id,
      emailVerified: !!authUser.email_confirmed_at,
    };
  } catch {
    return {
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Member",
      email: authUser.email || "",
      role: (authUser.user_metadata?.role as UserRole) || "tenant",
      supabaseId: authUser.id,
    };
  }
}
