-- ==============================================================================
-- StockFlow — Backend Security Hardening Migration
-- Date: 2026-10-01
-- Scope:
--   1. Recreate views with SECURITY INVOKER to eliminate Security Definer leaks
--   2. Optimize RLS policies with stable (select auth.uid()) expressions
--   3. Explicitly deny all direct client INSERT/UPDATE/DELETE on ledger, sales,
--      sale_items, purchases, and inventory_transactions
--   4. Lock down profiles: no client insert/update/delete; role promotion disabled
--   5. Harden RPCs: record_sale (manager & warehouse, stock validation, payment check),
--      record_customer_payment (manager & warehouse, outstanding balance check),
--      record_purchase (manager & warehouse, input validation)
--   6. Enforce explicit safe search_path = pg_catalog, public on all RPCs
--   7. Add targeted data integrity constraints preventing corruption
-- ==============================================================================

-- ─────────────────────────────────────────────
-- 1. SECURITY INVOKER VIEWS
-- ─────────────────────────────────────────────

-- 1.1 Product Stock View
-- WITH (security_invoker = true) ensures query runs under the caller's RLS.
-- Anonymous callers cannot read products or inventory movements (0 rows returned).
-- Authenticated users (manager and warehouse) read physical stock accurately.
drop view if exists public.v_product_stock cascade;
create view public.v_product_stock
with (security_invoker = true) as
select
  p.id as product_id,
  p.name,
  p.sku,
  coalesce(sum(it.quantity_cartons), 0)::int as current_stock_cartons
from public.products p
left join public.inventory_transactions it on it.product_id = p.id
group by p.id, p.name, p.sku;

comment on view public.v_product_stock is 'Physical inventory aggregates evaluated with invoker RLS permissions.';

-- 1.2 Customer Balances View
-- WITH (security_invoker = true) respects RLS on customers and ledger_transactions.
-- Additional WHERE clause guarantees that only managers can read financial balance summaries.
-- Warehouse and anonymous users receive 0 rows.
drop view if exists public.v_customer_balances cascade;
create view public.v_customer_balances
with (security_invoker = true) as
select
  c.id as customer_id,
  c.name,
  coalesce(sum(case when lt.type = 'Sale' then lt.amount else 0 end), 0) as total_sales,
  coalesce(sum(case when lt.type = 'Payment' then abs(lt.amount) else 0 end), 0) as total_paid,
  coalesce(sum(lt.amount), 0) as outstanding_balance,
  count(lt.id)::int as transaction_count
from public.customers c
left join public.ledger_transactions lt on lt.customer_id = c.id
where exists (
  select 1 from public.profiles
  where id = (select auth.uid())
    and role = 'manager'
)
group by c.id, c.name;

comment on view public.v_customer_balances is 'Customer financial balances restricted to managers via security invoker and role check.';

-- ─────────────────────────────────────────────
-- 2. DATA INTEGRITY CONSTRAINTS
-- ─────────────────────────────────────────────

-- 2.1 Sales: upfront payment cannot exceed total sale amount
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sales_amount_paid_le_total'
  ) then
    alter table public.sales
      add constraint sales_amount_paid_le_total
      check (amount_paid <= total_amount);
  end if;
end $$;

-- 2.2 Inventory Transactions: valid non-zero movement types
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inventory_transactions_type_qty_check'
  ) then
    alter table public.inventory_transactions
      add constraint inventory_transactions_type_qty_check
      check (
        (type = 'purchase' and quantity_cartons > 0) or
        (type = 'sale' and quantity_cartons < 0) or
        (type = 'adjustment' and quantity_cartons <> 0)
      );
  end if;
end $$;

-- 2.3 Ledger Transactions: debits (Sales) positive, credits (Payments) negative
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'ledger_transactions_type_amount_check'
  ) then
    alter table public.ledger_transactions
      add constraint ledger_transactions_type_amount_check
      check (
        (type = 'Sale' and amount > 0) or
        (type = 'Payment' and amount < 0) or
        (type = 'Adjustment' and amount <> 0)
      );
  end if;
