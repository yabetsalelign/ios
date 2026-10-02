# StockFlow

A premium, mobile-first warehouse inventory and sales management web app built for a real wholesale business in Addis Ababa. StockFlow replaces handwritten warehouse logbooks with a fast, transaction-based system for managers and warehouse staff.

> **Core principle:** Inventory is never edited manually — every stock change comes from a transaction.

**Status:** MVP Frontend Complete · Supabase Backend Integrated · Security Hardening In Progress · Vercel Deployment

---

## Overview

StockFlow is designed as a simple digital logbook for a small wholesale operation.

Instead of manually changing stock quantities, users record purchases and sales. The system derives stock from inventory transactions and records customer financial activity through the customer ledger.

Customers do **not** log in to StockFlow. They exist as customer records attached to outgoing sales so the business can track who received inventory and whether the sale was paid or placed on credit.

---

## Roles

| Role | Access |
|---|---|
| **Manager** | Inventory, products, customers, reports, sales, purchases, customer payments, financial/credit information |
| **Warehouse Staff** | Inventory lookup, stock in, stock out/sales, customer selection, customer payments, operational activity |

Authorization is enforced at the database level with Supabase RLS and protected RPCs. Frontend role checks are for UX only and are not the security boundary.

---

## MVP Features

### Manager

- Dashboard with inventory and credit metrics
- Inventory management
- Add/edit products
- Record stock purchases
- Record customer sales
- Customer directory
- Customer ledger and balances
- Customer payments
- Reports and financial summaries
- English / Amharic interface

### Warehouse Staff

- View inventory
- Search products
- Record Stock In
- Record Stock Out / Sales
- Select the customer receiving goods
- Record customer payments
- Fast transaction workflow
- No access to manager-only financial reporting or product management

---

## Authentication

StockFlow uses **Supabase Auth** as the source of truth for identity.

### Current authentication flow

```text
Existing user
    │
    ▼
Email + Password
    │
    ▼
Supabase Auth
    │
    ▼
Profile loaded from public.profiles
    │
    ▼
Manager / Warehouse interface
```

### Account setup / recovery

Users can also start an account setup flow from the login page:

```text
Set Up Account
    │
    ▼
Enter email
    │
    ▼
Supabase secure recovery email
    │
    ▼
Create password
    │
    ▼
Existing profile loaded
    │
    ▼
Role read from public.profiles
```

The setup flow does not allow users to choose or promote their own role.

Passwords are handled by Supabase Auth and are not stored in StockFlow application tables or local storage.

---

## Backend

StockFlow is integrated with **Supabase** for:

- PostgreSQL database
- Supabase Auth
- Row Level Security (RLS)
- Protected database RPCs
- Supabase Storage
- Transaction-backed inventory and customer ledger data

### Core tables / views

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

### Protected transaction RPCs

```text
record_sale
record_purchase
record_customer_payment
```

These operations perform server-side authentication, role checks, validation, and atomic database writes.

---

## Security

StockFlow has been hardened against direct client-side manipulation.

Current security work includes:

- RLS enabled across application tables
- Direct transaction-table inserts blocked from the client
- Role checks performed from `profiles.role`
- New user profiles default to `warehouse`
- Client-provided role metadata is not trusted for privilege assignment
- Product/customer writes restricted to managers
- Customer financial data restricted to managers
- Protected transaction RPCs use server-side `auth.uid()`
- Security-definer functions use controlled search paths
- Stock and ledger integrity constraints
- `security_invoker = true` on sensitive database views
- Anonymous access to stock and customer-balance views blocked
- Profiles RLS recursion fix migration created and validated locally

### Security migration history

```text
20260927000000_phase4b_foundation.sql
20260927000001_product_foundation.sql
20260930000001_warehouse_payment_access.sql
20261001000000_backend_security_hardening.sql
20261001000001_fix_profiles_rls_recursion.sql
```

The final profiles-recursion migration must be applied to the linked Supabase project before relying on the production database for normal session restoration.

---

## Core Workflow

```text
Purchase
    │
    ▼
Inventory Increases

Sale
    │
    ├── Inventory Decreases
    │
    └── Customer Ledger Updates
           │
           ├── Paid
           └── Credit

Customer Payment
    │
    ▼
Customer Ledger Decreases
    │
    └── Physical Inventory Unchanged
```

Every transaction becomes part of the permanent activity history.

Stock is derived transactionally rather than manually edited.

---

## Design Goals

- Mobile-first iPhone experience
- Responsive desktop layout
- Large touch targets
- Minimal Apple-inspired interface
- Rounded cards and soft shadows
- English + Amharic support
- ETB currency throughout
- Simple warehouse logbook experience rather than a complex accounting/ERP interface

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Client State | React Context API |
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

supabase/
└── migrations/
```

---

## Getting Started

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Type check

```bash
npx tsc --noEmit
```

### Production build

```bash
npm run build
```

### Supabase

Check migration status:

```bash
npx supabase migration list
```

Preview pending migrations:

```bash
npx supabase db push --dry-run
```

Apply pending migrations:

```bash
npx supabase db push
```

---

## Current Progress

### Completed

- Responsive mobile and desktop UI
- Manager and Warehouse role-based interfaces
- Supabase Auth integration
- Persistent Supabase data
- Transaction-based inventory engine
- Product catalog
- Customer directory
- Customer ledger
- Customer payments
- Purchase / Stock In workflow
- Sale / Stock Out workflow
- English / Amharic localization
- Secure transaction RPCs
- RLS policies across core application tables
- Security-invoker stock and customer-balance views
- Login session restoration architecture
- Existing-account password setup / recovery flow
- Production TypeScript check
- Production Next.js build

### In Progress

- Final deployment of the profiles RLS recursion fix
- Final end-to-end verification of the new account setup / recovery flow
- Final production verification on the deployed Vercel frontend

---

## Roadmap

### Phase 1 — MVP

- [x] Login UI
- [x] Supabase authentication
- [x] Manager dashboard
- [x] Warehouse dashboard
- [x] Inventory
- [x] Customer directory
- [x] Customer ledger
- [x] Record purchase
- [x] Record sale
- [x] Customer payments
- [x] Credit tracking
- [x] RLS and backend security hardening

### Phase 2 — Optional Improvements

- [ ] Interactive analytics
- [ ] Low-stock alerts / notifications
- [ ] Carton ↔ piece conversion enhancements
- [ ] Export reports
- [ ] Additional warehouse users
- [ ] More profile customization

---

## Repository Notes

StockFlow is intentionally scoped for a small internal business with a manager and a small number of warehouse users.

The architecture favors:

- Strong database authorization
- Transaction-driven inventory
- Simple operational workflows
- Minimal complexity
- Responsive mobile-first UX

It does not attempt to be a full accounting, ERP, multi-warehouse, or customer-facing platform.

---

## License

Private client project — not intended for public commercial use.
