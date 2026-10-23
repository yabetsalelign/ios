-- ==============================================================================
-- StockFlow — Dataset-Wide Aggregates Migration
-- Scope:
--   1. Create v_inventory_volume_metrics view with SECURITY INVOKER
--      Calculates all-time incoming (purchases) and outgoing (sales) carton volumes
--      directly in PostgreSQL across the complete dataset.
--   2. Create get_inventory_volume_metrics() RPC function
--   3. Create get_customer_credit_totals() RPC function for dataset-wide credit totals
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

comment on view public.v_inventory_volume_metrics is 'Dataset-wide inventory volume totals calculated natively in PostgreSQL under caller security invoker.';

-- ─────────────────────────────────────────────
-- 2. INVENTORY VOLUME TOTALS RPC
-- ─────────────────────────────────────────────
create or replace function public.get_inventory_volume_metrics()
returns table (incoming_cartons bigint, outgoing_cartons bigint)
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  return query
  select
    coalesce(sum(case when type = 'purchase' then it.quantity_cartons else 0 end), 0)::bigint as incoming_cartons,
    coalesce(sum(case when type = 'sale' then abs(it.quantity_cartons) else 0 end), 0)::bigint as outgoing_cartons
  from public.inventory_transactions it;
end;
$$;

comment on function public.get_inventory_volume_metrics() is 'RPC returning dataset-wide incoming and outgoing carton volumes for authorized users.';

-- ─────────────────────────────────────────────
-- 3. MANAGER TOTAL CUSTOMER CREDIT RPC
-- ─────────────────────────────────────────────
create or replace function public.get_total_customer_credit()
returns numeric
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_total numeric := 0;
begin
  v_caller_id := (select auth.uid());
  if v_caller_id is null then
    raise exception 'Unauthorized: Authentication required.';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role is null or v_caller_role != 'manager' then
    -- Non-managers receive 0 or error; keeping RLS alignment
    return 0;
  end if;

  select coalesce(sum(case when outstanding_balance > 0 then outstanding_balance else 0 end), 0)
  into v_total
  from public.v_customer_balances;

  return v_total;
end;
$$;

comment on function public.get_total_customer_credit() is 'Calculates dataset-wide customer debt sum across all customers for managers.';
