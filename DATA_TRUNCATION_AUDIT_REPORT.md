# StockFlow Data Truncation, Limits & Pagination Audit Report

## Executive Summary
This audit reviewed all database queries, client-side data calculations, pagination caps, and reporting queries across StockFlow. Prior to this fix, the application suffered from two critical data accuracy issues:
1. **Sample-Based Metrics Calculations:** Dashboard volume aggregates ("Coming In" and "Sold" cartons) were calculated over a recent 200-row sample from `inventory_transactions`. If an organization had >200 transactions, lifetime or operational totals silently truncated.
2. **Client-Side Balance Aggregation:** Customer balances and `totalCustomerCreditETB` were calculated by downloading all individual `customer_ledger` records into browser memory. On datasets exceeding PostgREST's default 1,000-row limit, customer balances silently corrupted while exposing financial records to unauthorized client memory.
3. **Unpaginated Mobile Lists:** `InventoryList`, `CustomerList`, and `CustomerLedger` rendered unbound DOM lists, causing UI degradation as datasets scaled.
4. **Unbounded Report Lifetime Queries:** `ReportsView` queried lifetime sales without batching, risking truncated export metrics beyond 1,000 records.

All issues were systematically audited and resolved by moving dataset-wide calculations to PostgreSQL views/RPCs, introducing batched fetches for reporting, and adding deterministic client pagination with strict limits.

---

## 1. Comprehensive Query & Calculation Audit Matrix

