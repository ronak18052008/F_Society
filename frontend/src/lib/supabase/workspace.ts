import { createClient, isDemoFallbackAllowed } from "./client";
import {
  workspace as demoWorkspace,
  documents as demoDocuments,
  payments as demoPayments,
  maintenance as demoMaintenance,
  activity as demoActivity,
} from "@/data/demo";
import type {
  RentalWorkspace,
  DocumentRecord,
  PaymentRecord,
  MaintenanceRequest,
  ActivityEvent,
} from "@/types";

export async function getWorkspace(rentalId: string): Promise<RentalWorkspace | null> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("rental_workspaces")
        .select("*")
        .eq("id", rentalId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          propertyId: data.property_id,
          tenantName: data.tenant_name,
          ownerName: data.owner_name,
          startDate: data.start_date,
          rent: Number(data.rent),
          deposit: Number(data.deposit),
          agreementSummary: data.agreement_summary || undefined,
        };
      }
    } catch (err) {
      console.warn("Failed to fetch rental workspace from Supabase:", err);
    }
  }

  if (!isDemoFallbackAllowed()) {
    return null;
  }

  return demoWorkspace;
}

export async function getWorkspaceDocuments(workspaceId: string): Promise<DocumentRecord[]> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("workspace_documents")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("uploaded_at", { ascending: false });

      if (!error && data) {
        interface DBDocument {
          id: string;
          title: string;
          category: DocumentRecord["category"];
          status: DocumentRecord["status"];
          uploaded_at: string;
          visible_to: ("tenant" | "owner")[];
          file_name: string;
          file_url: string | null;
          storage_path: string | null;
        }
        return (data as unknown as DBDocument[]).map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          status: d.status,
          uploadedAt: d.uploaded_at,
          visibleTo: d.visible_to || ["tenant", "owner"],
          fileName: d.file_name,
          fileUrl: d.file_url || undefined,
          storagePath: d.storage_path || undefined,
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch workspace documents:", err);
    }
  }

  if (!isDemoFallbackAllowed()) {
    return [];
  }

  return demoDocuments;
}

export async function addWorkspaceDocument(
  workspaceId: string,
  doc: Omit<DocumentRecord, "id" | "uploadedAt">,
): Promise<DocumentRecord> {
  const supabase = createClient();
  const now = new Date().toISOString();

  if (!supabase) {
    return {
      id: `doc-${Date.now()}`,
      uploadedAt: now,
      ...doc,
    };
  }

  try {
    const { data, error } = await supabase
      .from("workspace_documents")
      .insert({
        workspace_id: workspaceId,
        title: doc.title,
        category: doc.category,
        status: doc.status,
        visible_to: doc.visibleTo,
        file_name: doc.fileName,
        file_url: doc.fileUrl || null,
        storage_path: doc.storagePath || null,
      })
      .select()
      .single();

    if (!error && data) {
      await logWorkspaceActivity(
        workspaceId,
        "Document uploaded",
        `New document "${doc.title}" was shared in workspace.`,
      );

      return {
        id: data.id,
        title: data.title,
        category: data.category,
        status: data.status,
        uploadedAt: data.uploaded_at,
        visibleTo: data.visible_to,
        fileName: data.file_name,
        fileUrl: data.file_url,
        storagePath: data.storage_path,
      };
    }
  } catch (err) {
    console.warn("Error adding document:", err);
  }

  return {
    id: `doc-${Date.now()}`,
    uploadedAt: now,
    ...doc,
  };
}

export async function getWorkspacePayments(workspaceId: string): Promise<PaymentRecord[]> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("workspace_payments")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("due_on", { ascending: false });

      if (!error && data) {
        interface DBPayment {
          id: string;
          kind: PaymentRecord["kind"];
          label: string;
          amount: number;
          due_on: string;
          status: PaymentRecord["status"];
          source: PaymentRecord["source"];
          proof_name: string | null;
          proof_url: string | null;
          proof_storage_path: string | null;
        }
        return (data as unknown as DBPayment[]).map((p) => ({
          id: p.id,
          kind: p.kind,
          label: p.label,
          amount: Number(p.amount),
          dueOn: p.due_on,
          status: p.status,
          source: p.source,
          proofName: p.proof_name || undefined,
          proofUrl: p.proof_url || undefined,
          proofStoragePath: p.proof_storage_path || undefined,
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch workspace payments:", err);
    }
  }

  if (!isDemoFallbackAllowed()) {
    return [];
  }

  return demoPayments;
}

export async function markPaymentPaid(
  workspaceId: string,
  paymentId: string,
  proofUrl?: string,
  proofName?: string,
): Promise<boolean> {
  const supabase = createClient();

  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from("workspace_payments")
      .update({
        status: proofUrl ? "proof-uploaded" : "paid",
        proof_url: proofUrl || null,
        proof_name: proofName || null,
      })
      .eq("id", paymentId);

    if (!error) {
      await logWorkspaceActivity(
        workspaceId,
        "Payment updated",
        `Payment record was marked as ${proofUrl ? "proof uploaded" : "paid"}.`,
      );
    }

    return !error;
  } catch {
    return true;
  }
}