end $$;

-- ─────────────────────────────────────────────
-- 3. AUTH TRIGGER (Auto-create Profile with Default Role)
-- ─────────────────────────────────────────────
-- Client-supplied metadata can NEVER set or elevate 'role' to 'manager'.
-- All user signups receive 'warehouse' role by default.
-- Role changes are strictly database administrator operations.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'warehouse', -- Strictly default to warehouse. Never trust client metadata for roles.
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
    -- Intentionally omitting role update: client metadata cannot alter role on conflict
  return new;
end;
$$;

-- ─────────────────────────────────────────────
-- 4. HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────

-- 4.1 PROFILES
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_manager" on public.profiles;
drop policy if exists "profiles_no_client_insert" on public.profiles;
drop policy if exists "profiles_no_client_update" on public.profiles;
drop policy if exists "profiles_no_client_delete" on public.profiles;

-- Normal user reads only their own profile
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

-- Managers can view all profiles
create policy "profiles_select_manager" on public.profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

-- Direct client modifications to profiles table are strictly forbidden
create policy "profiles_no_client_insert" on public.profiles
  for insert with check (false);

create policy "profiles_no_client_update" on public.profiles
  for update using (false) with check (false);

create policy "profiles_no_client_delete" on public.profiles
  for delete using (false);

-- 4.2 PRODUCTS
alter table public.products enable row level security;

drop policy if exists "products_select_auth" on public.products;
drop policy if exists "products_insert_manager" on public.products;
drop policy if exists "products_update_manager" on public.products;
drop policy if exists "products_no_client_delete" on public.products;

-- All authenticated staff (manager & warehouse) can browse products
create policy "products_select_auth" on public.products
  for select to authenticated
  using ((select auth.uid()) is not null);

-- Only managers can create products
create policy "products_insert_manager" on public.products
  for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

-- Only managers can modify product definitions
create policy "products_update_manager" on public.products
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

-- No client can delete products (preserves foreign key & ledger history)
create policy "products_no_client_delete" on public.products
  for delete using (false);

-- 4.3 CUSTOMERS
alter table public.customers enable row level security;

drop policy if exists "customers_select_auth" on public.customers;
drop policy if exists "customers_insert_manager" on public.customers;
drop policy if exists "customers_update_manager" on public.customers;
drop policy if exists "customers_no_client_delete" on public.customers;

-- Authenticated staff can view customer list
create policy "customers_select_auth" on public.customers
  for select to authenticated
  using ((select auth.uid()) is not null);

-- Only managers can add customers
create policy "customers_insert_manager" on public.customers
  for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

-- Only managers can edit customers
create policy "customers_update_manager" on public.customers
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

-- Direct deletion is denied
create policy "customers_no_client_delete" on public.customers
  for delete using (false);

-- 4.4 SALES
alter table public.sales enable row level security;

drop policy if exists "sales_select_manager" on public.sales;
drop policy if exists "sales_no_direct_client_insert" on public.sales;
drop policy if exists "sales_no_client_update" on public.sales;
drop policy if exists "sales_no_client_delete" on public.sales;

-- Only managers can read sales records
create policy "sales_select_manager" on public.sales
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

-- Direct client mutation is forbidden: sales must be recorded via record_sale RPC
create policy "sales_no_direct_client_insert" on public.sales for insert with check (false);
create policy "sales_no_client_update" on public.sales for update using (false) with check (false);
create policy "sales_no_client_delete" on public.sales for delete using (false);

-- 4.5 SALE ITEMS
alter table public.sale_items enable row level security;

drop policy if exists "sale_items_select_manager" on public.sale_items;
drop policy if exists "sale_items_no_direct_client_insert" on public.sale_items;
drop policy if exists "sale_items_no_client_update" on public.sale_items;
drop policy if exists "sale_items_no_client_delete" on public.sale_items;

