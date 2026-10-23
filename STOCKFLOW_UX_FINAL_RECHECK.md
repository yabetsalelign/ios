# StockFlow UX Final Recheck & Verification

## 1. Status of Known Findings

| # | Finding | Status | Summary of Resolution |
|---|---|---|---|
| 1 | **Customer balances** | **Fixed** | Warehouse users never see false "Settled / 0 ETB" balances when RLS hides `ledger_transactions`. Both `CustomerList.tsx` and `CustomerLedger.tsx` now check `hasTransactionAccess` (`currentUser.role === 'manager' || rawTransactions.length > 0`). When transaction access is restricted, neutral indicator pills (`–`) and informational restricted notices are displayed, preserving accurate figures for managers. |
| 2 | **Product costs** | **Fixed** | In `InventoryList.tsx`, `costPerCarton` is conditionally hidden for non-manager roles and replaced with a discreet "Manager only" text label. *(Note: Pure UI hiding does not alter database RLS query returns, which remains the authoritative security boundary).* |
| 3 | **Role-specific navigation** | **Fixed** | Mobile bottom navigation and desktop sidebar keep roles strictly separated. In addition, `AppShell.tsx` view routing explicitly guards `case 'reports'`, falling back safely to `WarehouseActivityView` for non-managers rather than rendering a blank/broken view if view state is manipulated. |
| 4 | **Mobile accessibility** | **Fixed** | Mobile header language toggles (`EN`/`አማ`) and profile avatar button were updated with enlarged touch targets (`min-h-[38px] min-w-[40px]` and `w-10 h-10`). All modal close buttons across the app (`RecordSaleModal`, `RecordPurchaseModal`, `RecordCustomerPaymentModal`, `CustomerFormModal`, `ProductFormModal`, `ProfileModal`, `QuickActionSheet`, `InventoryList`) have been standardized to `w-10 h-10` (~40×40px) with `touch-manipulation`. |
| 5 | **Ledger accuracy** | **Fixed** | `calculateCustomerFinancials` in `src/domain/calculations/ledger.ts` was corrected to derive `outstandingBalance` from the chronological running total (`running`) rather than `totalSales - totalPaid`. This ensures `Adjustment` entries (credits, write-offs, debit adjustments) are accurately reflected in the customer balance and match ledger rows. |
| 6 | **Dashboard metrics** | **Addressed & Documented** | In `ManagerDashboard.tsx` and `WarehouseActivityView.tsx`, the "Coming In" and "Sold" volume cards now display `(Recent 200)` whenever loaded inventory transactions reach the client limit of 200 rows. This prevents partial data from being misrepresented as all-time lifetime totals. For lifetime aggregates, a server-side RPC / view is documented below. |

---

## 2. Files Changed

1. [`src/domain/calculations/ledger.ts`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/domain/calculations/ledger.ts) — Derived customer `outstandingBalance` from cumulative running total to respect `Adjustment` records.
2. [`src/components/customers/CustomerList.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/customers/CustomerList.tsx) — Added `hasTransactionAccess` check to display neutral restricted pill (`–`) instead of false settled 0 ETB for warehouse staff.
3. [`src/components/customers/CustomerLedger.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/customers/CustomerLedger.tsx) — Guarded header balance pill, 3 summary cards, and ledger rows to show neutral restricted state for non-managers.
4. [`src/components/inventory/InventoryList.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/inventory/InventoryList.tsx) — Hidden `costPerCarton` for non-managers and enlarged details close button.
5. [`src/components/layout/AppShell.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/layout/AppShell.tsx) — Fallback guard for `case 'reports'` routing and enlarged mobile header language/profile touch targets.
6. [`src/components/dashboard/ManagerDashboard.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/dashboard/ManagerDashboard.tsx) — Clarified Coming In and Sold volume chips when bounded by 200 records.
7. [`src/components/warehouse/WarehouseActivityView.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/warehouse/WarehouseActivityView.tsx) — Clarified Coming In and Sold volume chips when bounded by 200 records.
8. [`src/components/transactions/RecordSaleModal.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/transactions/RecordSaleModal.tsx) — Close button touch target enlarged to `w-10 h-10`.
9. [`src/components/transactions/RecordPurchaseModal.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/transactions/RecordPurchaseModal.tsx) — Close button touch target enlarged to `w-10 h-10`.
10. [`src/components/transactions/RecordCustomerPaymentModal.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/transactions/RecordCustomerPaymentModal.tsx) — Close button touch target enlarged to `w-10 h-10`.
11. [`src/components/customers/CustomerFormModal.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/customers/CustomerFormModal.tsx) — Close button touch target enlarged to `w-10 h-10`.
12. [`src/components/inventory/ProductFormModal.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/inventory/ProductFormModal.tsx) — Close button touch target enlarged to `w-10 h-10`.
13. [`src/components/profile/ProfileModal.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/profile/ProfileModal.tsx) — Close button touch target enlarged to `w-10 h-10`.
14. [`src/components/navigation/QuickActionSheet.tsx`](file:///c:/Users/Ruth.A/Desktop/New%20folder/ios/src/components/navigation/QuickActionSheet.tsx) — Close button touch target enlarged to `w-10 h-10`.

---

## 3. Verification Results

- **`git diff --check`**: Clean (no whitespace errors or merge anomalies).
- **`npm run build`**: **Exit code 0**. TypeScript clean, Next.js static pages generated cleanly in 10.1s.

---

## 4. Documented Remaining Backend Item (For Future Migration)

- **Lifetime Volume Aggregation (Finding 6)**:
  `inventory_transactions` are currently loaded on client start with `.limit(200)` to prevent excessive payload transfers and mobile memory exhaustion.
  If the business desires exact all-time historical carton totals without client memory penalty, create a lightweight Postgres aggregation RPC in a future migration:
  ```sql
  create or replace function get_inventory_volume_totals()
  returns table (total_incoming bigint, total_outgoing bigint)
  language sql
  security definer
  as $$
    select
      coalesce(sum(case when type = 'purchase' then quantity_cartons else 0 end), 0) as total_incoming,
      coalesce(sum(case when type = 'sale' then abs(quantity_cartons) else 0 end), 0) as total_outgoing
    from inventory_transactions;
  $$;
  ```
  In this pass, per constraints, no database migrations or backend changes were applied.
