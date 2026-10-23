# StockFlow

A premium, mobile-first warehouse inventory and sales management web app built for a small wholesale operation in Addis Ababa, Ethiopia. StockFlow replaces handwritten warehouse logbooks with a transaction-based system for managers and warehouse staff.

> **Core principle:** Inventory is never edited manually. Stock changes are recorded as transactions, and on-hand stock is derived from the transaction history.

**Status:** MVP implemented · Supabase backend integrated · Core security hardening deployed · PWA and UX refinements in progress · Final data-aggregation migration pending review/deployment

**Production frontend:** https://ios-1lbv.vercel.app/

---

## Overview

StockFlow is designed as a simple digital logbook for a small wholesale operation. Users record stock purchases, sales, and customer payments instead of manually changing stock quantities. Sales connect the outgoing goods to a customer and record whether the sale was paid or placed on credit.

Customers are records inside StockFlow; they do **not** log in.

The application is intentionally scoped for a small internal team. It is not a full accounting system, ERP, multi-warehouse platform, or customer-facing portal.

---

## Roles

| Role | Access |
|---|---|
| **Manager** | Products, inventory, customers, sales, purchases, customer payments, reports, and financial/credit information; can invite warehouse staff |
| **Warehouse Staff** | Inventory lookup, stock in, stock out/sales, customer selection, customer payments, and operational activity; no manager reports or product-management controls |

Database authorization uses Supabase Auth, `profiles.role`, RLS, and protected transaction RPCs. Frontend role checks are for user experience and are **not** the security boundary.

---

## Features

### Manager

- Inventory dashboard and operational metrics
- Product creation and editing
- Record stock purchases / Stock In
- Record sales / Stock Out
- Customer directory and customer ledger
- Record customer payments and track credit
- Reports and CSV export
- Invite warehouse staff by email
- English and Amharic interface

### Warehouse Staff

- View and search inventory
- Record Stock In
- Record sales / Stock Out and select the receiving customer
- Record customer payments
- View operational activity
- Access only to role-appropriate screens and controls

### Mobile and PWA experience

- Responsive mobile and desktop layouts
- Home Screen / PWA manifest and icon assets are being refined for iPhone installation
- Safe-area spacing for mobile navigation, login, and notifications
- Pagination for product, customer, and customer-ledger lists

PWA icon and standalone behavior still require verification on a real iPhone. The app depends on an internet connection for Supabase-backed business data; offline operation is not implemented.

---

## Authentication and Staff Invitations

StockFlow uses **Supabase Auth** as the source of truth for identity. Roles are read from `public.profiles`; new profiles default to `warehouse`, and client-provided metadata is not trusted to grant manager privileges.

### Existing users

```text
Email + password
    -> Supabase Auth
    -> Profile loaded from public.profiles
    -> Manager or Warehouse interface
```

Existing users can sign in or use the password-recovery flow.

### New warehouse staff

```text
Manager sends invitation
    -> invite-staff Edge Function verifies the manager
    -> Supabase sends an invitation email
    -> Invitee opens the link and sets a password
    -> Profile is loaded with the default Warehouse role
```

The invitation function checks the caller's authenticated identity and manager role before using server-side credentials. Service-role keys must remain server-side and must never be placed in client code or committed to Git.

Password setup and recovery links, allowed redirect URLs, email delivery, and invitation behavior must be verified in the deployed environment when changing Auth configuration.

---

## Backend and Data Model

StockFlow uses Supabase for PostgreSQL, Auth, Row Level Security (RLS), Storage, and protected database functions.

### Core tables and views

```text
profiles
products
customers
sales
sale_items
purchases
inventory_transactions
ledger_transactions

v_product_stock
v_customer_balances
```

The application also includes a private `profile-avatars` storage bucket for profile images and a `product-images` bucket for product photos.

### Protected transaction functions

```text
record_sale
record_purchase
record_customer_payment
```

These database functions validate the caller, permissions, inputs, and business rules before recording transaction data. Sensitive transaction tables block direct client inserts; business operations are performed through the protected functions.

