# StockFlow

A premium, mobile-first warehouse inventory and sales management web app built for a real wholesale business in Addis Ababa. StockFlow replaces handwritten warehouse logbooks with a fast transaction-based system for managers and warehouse staff.

**Status:** MVP Frontend Complete · Backend & Deployment In Progress

---

## Overview

StockFlow is designed around one simple principle:

> **Inventory is never edited manually — every stock change comes from a transaction.**

Instead of changing quantities directly, users record purchases and sales. The system automatically updates inventory, customer balances, and activity history.

The application supports two roles:

| Role                | Access                                                     |
| ------------------- | ---------------------------------------------------------- |
| **Manager**         | Inventory, customers, reports, purchases, sales, analytics |
| **Warehouse Staff** | Stock in/out, inventory lookup, customer dispatch logging  |

Customers do **not** have accounts. They exist only as records attached to outgoing sales.

---

## MVP Features

### Manager

* Dashboard with inventory metrics
* Inventory management
* Add new products
* Record stock purchases
* Record customer sales
* Customer ledger
* Credit vs paid tracking
* Reports & activity overview

### Warehouse Staff

* View inventory
* Search products
* Record Stock In
* Record Stock Out
* Select customer receiving goods
* Fast transaction workflow

---

## Tech Stack

| Layer                  | Technology                      |
| ---------------------- | ------------------------------- |
| Frontend               | Next.js 16 + React + TypeScript |
| Styling                | Tailwind CSS                    |
| Icons                  | Lucide React                    |
| State                  | React Context API               |
| Backend *(planned)*    | Supabase                        |
| Database *(planned)*   | PostgreSQL                      |
| Auth *(planned)*       | Supabase Auth                   |
| Deployment *(planned)* | Vercel                          |

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
│   ├── reports/
│   ├── transactions/
│   └── warehouse/
├── context/
├── data/
├── lib/
└── types/
```

---

## Core Workflow

```text
Purchase
    │
    ▼
Inventory Increases

Sale
    │
    ▼
Inventory Decreases
    │
    ▼
Customer Ledger Updates
    │
    ├── Paid
    └── Credit
```

Every transaction becomes part of the permanent activity log.

---

## Design Goals

* Mobile-first iPhone experience
* Responsive desktop layout
* Large touch targets
* Minimal Apple-inspired interface
* Rounded cards & soft shadows
* English + Amharic support
* ETB currency throughout

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

---

## Current Progress

### Completed

* Responsive mobile & desktop UI
* Role-based interface
* Dashboard
* Inventory pages
* Customer ledger
* Purchase & sale modals
* English / Amharic localization
* Transaction-based inventory engine

### In Progress

* Production authentication
* Supabase database
* Row Level Security (RLS)
* Real customer accounts
* Deployment to Vercel

---

## Roadmap

### Phase 1 (MVP)

* [x] Login UI
* [x] Manager dashboard
* [x] Warehouse dashboard
* [x] Inventory
* [x] Customer ledger
* [x] Record purchase
* [x] Record sale
* [x] Credit tracking

### Phase 2

* [ ] Barcode scanning
* [ ] Interactive analytics
* [ ] Low stock alerts
* [ ] Carton ↔ Piece conversion
* [ ] Export reports
* [ ] Multiple warehouse staff

---

## License

Private client project — not intended for public commercial use.
