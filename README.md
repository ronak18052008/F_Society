# NESTORA

> **Rent with clarity. Live with confidence.**

NESTORA is a modern rental lifecycle platform designed to connect
tenants and property owners while making the rental journey more
transparent, organized, and secure.

The platform aims to bring property discovery, tenant-owner
communication, rental documentation, expense visibility, maintenance
tracking, property condition records, roommate discovery, and
AI-assisted rental tools into one unified experience.

## Run the frontend prototype

```bash
cd frontend
npm install
npm run dev
```

The Next.js app lives in `frontend/`. Listings and workspace records are
demo data. Local actions (save, enquiry, drafts, session) stay in the
browser. See `docs/ARCHITECTURE.md`.

------------------------------------------------------------------------

## 🚀 Vision

Traditional rental platforms usually focus on helping users discover
properties. NESTORA is designed to support the **complete rental
lifecycle**:

``` text
Discover a Property
        ↓
Compare Real Costs
        ↓
Connect With the Owner
        ↓
Review Rental Agreement
        ↓
Document Move-In Condition
        ↓
Track Rent, Bills & Maintenance
        ↓
Manage the Rental Relationship
        ↓
Complete Move-Out Transparently
```

Our goal is to improve clarity and accountability for both tenants and
property owners.

------------------------------------------------------------------------

## 🎯 Problem Statement

Renting a property can involve several disconnected activities:

-   Searching for suitable properties
-   Understanding the actual monthly cost
-   Communicating with property owners
-   Reviewing rental agreements
-   Tracking rent and maintenance payments
-   Recording existing property damage
-   Managing maintenance requests
-   Handling disputes about property condition
-   Finding compatible roommates

NESTORA brings these workflows together in a single platform.

------------------------------------------------------------------------

## ✨ Planned Features

### 1. User Authentication

Two primary user roles:

-   **Tenant / Customer**
-   **Property Owner**

Planned capabilities:

-   Registration and login
-   Role-based onboarding
-   Profile management
-   Secure authentication
-   Role-based access control

------------------------------------------------------------------------

### 2. Property Discovery

Tenants can:

-   Search properties by location
-   Filter properties by budget
-   View rent and deposit
-   Check furnishing status
-   Review property amenities
-   View estimated recurring expenses
-   Save properties
-   Contact property owners
-   Compare available properties

Owners can:

-   Create property listings
-   Add property details and photographs
-   Set rent and deposit information
-   Mention property preferences
-   Review tenant requirements
-   Respond to suitable tenants

------------------------------------------------------------------------

### 3. Owner--Tenant Connection

The platform will support communication between tenants and owners.

Planned functionality:

-   Tenant enquiry flow
-   Owner responses
-   Requirement-based discovery
-   Connection requests
-   Conversation history
-   Deal-status tracking

------------------------------------------------------------------------

### 4. Shared Rental Dashboard

Once a rental arrangement is confirmed, the tenant and owner can access
a shared rental workspace.

Planned sections:

-   Rental overview
-   Agreement details
-   Rent payment records
-   Maintenance bills
-   Utility bills
-   Maintenance requests
-   Important notifications
-   Shared documents
-   Rental activity timeline

Access to private information will be controlled through role-based
permissions.

------------------------------------------------------------------------

### 5. Rental Document Management

Users will be able to organize important rental documents, including:

-   Rental agreements
-   Identity verification status
-   Deposit details
-   Payment proofs
-   Maintenance records
-   Other relevant documents

Documents must be stored securely and made available only to authorized
users.

------------------------------------------------------------------------

### 6. Property Condition Passport

The Property Condition Passport records the condition of a property at
important stages of the rental lifecycle.

Planned workflow:

1.  Upload move-in photographs.
2.  Organize images by room or area.
3.  Record existing damage or observations.
4.  Allow both parties to acknowledge the record.
5.  Preserve timestamps and activity history.
6.  Upload later inspection or condition updates.
7.  Flag possible visual changes for human review.

Potential areas:

-   Living room
-   Bedroom
-   Kitchen
-   Bathroom
-   Doors and windows
-   Flooring and walls
-   Appliances
-   Furniture

> AI-generated damage flags will be treated as potential observations,
> not final proof of responsibility. The platform will not automatically
> decide who caused damage.

