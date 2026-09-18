"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
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
  toast: (message: string) => void;
  dismissToast: (id: string) => void;
};

const KEY = "nestora-prototype-v1";
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

export function NestoraProvider({ children }: { children: React.ReactNode }) {
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
      signIn: (user) => write({ ...getSnapshot(), user }),
      signOut: () => write({ ...getSnapshot(), user: null }),
      toggleSave: (propertyId) => {
        const current = getSnapshot();
        write({
          ...current,
          savedIds: current.savedIds.includes(propertyId)
            ? current.savedIds.filter((id) => id !== propertyId)
            : [...current.savedIds, propertyId],
        });
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
      toast,
      dismissToast: (id) =>
        setToasts((current) => current.filter((item) => item.id !== id)),
    }),
    [persisted, toast, toasts],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useNestora() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useNestora must be used within NestoraProvider");
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
