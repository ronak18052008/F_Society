import { createClient } from "@/lib/supabase/client";
import type { SessionUser, UserRole } from "@/types";
import type { Profile } from "@/types/database";

const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_DATA_MODE !== "demo" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export async function signUpUser(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  city?: string;
  phone?: string;
}): Promise<{ user: SessionUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Fallback: Local demo user creation
    return {
      user: {
        id: `user-${params.email}`,
        name: params.name,
        email: params.email,
        role: params.role,
        city: params.city,
        phone: params.phone,
      },
      error: null,
    };
  }

  const supabase = createClient()!;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        name: params.name,
        role: params.role,
      },
    },
  });

  if (authError || !authData.user) {
    return { user: null, error: authError?.message ?? "Failed to sign up" };
  }

  // Insert profile record
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    name: params.name,
    email: params.email,
    role: params.role,
    city: params.city ?? null,
    phone: params.phone ?? null,
  });

  if (profileError) {
    return { user: null, error: profileError.message };
  }

  return {
    user: {
      id: authData.user.id,
      name: params.name,
      email: params.email,
      role: params.role,
      city: params.city,
      phone: params.phone,
    },
    error: null,
  };
}

export async function signInUser(params: {
  email: string;
  password: string;
}): Promise<{ user: SessionUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      user: {
        id: `user-${params.email}`,
        name: params.email.split("@")[0] || "Demo User",
        email: params.email,
        role: "tenant",
      },
      error: null,
    };
  }

  const supabase = createClient()!;
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (authError || !authData.user) {
    return { user: null, error: authError?.message ?? "Invalid credentials" };
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    return {
      user: {
        id: authData.user.id,
        name: authData.user.user_metadata?.name ?? "User",
        email: authData.user.email ?? params.email,
        role: (authData.user.user_metadata?.role as UserRole) ?? "tenant",
      },
      error: null,
    };
  }

  const typedProfile = profile as Profile;
  return {
    user: {
      id: typedProfile.id,
      name: typedProfile.name,
      email: typedProfile.email,
      role: typedProfile.role as UserRole,
      city: typedProfile.city ?? undefined,
      phone: typedProfile.phone ?? undefined,
    },
    error: null,
  };
}

export async function signOutUser(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  const supabase = createClient()!;
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const supabase = createClient()!;
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) return null;
  const typedProfile = profile as Profile;

  return {
    id: typedProfile.id,
    name: typedProfile.name,
    email: typedProfile.email,
    role: typedProfile.role as UserRole,
    city: typedProfile.city ?? undefined,
    phone: typedProfile.phone ?? undefined,
  };
}