export async function getWorkspaceMaintenance(
  workspaceId: string,
): Promise<MaintenanceRequest[]> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("workspace_maintenance")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("opened_at", { ascending: false });

      if (!error && data) {
        interface DBMaintenance {
          id: string;
          title: string;
          area: string;
          status: MaintenanceRequest["status"];
          opened_at: string;
          note: string | null;
          photos: string[] | null;
          assigned_to: string | null;
          resolved_at: string | null;
        }
        return (data as unknown as DBMaintenance[]).map((m) => ({
          id: m.id,
          title: m.title,
          area: m.area,
          status: m.status,
          openedAt: m.opened_at,
          note: m.note || "",
          photos: m.photos || [],
          assignedTo: m.assigned_to || undefined,
          resolvedAt: m.resolved_at || undefined,
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch workspace maintenance:", err);
    }
  }

  if (!isDemoFallbackAllowed()) {
    return [];
  }

  return demoMaintenance;
}

export async function createMaintenanceRequest(
  workspaceId: string,
  req: Omit<MaintenanceRequest, "id" | "openedAt">,
): Promise<MaintenanceRequest> {
  const supabase = createClient();
  const now = new Date().toISOString();

  if (!supabase) {
    return {
      id: `mnt-${Date.now()}`,
      openedAt: now,
      ...req,
    };
  }

  try {
    const { data, error } = await supabase
      .from("workspace_maintenance")
      .insert({
        workspace_id: workspaceId,
        title: req.title,
        area: req.area,
        status: req.status || "open",
        note: req.note || "",
        photos: req.photos || [],
      })
      .select()
      .single();

    if (!error && data) {
      await logWorkspaceActivity(
        workspaceId,
        "Maintenance ticket opened",
        `New request: "${req.title}" for ${req.area}.`,
      );

      return {
        id: data.id,
        title: data.title,
        area: data.area,
        status: data.status,
        openedAt: data.opened_at,
        note: data.note,
        photos: data.photos,
      };
    }
  } catch (err) {
    console.warn("Error creating maintenance request:", err);
  }

  return {
    id: `mnt-${Date.now()}`,
    openedAt: now,
    ...req,
  };
}

export async function getWorkspaceActivity(workspaceId: string): Promise<ActivityEvent[]> {
  const supabase = createClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("workspace_activity")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("at", { ascending: false });

      if (!error && data) {
        interface DBActivity {
          id: string;
          at: string;
          title: string;
          detail: string;
        }
        return (data as unknown as DBActivity[]).map((a) => ({
          id: a.id,
          at: a.at,
          title: a.title,
          detail: a.detail,
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch workspace activity:", err);
    }
  }

  if (!isDemoFallbackAllowed()) {
    return [];
  }

  return demoActivity;
}

export async function logWorkspaceActivity(
  workspaceId: string,
  title: string,
  detail: string,
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  try {
    await supabase.from("workspace_activity").insert({
      workspace_id: workspaceId,
      title,
      detail,
    });
  } catch (err) {
    console.warn("Failed to log activity:", err);
  }
}

export async function createWorkspace(
  workspaceData: Partial<RentalWorkspace> & {
    propertyId: string;
    tenantId?: string;
    ownerId?: string;
    tenantName?: string;
    ownerName?: string;
    startDate?: string;
    rent?: number;
    deposit?: number;
    agreementSummary?: string;
  },
): Promise<{ data: RentalWorkspace | null; error: string | null }> {
  const supabase = createClient();

  if (!supabase) {
    return { data: null, error: "Supabase not configured" };
  }

  try {
    const row = {
      property_id: workspaceData.propertyId,
      tenant_id: workspaceData.tenantId || null,
      owner_id: workspaceData.ownerId || null,
      tenant_name: workspaceData.tenantName || "Tenant",
      owner_name: workspaceData.ownerName || "Owner",
      start_date: workspaceData.startDate || "2026-08-01",
      rent: workspaceData.rent ?? 0,
      deposit: workspaceData.deposit ?? 0,
      agreement_summary: workspaceData.agreementSummary || "",
      status: "active",
    };

    const { data, error } = await supabase
      .from("rental_workspaces")
      .insert(row)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: {
        id: data.id,
        propertyId: data.property_id,
        tenantName: data.tenant_name,
        ownerName: data.owner_name,
        startDate: data.start_date,
        rent: Number(data.rent),
        deposit: Number(data.deposit),
        agreementSummary: data.agreement_summary || undefined,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to create workspace",
    };
  }
}

