-- ==============================================================================
-- StockFlow — Dataset-Wide Aggregates Migration
-- Scope:
--   1. Create v_inventory_volume_metrics view with SECURITY INVOKER
--      Calculates all-time incoming (purchases) and outgoing (sales) carton volumes
--      directly in PostgreSQL across the complete dataset using quantity_cartons.
-- ==============================================================================

-- ─────────────────────────────────────────────
-- 1. INVENTORY VOLUME TOTALS VIEW
-- ─────────────────────────────────────────────
drop view if exists public.v_inventory_volume_metrics cascade;
create view public.v_inventory_volume_metrics
with (security_invoker = true) as
select
  coalesce(sum(case when type = 'purchase' then quantity_cartons else 0 end), 0)::bigint as incoming_cartons,
  coalesce(sum(case when type = 'sale' then abs(quantity_cartons) else 0 end), 0)::bigint as outgoing_cartons
from public.inventory_transactions;

comment on view public.v_inventory_volume_metrics is 'Dataset-wide inventory volume totals calculated natively in PostgreSQL using quantity_cartons under caller security invoker.';