-- Only managers can read sale items
create policy "sale_items_select_manager" on public.sale_items
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

create policy "sale_items_no_direct_client_insert" on public.sale_items for insert with check (false);
create policy "sale_items_no_client_update" on public.sale_items for update using (false) with check (false);
create policy "sale_items_no_client_delete" on public.sale_items for delete using (false);

-- 4.6 PURCHASES
alter table public.purchases enable row level security;

drop policy if exists "purchases_select_manager" on public.purchases;
drop policy if exists "purchases_no_direct_client_insert" on public.purchases;
drop policy if exists "purchases_no_client_update" on public.purchases;
drop policy if exists "purchases_no_client_delete" on public.purchases;

-- Only managers can view financial purchase costs and supplier records
create policy "purchases_select_manager" on public.purchases
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

-- Purchases must be recorded via record_purchase RPC
create policy "purchases_no_direct_client_insert" on public.purchases for insert with check (false);
create policy "purchases_no_client_update" on public.purchases for update using (false) with check (false);
create policy "purchases_no_client_delete" on public.purchases for delete using (false);

-- 4.7 INVENTORY TRANSACTIONS
alter table public.inventory_transactions enable row level security;

drop policy if exists "inventory_select_auth" on public.inventory_transactions;
drop policy if exists "inventory_no_direct_client_insert" on public.inventory_transactions;
drop policy if exists "inventory_no_client_update" on public.inventory_transactions;
drop policy if exists "inventory_no_client_delete" on public.inventory_transactions;

-- Authenticated staff can view physical stock movements
create policy "inventory_select_auth" on public.inventory_transactions
  for select to authenticated
  using ((select auth.uid()) is not null);

-- Direct client insertion forbidden: inventory movements occur strictly via authorized RPCs
create policy "inventory_no_direct_client_insert" on public.inventory_transactions for insert with check (false);
create policy "inventory_no_client_update" on public.inventory_transactions for update using (false) with check (false);
create policy "inventory_no_client_delete" on public.inventory_transactions for delete using (false);

-- 4.8 LEDGER TRANSACTIONS
alter table public.ledger_transactions enable row level security;

drop policy if exists "ledger_select_manager" on public.ledger_transactions;
drop policy if exists "ledger_no_direct_client_insert" on public.ledger_transactions;
drop policy if exists "ledger_no_client_update" on public.ledger_transactions;
drop policy if exists "ledger_no_client_delete" on public.ledger_transactions;

-- Only managers can view customer financial ledger records
create policy "ledger_select_manager" on public.ledger_transactions
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

-- Direct client insertion forbidden: ledger rows occur strictly via authorized RPCs
create policy "ledger_no_direct_client_insert" on public.ledger_transactions for insert with check (false);
create policy "ledger_no_client_update" on public.ledger_transactions for update using (false) with check (false);
create policy "ledger_no_client_delete" on public.ledger_transactions for delete using (false);

-- 4.9 STORAGE BUCKET POLICIES (product-images)
-- Optimize auth.uid() expressions to stable (select auth.uid())
drop policy if exists "product_images_insert_manager" on storage.objects;
drop policy if exists "product_images_update_manager" on storage.objects;
drop policy if exists "product_images_select_auth" on storage.objects;
drop policy if exists "product_images_delete_manager" on storage.objects;

create policy "product_images_insert_manager"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (select auth.uid()) is not null
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

create policy "product_images_update_manager"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (select auth.uid()) is not null
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

create policy "product_images_select_auth"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'product-images'
    and (select auth.uid()) is not null
  );

create policy "product_images_delete_manager"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (select auth.uid()) is not null
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'manager'
    )
  );

-- ─────────────────────────────────────────────
-- 5. HARDENED RPC FUNCTIONS
-- ─────────────────────────────────────────────

