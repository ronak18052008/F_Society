/**
 * @file Supabase Database Types
 * @description TypeScript type definitions matching the actual NIVASA database schema.
 *              Generated from supabase/migrations/001–007.
 *
 * These types provide compile-time safety for all Supabase queries.
 * Row = what you get from SELECT
 * Insert = what you pass to INSERT (optional fields have defaults in the DB)
 * Update = what you pass to UPDATE (all fields optional)
 * Relationships = foreign key relationships
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      /* ------------------------------------------------------------------ */
      /*  profiles (001_profiles.sql)                                       */
      /* ------------------------------------------------------------------ */
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "tenant" | "owner";
          city: string | null;
          phone: string | null;
          listed_since: string | null;
          response_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: "tenant" | "owner";
          city?: string | null;
          phone?: string | null;
          listed_since?: string | null;
          response_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "tenant" | "owner";
          city?: string | null;
          phone?: string | null;
          listed_since?: string | null;
          response_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  properties (002_properties.sql)                                   */
      /* ------------------------------------------------------------------ */
      properties: {
        Row: {
          id: string;
          slug: string;
          title: string;
          locality: string;
          city: string;
          property_type: "apartment" | "studio" | "villa" | "independent-floor";
          furnishing: "furnished" | "semi-furnished" | "unfurnished";
          suitability: string[];
          bedrooms: number;
          bathrooms: number;
          area_sqft: number;
          rent: number;
          deposit: number;
          available_from: string;
          amenities: string[];
          images: string[];
          owner_id: string;
          verification: "identity-checked" | "listing-unverified" | "documents-pending";
          description: string;
          lat: number | null;
          lng: number | null;
          is_published: boolean;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          locality: string;
          city: string;
          property_type: "apartment" | "studio" | "villa" | "independent-floor";
          furnishing: "furnished" | "semi-furnished" | "unfurnished";
          suitability?: string[];
          bedrooms: number;
          bathrooms: number;
          area_sqft: number;
          rent: number;
          deposit: number;
          available_from: string;
          amenities?: string[];
          images?: string[];
          owner_id: string;
          verification?: "identity-checked" | "listing-unverified" | "documents-pending";
          description?: string;
          lat?: number | null;
          lng?: number | null;
          is_published?: boolean;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          locality?: string;
          city?: string;
          property_type?: "apartment" | "studio" | "villa" | "independent-floor";
          furnishing?: "furnished" | "semi-furnished" | "unfurnished";
          suitability?: string[];
          bedrooms?: number;
          bathrooms?: number;
          area_sqft?: number;
          rent?: number;
          deposit?: number;
          available_from?: string;
          amenities?: string[];
          images?: string[];
          owner_id?: string;
          verification?: "identity-checked" | "listing-unverified" | "documents-pending";
          description?: string;
          lat?: number | null;
          lng?: number | null;
          is_published?: boolean;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  property_expenses (002_properties.sql)                            */
      /* ------------------------------------------------------------------ */
      property_expenses: {
        Row: {
          id: string;
          property_id: string;
          label: string;
          amount: number;
          cadence: "monthly" | "one-time" | "deposit";
          source: "owner-provided" | "uploaded-bill" | "estimated" | "verified" | "demo";
          note: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          property_id: string;
          label: string;
          amount: number;
          cadence: "monthly" | "one-time" | "deposit";
          source: "owner-provided" | "uploaded-bill" | "estimated" | "verified" | "demo";
          note?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          property_id?: string;
          label?: string;
          amount?: number;
          cadence?: "monthly" | "one-time" | "deposit";
          source?: "owner-provided" | "uploaded-bill" | "estimated" | "verified" | "demo";
          note?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  saved_properties (003_interactions.sql)                           */
      /* ------------------------------------------------------------------ */
      saved_properties: {
        Row: {
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          property_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  property_enquiries (003_interactions.sql)                         */
      /* ------------------------------------------------------------------ */
      property_enquiries: {
        Row: {
          id: string;
          property_id: string;
          from_user_id: string;
          message: string;
          status: "sent" | "seen";
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          from_user_id: string;
          message: string;
          status?: "sent" | "seen";
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          from_user_id?: string;
          message?: string;
          status?: "sent" | "seen";
          created_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  tenant_requirements (003_interactions.sql)                        */
      /* ------------------------------------------------------------------ */
      tenant_requirements: {
        Row: {
          user_id: string;
          budget: number | null;
          cities: string[] | null;
          property_type: string | null;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          budget?: number | null;
          cities?: string[] | null;
          property_type?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          budget?: number | null;
          cities?: string[] | null;
          property_type?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  rental_workspaces (004_workspaces.sql)                            */
      /* ------------------------------------------------------------------ */
      rental_workspaces: {
        Row: {
          id: string;
          property_id: string;
          start_date: string;
          rent: number;
          deposit: number;
          agreement_summary: string | null;
          status: "active" | "ended";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          start_date: string;
          rent: number;
          deposit: number;
          agreement_summary?: string | null;
          status?: "active" | "ended";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          start_date?: string;
          rent?: number;
          deposit?: number;
          agreement_summary?: string | null;
          status?: "active" | "ended";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  rental_members (004_workspaces.sql)                               */
      /* ------------------------------------------------------------------ */
      rental_members: {
        Row: {
          workspace_id: string;
          user_id: string;
          role: "tenant" | "owner";
          joined_at: string;
        };
        Insert: {
          workspace_id: string;
          user_id: string;
          role: "tenant" | "owner";
          joined_at?: string;
        };
        Update: {
          workspace_id?: string;
          user_id?: string;
          role?: "tenant" | "owner";
          joined_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  rental_documents (004_workspaces.sql)                             */
      /* ------------------------------------------------------------------ */
      rental_documents: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          category: "agreement" | "identity" | "payment-proof" | "maintenance" | "other";
          status: "draft" | "shared" | "expired";
          uploaded_by: string;
          uploaded_at: string;
          visible_to: string[];
          file_name: string;
          storage_path: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          category: "agreement" | "identity" | "payment-proof" | "maintenance" | "other";
          status?: "draft" | "shared" | "expired";
          uploaded_by: string;
          uploaded_at?: string;
          visible_to?: string[];
          file_name: string;
          storage_path?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          category?: "agreement" | "identity" | "payment-proof" | "maintenance" | "other";
          status?: "draft" | "shared" | "expired";
          uploaded_by?: string;
          uploaded_at?: string;
          visible_to?: string[];
          file_name?: string;
          storage_path?: string | null;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  rent_payments (004_workspaces.sql)                                */
      /* ------------------------------------------------------------------ */
      rent_payments: {
        Row: {
          id: string;
          workspace_id: string;
          kind: "rent" | "maintenance" | "utility";
          label: string;
          amount: number;
          due_on: string;
          status: "paid" | "unpaid" | "proof-uploaded";
          source: "owner-provided" | "uploaded-bill" | "estimated" | "verified" | "demo";
          proof_name: string | null;
          proof_storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          kind: "rent" | "maintenance" | "utility";
          label: string;
          amount: number;
          due_on: string;
          status?: "paid" | "unpaid" | "proof-uploaded";
          source?: "owner-provided" | "uploaded-bill" | "estimated" | "verified" | "demo";
          proof_name?: string | null;
          proof_storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          kind?: "rent" | "maintenance" | "utility";
          label?: string;
          amount?: number;
          due_on?: string;
          status?: "paid" | "unpaid" | "proof-uploaded";
          source?: "owner-provided" | "uploaded-bill" | "estimated" | "verified" | "demo";
          proof_name?: string | null;
          proof_storage_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  maintenance_requests (004_workspaces.sql)                         */
      /* ------------------------------------------------------------------ */
      maintenance_requests: {
        Row: {
          id: string;
          workspace_id: string;
          reported_by: string;
          title: string;
          area: string;
          status: "open" | "in-progress" | "resolved";
          opened_at: string;
          note: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          reported_by: string;
          title: string;
          area: string;
          status?: "open" | "in-progress" | "resolved";
          opened_at?: string;
          note?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          reported_by?: string;
          title?: string;
          area?: string;
          status?: "open" | "in-progress" | "resolved";
          opened_at?: string;
          note?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  activity_events (004_workspaces.sql)                              */
      /* ------------------------------------------------------------------ */
      activity_events: {
        Row: {
          id: string;
          workspace_id: string;
          at: string;
          title: string;
          detail: string | null;
          actor_id: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          at?: string;
          title: string;
          detail?: string | null;
          actor_id?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          at?: string;
          title?: string;
          detail?: string | null;
          actor_id?: string | null;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  condition_passports (005_passport.sql)                            */
      /* ------------------------------------------------------------------ */
      condition_passports: {
        Row: {
          id: string;
          workspace_id: string;
          tenant_acknowledged_at: string | null;
          owner_acknowledged_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          tenant_acknowledged_at?: string | null;
          owner_acknowledged_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          tenant_acknowledged_at?: string | null;
          owner_acknowledged_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  passport_rooms (005_passport.sql)                                 */
      /* ------------------------------------------------------------------ */
      passport_rooms: {
        Row: {
          id: string;
          passport_id: string;
          name: string;
          notes: string | null;
          review_required: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          passport_id: string;
          name: string;
          notes?: string | null;
          review_required?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          passport_id?: string;
          name?: string;
          notes?: string | null;
          review_required?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  passport_photos (005_passport.sql)                                */
      /* ------------------------------------------------------------------ */
      passport_photos: {
        Row: {
          id: string;
          room_id: string;
          label: string;
          storage_path: string;
          taken_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          label: string;
          storage_path: string;
          taken_at: string;
          uploaded_by?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string;
          label?: string;
          storage_path?: string;
          taken_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  roommate_profiles (006_roommates.sql)                             */
      /* ------------------------------------------------------------------ */
      roommate_profiles: {
        Row: {
          user_id: string;
          display_name: string;
          age_range: string | null;
          city: string | null;
          budget: number | null;
          locations: string[] | null;
          occupation: "student" | "professional" | null;
          food: "veg" | "non-veg" | "flexible" | null;
          sleep_schedule: "early" | "late" | "flexible" | null;
          cleanliness: "high" | "moderate" | null;
          smoking: "no" | "outside-only" | null;
          pets: "no" | "ok" | null;
          sharing: "1bhk" | "2bhk" | "either" | null;
          visibility: "limited" | "hidden";
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          age_range?: string | null;
          city?: string | null;
          budget?: number | null;
          locations?: string[] | null;
          occupation?: "student" | "professional" | null;
          food?: "veg" | "non-veg" | "flexible" | null;
          sleep_schedule?: "early" | "late" | "flexible" | null;
          cleanliness?: "high" | "moderate" | null;
          smoking?: "no" | "outside-only" | null;
          pets?: "no" | "ok" | null;
          sharing?: "1bhk" | "2bhk" | "either" | null;
          visibility?: "limited" | "hidden";
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          age_range?: string | null;
          city?: string | null;
          budget?: number | null;
          locations?: string[] | null;
          occupation?: "student" | "professional" | null;
          food?: "veg" | "non-veg" | "flexible" | null;
          sleep_schedule?: "early" | "late" | "flexible" | null;
          cleanliness?: "high" | "moderate" | null;
          smoking?: "no" | "outside-only" | null;
          pets?: "no" | "ok" | null;
          sharing?: "1bhk" | "2bhk" | "either" | null;
          visibility?: "limited" | "hidden";
          updated_at?: string;
        };
        Relationships: [];
      };

      /* ------------------------------------------------------------------ */
      /*  roommate_connections (006_roommates.sql)                          */
      /* ------------------------------------------------------------------ */
      roommate_connections: {
        Row: {
          user_id: string;
          target_id: string;
          status: "connected" | "blocked";
          created_at: string;
        };
        Insert: {
          user_id: string;
          target_id: string;
          status: "connected" | "blocked";
          created_at?: string;
        };
        Update: {
          user_id?: string;
          target_id?: string;
          status?: "connected" | "blocked";
          created_at?: string;
        };
        Relationships: [];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      is_workspace_member: {
        Args: { ws_id: string };
        Returns: boolean;
      };
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/** Convenience aliases for table rows */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyExpense = Database["public"]["Tables"]["property_expenses"]["Row"];
export type SavedProperty = Database["public"]["Tables"]["saved_properties"]["Row"];
export type PropertyEnquiry = Database["public"]["Tables"]["property_enquiries"]["Row"];
export type TenantRequirement = Database["public"]["Tables"]["tenant_requirements"]["Row"];
export type RentalWorkspaceRow = Database["public"]["Tables"]["rental_workspaces"]["Row"];
export type RentalMember = Database["public"]["Tables"]["rental_members"]["Row"];
export type RentalDocument = Database["public"]["Tables"]["rental_documents"]["Row"];
export type RentPayment = Database["public"]["Tables"]["rent_payments"]["Row"];
export type MaintenanceRequestRow = Database["public"]["Tables"]["maintenance_requests"]["Row"];
export type ActivityEventRow = Database["public"]["Tables"]["activity_events"]["Row"];
export type ConditionPassportRow = Database["public"]["Tables"]["condition_passports"]["Row"];
export type PassportRoomRow = Database["public"]["Tables"]["passport_rooms"]["Row"];
export type PassportPhoto = Database["public"]["Tables"]["passport_photos"]["Row"];
export type RoommateProfileRow = Database["public"]["Tables"]["roommate_profiles"]["Row"];
export type RoommateConnection = Database["public"]["Tables"]["roommate_connections"]["Row"];
