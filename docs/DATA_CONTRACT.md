# NESTORA — Data Contract Mapping

This document provides a field-by-field mapping between frontend TypeScript types and PostgreSQL database tables.

---

## 1. Property Listing

| Frontend Field (`Property`) | Database Column (`properties`) | Type / Constraint | Notes |
|---|---|---|---|
| `id` | `id` | `uuid PRIMARY KEY` | Auto-generated UUID |
| `slug` | `slug` | `text UNIQUE NOT NULL` | URL slug |
| `title` | `title` | `text NOT NULL` | Property title |
| `locality` | `locality` | `text NOT NULL` | Locality / neighborhood |
| `city` | `city` | `text NOT NULL` | City name |
| `type` | `property_type` | `text NOT NULL` | Check enum: apartment, studio, villa, independent-floor |
| `furnishing` | `furnishing` | `text NOT NULL` | Check enum: furnished, semi-furnished, unfurnished |
| `suitability` | `suitability` | `text[] NOT NULL` | Audience tags array |
| `bedrooms` | `bedrooms` | `smallint NOT NULL` | Count (>= 0) |
| `bathrooms` | `bathrooms` | `smallint NOT NULL` | Count (>= 0) |
| `areaSqft` | `area_sqft` | `integer NOT NULL` | Area in sq.ft (> 0) |
| `rent` | `rent` | `integer NOT NULL` | Monthly rent (INR) |
| `deposit` | `deposit` | `integer NOT NULL` | Security deposit (INR) |
| `availableFrom` | `available_from` | `date NOT NULL` | Available date |
| `amenities` | `amenities` | `text[] DEFAULT '{}'` | Amenities list |
| `images` | `images` | `text[] DEFAULT '{}'` | Image URLs / storage paths |
| `ownerId` | `owner_id` | `uuid REFERENCES profiles(id)` | Property owner |
| `verification` | `verification` | `text NOT NULL` | Identity / listing status |
| `description` | `description` | `text DEFAULT ''` | Detailed description |
| `coordinates.lat` | `lat` | `double precision` | Latitude |
| `coordinates.lng` | `lng` | `double precision` | Longitude |
| `demo` | `is_demo` | `boolean DEFAULT false` | Demo flag |
| *(new)* | `is_published` | `boolean DEFAULT false` | Controls public visibility |

---

## 2. RentTruth Expense Breakdown

| Frontend Field (`ExpenseLine`) | Database Column (`property_expenses`) | Type / Constraint |
|---|---|---|
| `id` | `id` | `uuid PRIMARY KEY` |
| *(derived)* | `property_id` | `uuid REFERENCES properties(id) ON DELETE CASCADE` |
| `label` | `label` | `text NOT NULL` |
| `amount` | `amount` | `integer NOT NULL` |
| `cadence` | `cadence` | `text CHECK (monthly, one-time, deposit)` |
| `source` | `source` | `text CHECK (owner-provided, uploaded-bill, estimated, verified, demo)` |
| `note` | `note` | `text` |

---

## 3. User Profiles & Auth

| Frontend Field (`SessionUser` / `OwnerProfile`) | Database Column (`profiles`) | Type / Constraint |
|---|---|---|
| `id` | `id` | `uuid PRIMARY KEY REFERENCES auth.users(id)` |
| `name` | `name` | `text NOT NULL` |
| `email` | `email` | `text UNIQUE NOT NULL` |
| `role` | `role` | `text CHECK (tenant, owner)` |
| `city` | `city` | `text` |
| `phone` | `phone` | `text` |
| `listedSince` | `listed_since` | `timestamptz DEFAULT now()` |
| `responseNote` | `response_note` | `text` |

---

## 4. Rental Workspaces & Living Room

| Frontend Field (`RentalWorkspace`) | Database Column (`rental_workspaces`) | Type / Constraint |
|---|---|---|
| `id` | `id` | `uuid PRIMARY KEY` |
| `propertyId` | `property_id` | `uuid REFERENCES properties(id)` |
| `startDate` | `start_date` | `date NOT NULL` |
| `rent` | `rent` | `integer NOT NULL` |
| `deposit` | `deposit` | `integer NOT NULL` |
| `agreementSummary` | `agreement_summary` | `text` |
| `tenantName` / `ownerName` | *(joined)* | Resolved via `rental_members` -> `profiles.name` |