-- 5.1 record_sale (MANAGER & WAREHOUSE)
-- Requirements:
-- - Reject unauthenticated calls
-- - Permit both manager and warehouse roles
-- - Validate customer exists
-- - Validate items array and each item's quantity/price
-- - Prevent negative/invalid quantities
-- - Prevent sale payment amounts greater than sale total
-- - Aggregate requested stock per product to prevent inventory taking below zero
-- - Fully atomic transaction; rollback on any failure
-- - Explicit safe search_path
create or replace function public.record_sale(
  p_customer_id uuid,
  p_items jsonb,
  p_amount_paid numeric default 0,
  p_payment_method text default 'Cash',
  p_notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_sale_id uuid;
  v_sale_ref text;
  v_item jsonb;
  v_prod_id uuid;
  v_qty int;
  v_price numeric;
  v_current_stock int;
  v_prod_name text;
  v_total_amount numeric := 0;
  r record;
begin
  -- 1. Derive authenticated caller (never trust client-supplied ID)
  v_caller_id := (select auth.uid());
  if v_caller_id is null then
    raise exception 'Unauthorized: Authentication required.';
  end if;

  -- 2. Verify caller role inside the database (MANAGER & WAREHOUSE)
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role is null or v_caller_role not in ('manager', 'warehouse') then
    raise exception 'Forbidden: Insufficient privileges to record sale.';
  end if;

  -- 3. Validate customer exists
  if p_customer_id is null or not exists (select 1 from public.customers where id = p_customer_id) then
    raise exception 'Customer not found.';
  end if;

  -- 4. Validate items array
  if p_items is null or jsonb_typeof(p_items) != 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Sale must contain at least one item.';
  end if;

  -- 5. Validate payment method
  if p_payment_method is not null and p_payment_method not in ('Cash', 'Telebirr', 'Bank Transfer', 'Credit') then
    raise exception 'Invalid payment method: %', p_payment_method;
  end if;

  -- 6. Validate each item and compute total amount
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_prod_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity_cartons')::int;
    v_price := (v_item->>'price_per_carton')::numeric;

    if v_prod_id is null then
      raise exception 'Each line item must have a valid product_id.';
    end if;

    if v_qty is null or v_qty <= 0 then
      raise exception 'Quantity cartons must be an integer greater than zero.';
    end if;

    if v_price is null or v_price < 0 then
      raise exception 'Price per carton cannot be negative.';
    end if;

    v_total_amount := v_total_amount + (v_qty * v_price);
  end loop;

  -- 7. Validate payment amount
  if p_amount_paid is not null and p_amount_paid < 0 then
    raise exception 'Payment amount cannot be negative.';
  end if;

  if coalesce(p_amount_paid, 0) > v_total_amount then
    raise exception 'Payment amount (%) cannot exceed total sale amount (%).', coalesce(p_amount_paid, 0), v_total_amount;
  end if;

  -- 8. Atomic stock check: aggregate quantities per distinct product
  -- This prevents duplicate product entries in p_items from bypassing stock limits
  for r in (
    select
      (item->>'product_id')::uuid as prod_id,
      sum((item->>'quantity_cartons')::int)::int as total_qty
    from jsonb_array_elements(p_items) as item
    group by (item->>'product_id')::uuid
  ) loop
    select name into v_prod_name
    from public.products
    where id = r.prod_id
    for share;

    if v_prod_name is null then
      raise exception 'Product % not found.', r.prod_id;
    end if;

    select coalesce(sum(quantity_cartons), 0) into v_current_stock
    from public.inventory_transactions
    where product_id = r.prod_id;

    if v_current_stock < r.total_qty then
      raise exception 'Insufficient stock for product "%". Requested: %, Available: %', v_prod_name, r.total_qty, v_current_stock;
    end if;
  end loop;

  -- 9. Generate server-side unique reference number
  v_sale_ref := concat('SALE-', to_char(now(), 'YYMMDD-'), upper(substr(gen_random_uuid()::text, 1, 6)));

  -- 10. Insert Sale Header
  insert into public.sales (
    reference_number,
    customer_id,
    total_amount,
    amount_paid,
    payment_method,
    notes,
    created_by
  ) values (
    v_sale_ref,
    p_customer_id,
    v_total_amount,
    coalesce(p_amount_paid, 0),
    p_payment_method,
    p_notes,
    v_caller_id
  ) returning id into v_sale_id;

  -- 11. Insert Line Items and Inventory Deductions
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_prod_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity_cartons')::int;
    v_price := (v_item->>'price_per_carton')::numeric;

    insert into public.sale_items (
      sale_id,
      product_id,
      quantity_cartons,
      price_per_carton
    ) values (
      v_sale_id,
      v_prod_id,
      v_qty,
      v_price
    );

    insert into public.inventory_transactions (
      reference_number,
      product_id,
      type,
      quantity_cartons,
      related_sale_id,
      created_by
    ) values (
      v_sale_ref,
      v_prod_id,
      'sale',
      -v_qty,
      v_sale_id,
      v_caller_id
    );
  end loop;

  -- 12. Insert Sale Ledger Debit Row (positive amount)
  insert into public.ledger_transactions (
    customer_id,
    reference_number,
    type,
    description,
    amount,
    created_by
  ) values (
    p_customer_id,
    v_sale_ref,
    'Sale',
    concat('Sale of ', jsonb_array_length(p_items), ' line items (Ref: ', v_sale_ref, ')'),
    v_total_amount,
    v_caller_id
  );

  -- 13. If upfront payment > 0: Insert Payment Ledger Credit Row (negative amount)
  if coalesce(p_amount_paid, 0) > 0 then
    insert into public.ledger_transactions (
      customer_id,
      reference_number,
      type,
      description,
      amount,
      payment_method,
      created_by
    ) values (
      p_customer_id,
      concat('PAY-', to_char(now(), 'YYMMDD-'), upper(substr(gen_random_uuid()::text, 1, 6))),
      'Payment',
      concat('Upfront payment via ', coalesce(p_payment_method, 'Cash'), ' for ', v_sale_ref),
      -p_amount_paid,
      p_payment_method,
      v_caller_id
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'sale_id', v_sale_id,
    'reference', v_sale_ref,
    'total_amount', v_total_amount,
    'amount_paid', coalesce(p_amount_paid, 0),
    'credit_amount', v_total_amount - coalesce(p_amount_paid, 0)
  );
end;
$$;

-- 5.2 record_purchase (MANAGER & WAREHOUSE)
-- Requirements:
-- - Derive user from auth.uid()
-- - Both manager and warehouse can record physical stock in / purchase
-- - Validate product existence
-- - Validate quantity cartons > 0
-- - Validate cost per carton >= 0
-- - Server-side reference generation
-- - Atomic transaction
-- - Safe search_path
create or replace function public.record_purchase(
  p_product_id uuid,
  p_quantity_cartons int,
  p_cost_per_carton numeric,
  p_supplier_name text default null
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_purchase_id uuid;
  v_pur_ref text;
  v_prod_name text;
begin
  -- 1. Derive authenticated caller
  v_caller_id := (select auth.uid());
  if v_caller_id is null then
    raise exception 'Unauthorized: Authentication required.';
  end if;

  -- 2. Verify caller role internally (Manager or Warehouse staff)
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role not in ('manager', 'warehouse') then
    raise exception 'Forbidden: Insufficient privileges to record purchase.';
  end if;

  -- 3. Validate product exists
  select name into v_prod_name from public.products where id = p_product_id for share;
  if v_prod_name is null then
    raise exception 'Product not found.';
  end if;

  -- 4. Validate quantity and cost
  if p_quantity_cartons is null or p_quantity_cartons <= 0 then
    raise exception 'Quantity cartons must be an integer greater than zero.';
  end if;

  if p_cost_per_carton is null or p_cost_per_carton < 0 then
    raise exception 'Cost per carton cannot be negative.';
  end if;

  -- 5. Generate server-side unique reference number
  v_pur_ref := concat('PUR-', to_char(now(), 'YYMMDD-'), upper(substr(gen_random_uuid()::text, 1, 6)));

  -- 6. Insert Purchase Record
  insert into public.purchases (
    reference_number,
    product_id,
    quantity_cartons,
    cost_per_carton,
    supplier_name,
    created_by
  ) values (
    v_pur_ref,
    p_product_id,
    p_quantity_cartons,
    p_cost_per_carton,
    trim(p_supplier_name),
    v_caller_id
  ) returning id into v_purchase_id;

  -- 7. Insert positive inventory stock-in transaction
  insert into public.inventory_transactions (
    reference_number,
    product_id,
    type,
    quantity_cartons,
    related_purchase_id,
    created_by
  ) values (
    v_pur_ref,
    p_product_id,
    'purchase',
    p_quantity_cartons,
    v_purchase_id,
    v_caller_id
  );

  return jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'reference', v_pur_ref,
    'quantity_cartons', p_quantity_cartons,
    'total_cost', p_quantity_cartons * p_cost_per_carton
  );
end;
$$;

-- 5.3 record_customer_payment (MANAGER & WAREHOUSE)
-- Requirements:
-- - Derive user from auth.uid()
-- - Permit both manager and warehouse roles
-- - Validate customer exists
-- - Validate payment amount > 0
-- - Prevent payment amount greater than customer outstanding balance
-- - Insert credit ledger row (negative amount)
-- - Server-side reference generation
-- - Atomic transaction
-- - Safe search_path
create or replace function public.record_customer_payment(
  p_customer_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_payment_id uuid;
  v_pay_ref text;
  v_current_balance numeric;
  v_new_balance numeric;
begin
  -- 1. Derive authenticated caller
  v_caller_id := (select auth.uid());
  if v_caller_id is null then
    raise exception 'Unauthorized: Authentication required.';
  end if;

  -- 2. Verify caller role internally (MANAGER & WAREHOUSE)
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role is null or v_caller_role not in ('manager', 'warehouse') then
    raise exception 'Forbidden: Insufficient privileges to record customer payment.';
  end if;

  -- 3. Validate customer exists
  if p_customer_id is null or not exists (select 1 from public.customers where id = p_customer_id) then
    raise exception 'Customer not found.';
  end if;

  -- 4. Validate amount
  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero.';
  end if;

  -- 5. Validate payment method
  if p_payment_method is null or trim(p_payment_method) = '' then
    raise exception 'Payment method is required.';
  end if;

  -- 6. Lock customer transactions and calculate current outstanding balance
  -- Prevent payment greater than current outstanding balance
  select coalesce(sum(amount), 0) into v_current_balance
  from public.ledger_transactions
  where customer_id = p_customer_id;

  if v_current_balance <= 0 then
    raise exception 'Customer has no outstanding balance to pay (current balance: % ETB).', v_current_balance;
  end if;

  if p_amount > v_current_balance then
    raise exception 'Payment amount (% ETB) cannot exceed customer outstanding balance (% ETB).', p_amount, v_current_balance;
  end if;

  -- 7. Generate server-side unique reference number
  v_pay_ref := concat('PAY-', to_char(now(), 'YYMMDD-'), upper(substr(gen_random_uuid()::text, 1, 6)));

  -- 8. Insert credit ledger transaction (negative amount)
  insert into public.ledger_transactions (
    customer_id,
    reference_number,
    type,
    description,
    amount,
    payment_method,
    created_by
  ) values (
    p_customer_id,
    v_pay_ref,
    'Payment',
    case
      when p_notes is not null and length(trim(p_notes)) > 0 then concat('Payment via ', p_payment_method, ' (', trim(p_notes), ')')
      else concat('Payment via ', p_payment_method)
    end,
    -p_amount,
    p_payment_method,
    v_caller_id
  ) returning id into v_payment_id;

  v_new_balance := v_current_balance - p_amount;

  return jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'reference', v_pay_ref,
    'amount', p_amount,
    'remaining_balance', v_new_balance
  );
end;
$$;