------------------------------------------------------------------------

### 7. RentTruth

RentTruth is designed to help tenants understand the real cost of
renting a property.

Possible cost categories:

-   Monthly rent
-   Maintenance
-   Electricity
-   Water
-   Gas
-   Parking
-   Brokerage
-   Deposit
-   One-time fees
-   Other recurring charges
-   Estimated transportation cost

Information may be classified as:

-   Owner-provided
-   Uploaded bill
-   Platform-calculated
-   Estimated
-   Verified, where verification is actually completed

The platform should clearly distinguish verified information from
estimates.

------------------------------------------------------------------------

### 8. Roommate Matching

Tenants may be able to discover compatible roommates using selected
preferences, such as:

-   Budget
-   Preferred location
-   Food preferences
-   Student or professional status
-   Lifestyle preferences
-   Work or study schedule
-   Cleanliness expectations
-   Sharing preferences
-   Smoking preferences
-   Pets
-   Sleep schedule

The matching system will provide compatibility indicators based on
available information. It will not guarantee personal compatibility or
safety.

Planned safety features:

-   Privacy controls
-   Mutual consent
-   Report and block options
-   Limited profile visibility
-   Clear communication boundaries

------------------------------------------------------------------------

### 9. AI Property Recommendations

Users may describe their requirements in natural language, for example:

> "I need a furnished room near my college within my monthly budget."

The system can extract requirements such as:

-   Budget
-   Location
-   Travel preferences
-   Furnishing
-   Property type
-   Roommate preferences
-   Lifestyle requirements

The initial recommendation system may use rule-based matching. More
advanced machine learning can be considered after collecting reliable
usage data.

------------------------------------------------------------------------

### 10. AI Rental Agreement Analyzer

Users may upload a rental agreement for informational analysis.

The system may extract and explain:

-   Monthly rent
-   Security deposit
-   Lock-in period
-   Notice period
-   Rent escalation clause
-   Maintenance responsibility
-   Repair responsibility
-   Late payment conditions
-   Subletting restrictions
-   Termination conditions
-   Renewal conditions

Example output:

``` text
Clause detected:
The agreement contains a 60-day notice period.

Potential consideration:
Your preferred notice period is 30 days.

Suggested action:
Review the clause and discuss it with the relevant party.
```

> This feature is intended for informational assistance and does not
> replace professional legal advice. The system must avoid presenting
> uncertain legal interpretations as definitive conclusions.

------------------------------------------------------------------------

## 🎨 Design Direction

NESTORA aims to use a premium, architectural, and technology-focused
interface.

Design principles:

-   Clear visual hierarchy
-   Generous whitespace
-   Responsive layouts
-   Accessible contrast
-   Smooth but purposeful animations
-   Cinematic property imagery
-   Interactive 3D elements where useful
-   Fast loading and mobile support
-   Minimal clutter
-   Clear and trustworthy content

The interface may include:

-   3D architectural visuals
-   Scroll-based animations
-   Interactive property cards
-   Cinematic video sections
-   Animated dashboards
-   Micro-interactions

Animations should improve the user experience rather than distract from
important information.

------------------------------------------------------------------------

## 🧱 Proposed Technology Stack

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Custom UI components

### Animation and 3D

-   Three.js
-   React Three Fiber
-   GSAP
-   Framer Motion
-   Spline, where appropriate

### Backend

-   Supabase
-   PostgreSQL
-   Supabase Authentication
-   Supabase Storage
-   Server-side functions or API routes

### AI

-   Large language model API
-   PDF text extraction
-   Structured clause extraction
-   Recommendation and requirement parsing
-   Optional computer vision for condition-change flags

### Development and Deployment

-   Git
-   GitHub
-   Cursor / Claude Code
-   Vercel
-   Environment variables for secrets

------------------------------------------------------------------------

## 🗂️ Suggested Project Structure

``` text
NESTORA/
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   └── SECURITY.md
├── public/
│   ├── images/
│   ├── videos/
│   └── models/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   └── styles/
├── supabase/
│   ├── migrations/
│   └── seed/
├── .env.example
├── README.md
├── package.json
└── tsconfig.json
```

The exact structure may change as the project evolves.

------------------------------------------------------------------------

