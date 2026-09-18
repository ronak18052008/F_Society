"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  useEffect,
  useRef,
} from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { seedEnquiries } from "@/data/demo";
import type { Enquiry, SessionUser, UserRole } from "@/types";

type Toast = { id: string; message: string };

type DraftListing = {
  id: string;
  title: string;
  city: string;
  rent: number;
  status: "draft";
};

type RoommatePrefs = {
  budget: number;
  city: string;
  food: string;
  sleep: string;
  smoking: string;
};

type Persisted = {
  user: SessionUser | null;
  savedIds: string[];
  enquiries: Enquiry[];
  drafts: DraftListing[];
  blockedRoommateIds: string[];
  connectedRoommateIds: string[];
  roommatePrivacy: "limited" | "hidden";
  roommatePrefs: RoommatePrefs;
  tenantReqs: { budget: number; cities: string[]; type: string; notes: string };
};

type Store = Persisted & {
  toasts: Toast[];
  signIn: (user: SessionUser) => void;
  signOut: () => void;
  toggleSave: (propertyId: string) => void;
  addEnquiry: (propertyId: string, message: string) => void;
  addDraft: (draft: Omit<DraftListing, "id" | "status">) => void;
  blockRoommate: (id: string) => void;
  connectRoommate: (id: string) => void;
  setPrivacy: (value: "limited" | "hidden") => void;
  setRoommatePrefs: (value: RoommatePrefs) => void;
  setTenantReqs: (value: Persisted["tenantReqs"]) => void;
  switchRole: (role: UserRole) => void;
  toast: (message: string) => void;
  dismissToast: (id: string) => void;
};

const KEY = "nivasa-store-v1";
const listeners = new Set<() => void>();

const defaults: Persisted = {
  user: null,
  savedIds: ["prop-navrang-02"],
  enquiries: seedEnquiries,
  drafts: [],
  blockedRoommateIds: [],
  connectedRoommateIds: [],
  roommatePrivacy: "limited",
  roommatePrefs: {
    budget: 15000,
    city: "Ahmedabad",
    food: "veg",
    sleep: "early",
    smoking: "no",
  },
  tenantReqs: {
    budget: 30000,
    cities: ["Ahmedabad"],
    type: "apartment",
    notes: "Prefer a quiet street. Weekday commute by two-wheeler.",
  },
};

let memory: Persisted = defaults;
let loaded = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function readStorage(): Persisted {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<Persisted>) };
  } catch {
    return defaults;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    queueMicrotask(() => {
      if (loaded) return;
      memory = readStorage();
      loaded = true;
      emit();
    });
  }
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return memory;
}

function getServerSnapshot() {
  return defaults;
}

function write(next: Persisted) {
  memory = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  emit();
}

const StoreContext = createContext<Store | null>(null);