### Core workflow

```text
Purchase / Stock In
    -> Purchase record
    -> Positive inventory transaction
    -> Available stock increases

Sale / Stock Out
    -> Sale and sale-item records
    -> Negative inventory transaction
    -> Customer ledger debit
    -> Optional payment credit

Customer Payment
    -> Customer ledger payment entry
    -> Outstanding balance decreases
    -> Physical stock does not change
```

Inventory is derived from transaction records rather than manually edited quantities.

---

## Security

Security features implemented in the project include:

- RLS on core application tables
- Role checks based on the authenticated user and `profiles.role`
- New profiles default to the Warehouse role
- Client-provided role metadata is not trusted for privilege assignment
- Direct client inserts into protected transaction tables are denied
- Protected sale, purchase, and customer-payment RPCs
- Controlled `search_path` on security-definer functions
- Security-invoker views for stock and customer-balance summaries
- Private profile-avatar storage with owner-scoped paths and signed URLs
- Manager-authorized staff invitations through an Edge Function
- Product barcode feature removed from active product UI and schema by a migration
- Concurrency locks added to sale and customer-payment RPCs

### Important security caveat

The UI hides product cost from Warehouse users, but UI hiding alone does not guarantee that the value is inaccessible through database queries. Verify database-level access to sensitive product-cost fields before treating that information as confidential.

---

## Database Migrations

Migrations are versioned under `supabase/migrations/`. The migration history checked on October 23, 2026 showed the following migrations matched between local and the linked remote database:

```text
20260927000000_phase4b_foundation.sql
20260927000001_product_foundation.sql
20260930000001_warehouse_payment_access.sql
20261001000000_backend_security_hardening.sql
20261001000001_fix_profiles_rls_recursion.sql
20261002000000_profile_avatars.sql
20261002000001_remove_product_barcode.sql
20261002000002_security_advisor_cleanup.sql
20261023000000_fix_concurrent_sale_payment_locks.sql
```

The migration below was created locally for full-dataset inventory-volume totals but had **not** been applied to Supabase at the time of the latest report:

```text
20261023000001_dataset_wide_aggregates.sql  [PENDING REVIEW / NOT DEPLOYED]
```

This pending migration creates `v_inventory_volume_metrics`, which aggregates incoming and outgoing carton totals in PostgreSQL rather than summing only a limited recent-activity query. Review and dry-run the migration before applying it. Do not use `DROP VIEW ... CASCADE` casually, because that can remove dependent database objects.

Useful commands:

```bash
npx supabase migration list --linked
npx supabase db push --dry-run --linked
# Apply only after reviewing the complete pending-migration list:
npx supabase db push --linked
```

`db push` applies **all pending local migrations** to the linked project, not just a chosen file. Never use `supabase db reset` against production as a shortcut.

---

## Limits, Aggregation, and Pagination

StockFlow distinguishes between fetching records for display and calculating totals:

- Recent activity uses a bounded fetch to limit payload size.
- Product and customer lists use client-side pagination to reduce rendered DOM size.
- Customer-ledger entries are paginated in the UI.
- Report queries use an explicit date range and batched range retrieval.
- Full-dataset inventory volume totals are being moved to a PostgreSQL view in the pending migration listed above.
- Customer balance summaries use `v_customer_balances` rather than calculating financial totals from a potentially truncated raw-ledger response.

**Do not calculate full-dataset totals from a limited client-side sample.** Keep reasonable limits for lists, but use server-side aggregation for whole-dataset counts and sums.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Client state | React Context API |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Storage | Supabase Storage |
| Deployment | Vercel |

---

## Project Structure

```text
src/
├── app/
├── components/
│   ├── auth/
│   ├── customers/
│   ├── dashboard/
│   ├── inventory/
│   ├── layout/
│   ├── navigation/
│   ├── profile/
│   ├── reports/
│   ├── transactions/
│   └── warehouse/
├── context/
├── data/
├── domain/
├── i18n/
├── lib/
└── types/

public/
supabase/
├── functions/
│   └── invite-staff/
├── migrations/
└── seed.sql

tests/
```