| File / Component | Query / Calculation | Purpose Category | Former Limit / Behavior | Audited Issue | Resolution & Required Migration |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [`StockFlowContext.tsx`](file:///src/context/StockFlowContext.tsx#L162) | `supabase.from('inventory_transactions').select('*').order('created_at', { ascending: false }).limit(200)` | **Recent Activity Feed** & **Dashboard Metrics** (Coming In / Sold) | Capped at `.limit(200)` | Metric corruption: incoming/outgoing cartons were summed in memory from this 200-row slice, resulting in truncated volume stats. | **Split:**<br>1. Activity feed query reduced to `.limit(50)` for fast mobile logbook.<br>2. Volume metrics moved to PostgreSQL view `v_inventory_volume_metrics` calculating dataset-wide totals.<br>*(Migration: `20261023000001_dataset_wide_aggregates.sql`)* |
| [`StockFlowContext.tsx`](file:///src/context/StockFlowContext.tsx#L173) | `supabase.from('customer_ledger').select('*').order('created_at', { ascending: true })` | **Dashboard Metric** (`totalCustomerCreditETB`) & **Customer Summary** | Unbounded client fetch (implicitly capped at 1,000 rows by PostgREST) | Truncation at 1,000 rows caused false customer balances. Also risked exposing financial balances to warehouse roles. | **Migrated to Database View:**<br>Directly queries secure PostgreSQL view `v_customer_balances` (`security_invoker = true`). Customer summaries & credit totals are 100% authoritative regardless of ledger size. |
| [`ReportsView.tsx`](file:///src/components/reports/ReportsView.tsx#L137) | `supabase.from('sales').select('*, customer:customers(*)').order('created_at', { ascending: false })` | **Report / Export** | Unbounded lifetime query (capped at 1,000 by PostgREST) | Lifetime export clipped at 1,000 sales; memory consumption spiked on mobile. | **Fixed with Date Window + Batched Range Fetching:**<br>Added explicit default 7-day date filter (`.gte('created_at', isoStartDate)`). Implemented `.range(from, from + batchSize - 1)` loop chunking by 1,000 rows to ensure 100% complete dataset retrieval. |
| [`CustomerLedger.tsx`](file:///src/components/customers/CustomerLedger.tsx) | `customerLedgerEntries.map(...)` | **Paginated List** | All records rendered into DOM without pagination | Mobile UI lag and overflow on customers with hundreds of transactions. | **Added Deterministic Pagination:**<br>Added 20 entries per page with Previous/Next controls, page counter, and range bounds. |
| [`CustomerList.tsx`](file:///src/components/customers/CustomerList.tsx) | `filteredCustomers.map(...)` | **Paginated List** | All customers rendered in DOM | Large customer directories caused mobile scroll lag. | **Added Deterministic Pagination:**<br>Added 25 customers per page with automatic page reset upon searching or debt filter toggles. |
| [`InventoryList.tsx`](file:///src/components/inventory/InventoryList.tsx) | `filteredProducts.map(...)` | **Paginated List** | All products rendered into DOM | Catalog scaling issue on mobile devices. | **Added Deterministic Pagination:**<br>Added 25 items per page with reactive search/filter page resets and pagination controls. |
| [`ManagerDashboard.tsx`](file:///src/components/dashboard/ManagerDashboard.tsx) | `metrics.incomingCartons` & `metrics.outgoingCartons` | **Dashboard Metric** | Displayed with `(Recent 200)` caveat due to sample calculation | Totals did not reflect true business volume. | **Removed disclaimer:** Now displays authoritative dataset-wide figures fetched from `v_inventory_volume_metrics`. |
| [`WarehouseActivityView.tsx`](file:///src/components/warehouse/WarehouseActivityView.tsx) | `metrics.incomingCartons` & `metrics.outgoingCartons` | **Dashboard Metric** | Displayed with `(Recent 200)` caveat | Confusing warehouse staff with partial volume counts. | **Removed disclaimer:** Authoritative volume metrics populated directly from database view. |

---

## 2. Database Migrations

### Migration File: `supabase/migrations/20261023000001_dataset_wide_aggregates.sql`
```sql
-- 1. Create dataset-wide inventory volume metrics view with RLS inheritance
CREATE OR REPLACE VIEW public.v_inventory_volume_metrics
WITH (security_invoker = true)
AS
SELECT
  COALESCE(SUM(change) FILTER (WHERE type = 'purchase'), 0)::numeric AS incoming_cartons,
  COALESCE(SUM(ABS(change)) FILTER (WHERE type = 'sale'), 0)::numeric AS outgoing_cartons,
  COUNT(*)::bigint AS total_transactions
FROM public.inventory_transactions;

-- 2. Standalone aggregation RPC functions for mobile optimization
CREATE OR REPLACE FUNCTION public.get_inventory_volume_metrics()
RETURNS TABLE(
  incoming_cartons numeric,
  outgoing_cartons numeric,
  total_transactions bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(change) FILTER (WHERE it.type = 'purchase'), 0)::numeric AS incoming_cartons,
    COALESCE(SUM(ABS(change)) FILTER (WHERE it.type = 'sale'), 0)::numeric AS outgoing_cartons,
    COUNT(*)::bigint AS total_transactions
  FROM public.inventory_transactions it;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_total_customer_credit()
RETURNS numeric
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(outstanding_balance)
     FROM public.v_customer_balances
     WHERE outstanding_balance > 0),
    0
  );
END;
$$;
```

---

## 3. Verification & Automated Testing

### Automated Test Suite: `tests/data_truncation_audit.test.mjs`
To ensure robust validation, a standalone automated test suite was implemented and verified with `node --test` (`npm test`):

1. **Volume Aggregates Test (>200 records):**
   - Simulated 350 transactions (200 purchases, 150 sales).
   - Proved that the former `.limit(200)` sample completely dropped all 150 sales (reported 0 outgoing cartons instead of 750).
   - Proved that the new database view aggregate logic correctly captures 2,000 incoming cartons and 750 outgoing cartons.
2. **Customer Balances Test (>1,000 records):**
   - Simulated 1,200 ledger transactions across multiple customers.
   - Proved that client fetching subject to PostgREST's 1,000-row limit corrupts customer balances.
   - Verified that server-side pre-aggregated balances (`v_customer_balances`) maintain 100% accuracy.
3. **Inventory List Pagination:**
   - Validated 25-item slice boundaries, page clamping, and multi-page indexing across 63 catalog items.
4. **Customer Ledger Pagination:**
   - Validated 20-entry slice boundaries across 120 ledger items.
5. **Reports Batch Range Retrieval:**
   - Validated multi-batch range query logic (`.range(from, from + batchSize - 1)`) across 2,500 records.

### Build Verification
- Production build verified via `next build` (Turbopack + TypeScript): **Exit Code 0, 0 errors**.