## 🔐 Security and Privacy Principles

Because NESTORA may handle rental agreements, identity-related
information, payment records, and private communication, security is a
core requirement.

The project should include:

-   Secure authentication
-   Role-based access control
-   Database-level authorization
-   Row Level Security where applicable
-   Secure document storage
-   Private file access
-   Input validation
-   File type and file size validation
-   Protected API routes
-   No API keys committed to GitHub
-   Audit logs for important actions
-   Clear data retention and deletion policies

Sensitive documents must not be publicly accessible by default.

------------------------------------------------------------------------

## 🛠️ Development Roadmap

### Phase 1 --- Product and Design Foundation

-   Finalize brand identity
-   Define user roles
-   Prepare user flows
-   Create design system
-   Design landing page
-   Design core application screens

### Phase 2 --- Application Foundation

-   Set up Next.js project
-   Configure TypeScript and styling
-   Configure Supabase
-   Create authentication
-   Create user profiles
-   Implement role-based navigation

### Phase 3 --- Property Discovery

-   Create property database schema
-   Build property listing flow
-   Build search and filtering
-   Add property detail pages
-   Implement tenant enquiries
-   Implement owner responses

### Phase 4 --- Rental Workspace

-   Create rental connection workflow
-   Build shared dashboard
-   Add document management
-   Add rent and bill tracking
-   Add maintenance requests
-   Add notifications and activity history

### Phase 5 --- Transparency Features

-   Build Property Condition Passport
-   Add photo uploads
-   Add two-party acknowledgements
-   Build RentTruth calculations
-   Add source and verification labels

### Phase 6 --- AI Features

-   Add natural language requirement parsing
-   Add property recommendations
-   Add rental agreement extraction
-   Add clause explanation
-   Add optional condition-change flagging

### Phase 7 --- Roommate Matching

-   Create roommate profiles
-   Add privacy controls
-   Implement preference matching
-   Add reporting and blocking
-   Test matching and safety workflows

### Phase 8 --- Testing and Launch

-   Test authentication
-   Test authorization
-   Test file uploads
-   Test mobile responsiveness
-   Test performance
-   Test AI outputs
-   Review privacy and security
-   Prepare documentation
-   Deploy the application

------------------------------------------------------------------------

## 🧪 Quality Standards

Every feature should be developed with:

-   A clear user flow
-   Responsive design
-   Loading states
-   Empty states
-   Error handling
-   Input validation
-   Permission checks
-   Database testing
-   Accessibility considerations
-   Documentation

AI-generated code must be reviewed, tested, and understood before being
merged.

------------------------------------------------------------------------

## 🤝 Contribution Guidelines

When collaborating:

1.  Create a separate branch for your feature.
2.  Make focused and meaningful commits.
3.  Describe what changed.
4.  Test the feature before opening a pull request.
5.  Do not commit secrets or API keys.
6.  Keep the README and documentation updated.
7.  Avoid modifying unrelated files.
8.  Review security and permissions for backend changes.

Suggested branch names:

``` text
feature/authentication
feature/property-listings
feature/rental-dashboard
feature/condition-passport
feature/renttruth
feature/roommate-matching
feature/agreement-analyzer
```

------------------------------------------------------------------------

## ⚠️ Current Project Status

**Status:** Frontend prototype in `frontend/` (Next.js). Backend and
Supabase are not connected yet.

The feature list and architecture are evolving. Some features are
implemented as labelled prototypes before production backend services.

The project should clearly label:

-   Demo data
-   Estimated costs
-   AI-generated suggestions
-   Unverified listings
-   Prototype-only interactions

------------------------------------------------------------------------

## 📌 Product Philosophy

NESTORA is built around four principles:

1.  **Transparency** --- Make rental costs, documents, and property
    condition easier to understand.
2.  **Accountability** --- Maintain shared records of important rental
    activities.
3.  **Privacy** --- Give users control over sensitive information.
4.  **Usability** --- Combine premium design with practical workflows.

------------------------------------------------------------------------

## 📄 License

The license for this project has not yet been finalized.

------------------------------------------------------------------------

## 👤 Project

**Project Name:** NESTORA\
**Category:** Rental Technology / PropTech\
**Core Focus:** Rental transparency and lifecycle management
