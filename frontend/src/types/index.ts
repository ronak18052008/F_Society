export type UserRole = "tenant" | "owner";

export type DataSource =
  | "owner-provided"
  | "uploaded-bill"
  | "estimated"
  | "verified"
  | "demo";

export type Furnishing = "furnished" | "semi-furnished" | "unfurnished";
export type PropertyType = "apartment" | "studio" | "villa" | "independent-floor";
export type Suitability = "working-professional" | "student" | "family" | "shared";

export type ExpenseLine = {
  id: string;
  label: string;
  amount: number;
  cadence: "monthly" | "one-time" | "deposit";
  source: DataSource;
  note?: string;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  locality: string;
  city: string;
  type: PropertyType;
  furnishing: Furnishing;
  suitability: Suitability[];
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  rent: number;
  deposit: number;
  availableFrom: string;
  amenities: string[];
  images: string[];
  ownerId: string;
  verification: "identity-checked" | "listing-unverified" | "documents-pending";
  description: string;
  expenses: ExpenseLine[];
  coordinates: { lat: number; lng: number };
  demo: true;
};

export type OwnerProfile = {
  id: string;
  name: string;
  city: string;
  listedSince: string;
  responseNote: string;
};

export type RoommateProfile = {
  id: string;
  displayName: string;
  ageRange: string;
  city: string;
  budget: number;
  locations: string[];
  occupation: "student" | "professional";
  food: "veg" | "non-veg" | "flexible";
  sleep: "early" | "late" | "flexible";
  cleanliness: "high" | "moderate";
  smoking: "no" | "outside-only";
  pets: "no" | "ok";
  sharing: "1bhk" | "2bhk" | "either";
  visibility: "limited";
  demo: true;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
  phone?: string;
};

export type Enquiry = {
  id: string;
  propertyId: string;
  fromName: string;
  message: string;
  createdAt: string;
  status: "sent" | "seen";
};

export type DocumentRecord = {
  id: string;
  title: string;
  category: "agreement" | "identity" | "payment-proof" | "maintenance" | "other";
  status: "draft" | "shared" | "expired";
  uploadedAt: string;
  visibleTo: Array<"tenant" | "owner">;
  fileName: string;
};

export type PaymentRecord = {
  id: string;
  kind: "rent" | "maintenance" | "utility";
  label: string;
  amount: number;
  dueOn: string;
  status: "paid" | "unpaid" | "proof-uploaded";
  source: DataSource;
  proofName?: string;
};

export type MaintenanceRequest = {
  id: string;
  title: string;
  area: string;
  status: "open" | "in-progress" | "resolved";
  openedAt: string;
  note: string;
};

export type ActivityEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
};

export type PassportRoom = {
  id: string;
  name: string;
  notes: string;
  photos: { id: string; label: string; src: string; takenAt: string }[];
  reviewRequired: boolean;
};

export type ConditionPassport = {
  rentalId: string;
  rooms: PassportRoom[];
  tenantAcknowledgedAt?: string;
  ownerAcknowledgedAt?: string;
};

export type RentalWorkspace = {
  id: string;
  propertyId: string;
  tenantName: string;
  ownerName: string;
  startDate: string;
  rent: number;
  deposit: number;
  agreementSummary: string;
};
