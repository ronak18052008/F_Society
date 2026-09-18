"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNivasa } from "@/store/nivasa-store";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";

export default function ProfilePage() {
  const { user, signOut, savedIds, enquiries, toast, signIn } = useNivasa();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [city, setCity] = useState("Bengaluru");

  if (!user) {
    return (
      <div className="wrap py-16 text-center max-w-lg mx-auto">
        <div className="p-8 rounded-3xl bg-card border border-line shadow-card space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-[#6E9271]/15 text-[#6E9271] flex items-center justify-center mx-auto text-xl font-bold font-serif">
            F
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink">Account Access Required</h1>
          <p className="text-sm text-ink-muted">
            Sign in to access your F_Society profile, verified credentials, and personalized tenancy workspace.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => router.push("/login?next=/profile")}>
              Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                signIn({
                  id: "usr-demo-tenant",
                  name: "Arjun Verma",
                  email: "arjun.v@example.com",
                  role: "tenant",
                });
                toast("Signed in with Demo Tenant session");
              }}
            >
              Try Demo Tenant
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FS";

  return (
    <div className="wrap py-10 max-w-4xl space-y-8">
      {/* Profile Header Header */}
      <div className="rounded-3xl bg-card border border-line p-6 sm:p-8 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6E9271]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#7ca982] to-[#57875d] text-white flex items-center justify-center text-2xl font-serif font-bold shadow-md shadow-[#7ca982]/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">{user.name}</h1>
                <StatusBadge tone="ok">Verified Member</StatusBadge>
              </div>
              <p className="text-sm text-ink-muted mt-1">{user.email}</p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7ca982] dark:text-[#a3caa6]">
                <span className="h-2 w-2 rounded-full bg-[#7ca982]" />
                <span>F_Society {user.role === "owner" ? "Property Owner" : "Tenant Member"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => {
                if (isEditing) {
                  toast("Profile preferences updated");
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                signOut();
                toast("Signed out successfully");
                router.push("/");
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-line shadow-card">
          <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">Saved Homes</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">{savedIds.length}</p>
          <Link href="/homes" className="text-xs text-[#7ca982] hover:underline mt-2 inline-block font-medium">
            Browse directory &rarr;
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-line shadow-card">
          <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">Inquiries Sent</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">{enquiries.length}</p>
          <Link href={user.role === "owner" ? "/owner/dashboard" : "/tenant/dashboard"} className="text-xs text-[#7ca982] hover:underline mt-2 inline-block font-medium">
            View messages &rarr;
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-line shadow-card">
          <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">KYC Clearance</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-[#7ca982] mt-1">Tier 1 Verified</p>
          <span className="text-xs text-ink-muted mt-2 inline-block">Aadhaar + PAN match</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-line shadow-card">
          <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">Trust Score</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#57875d] dark:text-[#a3caa6] mt-1">94<span className="text-sm font-normal text-ink-muted">/100</span></p>
          <span className="text-xs text-ink-muted mt-2 inline-block">RentTruth Index</span>
        </div>
      </div>

      {/* Personal & Workspace Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-card border border-line p-6 shadow-card space-y-5">
          <h2 className="font-serif text-lg font-bold text-ink">Personal Information</h2>
          <div className="space-y-4">
            <Field
              label="Full Name"
              value={isEditing ? name : user.name}
              disabled={!isEditing}
              onChange={(val) => setName(val)}
            />
            <Field
              label="Email Address"
              value={user.email}
              disabled
              hint="Managed via Supabase Authentication"
            />
            <Field
              label="Contact Phone"
              value={phone}
              disabled={!isEditing}
              onChange={(val) => setPhone(val)}
            />
            <Field
              label="Primary City"
              value={city}
              disabled={!isEditing}
              onChange={(val) => setCity(val)}
            />
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-line p-6 shadow-card space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">Workspace & Permissions</h2>
            <p className="text-sm text-ink-muted mt-1">
              Your active role determines your workspace capabilities, listings management, and tenant communication channels.
            </p>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-paper border border-line flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">Current Role</p>
                  <p className="text-xs text-ink-muted">
                    {user.role === "owner" ? "Property Owner (Listing & Lease Manager)" : "Tenant (Searcher & Verified Renter)"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newRole = user.role === "owner" ? "tenant" : "owner";
                    signIn({ ...user, role: newRole });
                    toast(`Switched role to ${newRole}`);
                  }}
                >
                  Switch to {user.role === "owner" ? "Tenant" : "Owner"}
                </Button>
              </div>

              <div className="p-4 rounded-2xl bg-paper border border-line flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">Direct Command Center</p>
                  <p className="text-xs text-ink-muted">Access your primary management console</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(user.role === "owner" ? "/owner/dashboard" : "/tenant/dashboard")}
                >
                  Open Dashboard
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-line">
            <p className="text-xs text-ink-muted">
              F_Society Protocol v2.4 · All data secured with end-to-end lease encryption and verified digital signatures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
