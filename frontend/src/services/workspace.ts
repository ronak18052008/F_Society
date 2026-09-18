import { createClient } from "@/lib/supabase/client";
import {
  workspace as demoWorkspace,
  documents as demoDocuments,
  payments as demoPayments,
  maintenance as demoMaintenance,
  activity as demoActivity,
  passport as demoPassport,
} from "@/data/demo";
import type {
  ActivityEvent,
  ConditionPassport,
  DocumentRecord,
  MaintenanceRequest,
  PaymentRecord,
  RentalWorkspace,
} from "@/types";

const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_DATA_MODE !== "demo" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export async function fetchWorkspaceData(workspaceId: string): Promise<{
  workspace: RentalWorkspace;
  documents: DocumentRecord[];
  payments: PaymentRecord[];
  maintenance: MaintenanceRequest[];
  activity: ActivityEvent[];
  passport: ConditionPassport;
}> {
  if (!isSupabaseConfigured()) {
    return {
      workspace: demoWorkspace,
      documents: demoDocuments,
      payments: demoPayments,
      maintenance: demoMaintenance,
      activity: demoActivity,
      passport: demoPassport,
    };
  }

  const supabase = createClient()!;

  // Fetch workspace details + members
  const { data: wsData } = await supabase
    .from("rental_workspaces")
    .select("*, rental_members(*, profiles(*))")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!wsData) {
    return {
      workspace: demoWorkspace,
      documents: demoDocuments,
      payments: demoPayments,
      maintenance: demoMaintenance,
      activity: demoActivity,
      passport: demoPassport,
    };
  }

  // Extract tenant/owner names
  const members = (wsData as any).rental_members ?? [];
  const tenantMember = members.find((m: any) => m.role === "tenant");
  const ownerMember = members.find((m: any) => m.role === "owner");

  const workspace: RentalWorkspace = {
    id: wsData.id,
    propertyId: wsData.property_id,
    tenantName: tenantMember?.profiles?.name ?? "Tenant",
    ownerName: ownerMember?.profiles?.name ?? "Owner",
    startDate: wsData.start_date,
    rent: wsData.rent,
    deposit: wsData.deposit,
    agreementSummary: wsData.agreement_summary ?? "",
  };

  // Fetch documents
  const { data: docsData } = await supabase
    .from("rental_documents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("uploaded_at", { ascending: false });

  const documents: DocumentRecord[] = (docsData ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    status: d.status,
    uploadedAt: d.uploaded_at,
    visibleTo: d.visible_to,
    fileName: d.file_name,
  }));

  // Fetch payments
  const { data: paysData } = await supabase
    .from("rent_payments")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("due_on", { ascending: true });

  const payments: PaymentRecord[] = (paysData ?? []).map((p: any) => ({
    id: p.id,
    kind: p.kind,
    label: p.label,
    amount: p.amount,
    dueOn: p.due_on,
    status: p.status,
    source: p.source,
    proofName: p.proof_name ?? undefined,
  }));

  // Fetch maintenance
  const { data: maintData } = await supabase
    .from("maintenance_requests")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("opened_at", { ascending: false });

  const maintenance: MaintenanceRequest[] = (maintData ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    area: m.area,
    status: m.status,
    openedAt: m.opened_at,
    note: m.note ?? "",
  }));

  // Fetch activity
  const { data: actData } = await supabase
    .from("activity_events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("at", { ascending: false });

  const activity: ActivityEvent[] = (actData ?? []).map((a: any) => ({
    id: a.id,
    at: a.at,
    title: a.title,
    detail: a.detail ?? "",
  }));

  // Fetch passport
  const { data: passData } = await supabase
    .from("condition_passports")
    .select("*, passport_rooms(*, passport_photos(*))")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  let passport: ConditionPassport = demoPassport;
  if (passData) {
    passport = {
      rentalId: passData.workspace_id,
      tenantAcknowledgedAt: passData.tenant_acknowledged_at ?? undefined,
      ownerAcknowledgedAt: passData.owner_acknowledged_at ?? undefined,
      rooms: (passData as any).passport_rooms.map((r: any) => ({
        id: r.id,
        name: r.name,
        notes: r.notes ?? "",
        reviewRequired: r.review_required,
        photos: (r.passport_photos ?? []).map((ph: any) => ({
          id: ph.id,
          label: ph.label,
          src: ph.storage_path,
          takenAt: ph.taken_at,
        })),
      })),
    };
  }

  return {
    workspace,
    documents: documents.length > 0 ? documents : demoDocuments,
    payments: payments.length > 0 ? payments : demoPayments,
    maintenance: maintenance.length > 0 ? maintenance : demoMaintenance,
    activity: activity.length > 0 ? activity : demoActivity,
    passport,
  };
}

export async function createMaintenanceRequest(input: {
  workspaceId: string;
  reportedBy: string;
  title: string;
  area: string;
  note: string;
}): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  const supabase = createClient()!;
  const { error } = await supabase.from("maintenance_requests").insert({
    workspace_id: input.workspaceId,
    reported_by: input.reportedBy,
    title: input.title,
    area: input.area,
    note: input.note,
    status: "open",
  });
  return { error: error?.message ?? null };
}

export async function acknowledgePassport(params: {
  passportId: string;
  role: "tenant" | "owner";
}): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  const supabase = createClient()!;
  const updatePayload =
    params.role === "tenant"
      ? { tenant_acknowledged_at: new Date().toISOString() }
      : { owner_acknowledged_at: new Date().toISOString() };

  const { error } = await supabase
    .from("condition_passports")
    .update(updatePayload)
    .eq("id", params.passportId);

  return { error: error?.message ?? null };
}