export function NivasaProvider({ children }: { children: React.ReactNode }) {
  const persisted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...persisted,
      toasts,
      signIn: (user) => {
        const current = getSnapshot().user;
        if (
          current &&
          current.id === user.id &&
          current.email === user.email &&
          current.role === user.role &&
          current.supabaseId === user.supabaseId
        ) {
          return;
        }
        write({ ...getSnapshot(), user });
      },
      signOut: () => {
        if (getSnapshot().user === null) return;
        write({ ...getSnapshot(), user: null });
      },
      toggleSave: (propertyId) => {
        const current = getSnapshot();
        const isSaved = current.savedIds.includes(propertyId);
        const nextSavedIds = isSaved
          ? current.savedIds.filter((id) => id !== propertyId)
          : [...current.savedIds, propertyId];
        write({
          ...current,
          savedIds: nextSavedIds,
        });
        const supabase = createClient();
        if (supabase && current.user?.supabaseId) {
          if (isSaved) {
            supabase
              .from("saved_properties")
              .delete()
              .eq("user_id", current.user.supabaseId)
              .eq("property_id", propertyId)
              .then(() => {});
          } else {
            supabase
              .from("saved_properties")
              .insert({
                user_id: current.user.supabaseId,
                property_id: propertyId,
              })
              .then(() => {});
          }
        }
      },
      addEnquiry: (propertyId, message) => {
        const current = getSnapshot();
        const enquiry: Enquiry = {
          id: crypto.randomUUID(),
          propertyId,
          fromName: current.user?.name ?? "Guest",
          message,
          createdAt: new Date().toISOString(),
          status: "sent",
        };
        write({ ...current, enquiries: [enquiry, ...current.enquiries] });
        toast("Enquiry stored in this browser only. No message was sent.");
      },
      addDraft: (draft) => {
        const current = getSnapshot();
        write({
          ...current,
          drafts: [
            { ...draft, id: crypto.randomUUID(), status: "draft" },
            ...current.drafts,
          ],
        });
        toast("Draft listing saved locally. It is not published.");
      },
      blockRoommate: (id) => {
        const current = getSnapshot();
        write({
          ...current,
          blockedRoommateIds: [...new Set([...current.blockedRoommateIds, id])],
          connectedRoommateIds: current.connectedRoommateIds.filter((item) => item !== id),
        });
      },
      connectRoommate: (id) => {
        const current = getSnapshot();
        write({
          ...current,
          connectedRoommateIds: [...new Set([...current.connectedRoommateIds, id])],
        });
      },
      setPrivacy: (roommatePrivacy) => write({ ...getSnapshot(), roommatePrivacy }),
      setRoommatePrefs: (roommatePrefs) => write({ ...getSnapshot(), roommatePrefs }),
      setTenantReqs: (tenantReqs) => write({ ...getSnapshot(), tenantReqs }),
      switchRole: (role) => {
        const current = getSnapshot();
        if (current.user) {
          write({ ...current, user: { ...current.user, role } });
          toast(`Workspace role updated to ${role === "owner" ? "Property Owner" : "Tenant Member"}`);
        } else {
          const demoUser = role === "owner" ? DEMO_OWNER : DEMO_TENANT;
          write({ ...current, user: demoUser });
          toast(`Signed in as demo ${role === "owner" ? "Property Owner" : "Tenant Member"}`);
        }
      },
      toast,
      dismissToast: (id) =>
        setToasts((current) => current.filter((item) => item.id !== id)),
    }),
    [persisted, toast, toasts],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const DEMO_TENANT: SessionUser = {
  id: "demo-tenant",
  name: "Demo Tenant",
  email: "demo.tenant@nivasa.living",
  role: "tenant",
  city: "Mumbai",
  phone: "+91 98201 54321",
  emailVerified: true,
};

export const DEMO_OWNER: SessionUser = {
  id: "demo-owner",
  name: "Demo Owner",
  email: "demo.owner@nivasa.living",
  role: "owner",
  city: "Mumbai",
  phone: "+91 98210 98765",
  emailVerified: true,
};

export function useNivasa() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useNivasa must be used within NivasaProvider");
  return ctx;
}

export function makeUser(input: {
  name: string;
  email: string;
  role: UserRole;
}): SessionUser {
  return {
    id: `user-${input.email}`,
    name: input.name,
    email: input.email,
    role: input.role,
  };
}

export function useSupabaseSync() {
  const supabase = createClient();
  const { signIn, signOut, toast, user } = useNivasa();

  const signInRef = useRef(signIn);
  const signOutRef = useRef(signOut);
  const toastRef = useRef(toast);
  const userRef = useRef(user);

  useEffect(() => {
    signInRef.current = signIn;
    signOutRef.current = signOut;
    toastRef.current = toast;
    userRef.current = user;
  });

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        if (userRef.current?.supabaseId !== session.user.id) {
          const meta = session.user.user_metadata;
          signInRef.current({
            id: session.user.id,
            name: (meta?.name as string) || session.user.email?.split("@")[0] || "",
            email: session.user.email || "",
            role: (meta?.role as "tenant" | "owner") || "tenant",
            supabaseId: session.user.id,
            emailVerified: !!session.user.email_confirmed_at,
          });
        }
      } else {
        if (userRef.current !== null) {
          signOutRef.current();
        }
      }
    });

    let unsubscribeRealtime: (() => void) | null = null;
    try {
      const channel = supabase
        .channel("public:enquiries-global")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "enquiries",
          },
          (payload: any) => {
            if (payload.new) {
              const newRecord = payload.new as Record<string, any>;
              toastRef.current(`Incoming inquiry from ${newRecord.from_name || "member"}`);
            }
          },
        )
        .subscribe();

      unsubscribeRealtime = () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Realtime error:", err);
    }

    return () => {
      subscription.unsubscribe();
      if (unsubscribeRealtime) unsubscribeRealtime();
    };
  }, [supabase]);

  return { supabase, isConfigured: isSupabaseConfigured };
}