---

## Getting Started

### Requirements

- Node.js and npm
- Access to the StockFlow Supabase project for backend development
- Supabase CLI for migration and Edge Function work

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create `.env.local` in the project root. Use the variable names required by the Supabase client in `src/lib/supabase/client.ts`:

```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use your own authorized project values. Do not commit `.env.local`, service-role keys, or other secrets.

### Run locally

```bash
npm run dev
```

Open <http://localhost:3000>.

### Verify the app

```bash
npx tsc --noEmit
npm test
npm run build
```

The current `tests/data_truncation_audit.test.mjs` suite contains five Node tests covering simulated aggregate behavior, pagination boundaries, and batched-fetch logic. These are unit/simulation tests; they do **not** execute the SQL against a live PostgreSQL database or prove real concurrent RPC behavior.

### Supabase migration workflow

```bash
npx supabase migration list --linked
npx supabase db push --dry-run --linked
```

Review every pending migration before applying anything. For production, use the correct linked project and never run a database reset as a deployment shortcut.

---

## Verification and Known Limitations

As of October 23, 2026:

- `npm run build` passed during the latest reported UX and data-truncation passes.
- `git diff --check` passed during those passes.
- `npm test` reported 5 passing simulated tests for the data-truncation/pagination work.
- Migration `20261023000000_fix_concurrent_sale_payment_locks.sql` was applied to the linked Supabase database and confirmed in local/remote migration history.
- Actual concurrent sale/payment RPC stress tests have **not** been reported as run.
- `20261023000001_dataset_wide_aggregates.sql` remained pending review/deployment.
- Latest UX, pagination, and PWA changes require checking `git status`, committing/pushing as appropriate, and verifying the Vercel deployment before assuming they are live.
- iPhone Home Screen icon, standalone launch, safe-area behavior, and invitation/recovery flows still require real-device verification.
- The earlier full lint audit reported existing ESLint errors and warnings; a clean production build does not imply `npm run lint` passes.
- Offline use is not implemented; Supabase-backed operations require connectivity.

Re-run the checks before release because the status above reflects the latest reports available when this README was updated, not an automatic live status check.

---

## Design Goals

- Mobile-first warehouse logbook experience
- Responsive desktop layout
- Clear, accessible touch targets
- Minimal, iOS-inspired interface
- Rounded cards and restrained colors
- English and Amharic localization
- ETB currency and carton-based inventory
- Simple operational workflows without unnecessary accounting/ERP complexity

---

## Roadmap

### Core MVP

- [x] Supabase authentication and profile roles
- [x] Manager and Warehouse interfaces
- [x] Product catalog and inventory views
- [x] Transaction-based Stock In and Stock Out
- [x] Customer directory and ledger
- [x] Customer payments and credit tracking
- [x] Protected transaction RPCs and RLS hardening
- [x] Manager-only staff invitations
- [x] English / Amharic interface
- [x] Database concurrency locking fix deployed
- [x] Pagination and batched report-fetching improvements implemented locally

### Follow-up

- [ ] Review and deploy the dataset-wide inventory-volume aggregation migration
- [ ] Test concurrent sales and payments against PostgreSQL/Supabase
- [ ] Verify database-level confidentiality of product cost fields
- [ ] Confirm latest UX/PWA changes are deployed to Vercel
- [ ] Verify install icon and standalone behavior on a real iPhone
- [ ] Add PostgreSQL-backed integration tests for critical RPCs
- [ ] Consider low-stock notifications and additional analytics if they are needed by users

---

## Scope

StockFlow is intentionally built for a small internal wholesale business with a manager and a small number of warehouse staff. The priorities are reliable inventory records, traceable transactions, understandable customer credit, secure role separation, and a responsive mobile-first experience—not enterprise-scale complexity.

## License

Private client project. Not intended for public commercial use without authorization.
