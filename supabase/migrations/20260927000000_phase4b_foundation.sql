-- ==============================================================================
-- StockFlow — Phase 4B: Supabase Foundation Migration
-- Tables: profiles, products, customers, inventory_transactions, sales,
--         sale_items, ledger_transactions, purchases
-- Views: v_product_stock, v_customer_balances
-- Security: Strict RLS with WITH CHECK for INSERTs, zero client ledger INSERTs,
--           SECURITY DEFINER RPCs verifying auth.uid() internally.
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. PROFILES (1-to-1 extension of auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in ('manager', 'warehouse')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'User profiles linked 1-to-1 to auth.users. Role determines application permissions.';

-- ─────────────────────────────────────────────
-- 2. PRODUCTS (Catalog & Physical Constants)
-- ─────────────────────────────────────────────
create table if not exists public.products (
  id                          uuid primary key default gen_random_uuid(),
  name                        text not null,
  sku                         text not null unique,
  category                    text,
  image_url                   text,
  pieces_per_carton           int check (pieces_per_carton > 0),
  selling_price_per_carton    numeric(12,2) not null check (selling_price_per_carton >= 0),
  cost_per_carton             numeric(12,2) not null check (cost_per_carton >= 0),
  low_stock_threshold_cartons int not null default 10 check (low_stock_threshold_cartons >= 0),
  created_by                  uuid references public.profiles(id),
  created_at                  timestamptz not null default now()
);

-- NOTE: current_stock_cartons is NEVER stored as a static column.
-- It is derived transactionally from SUM(inventory_transactions.quantity_cartons).

-- ─────────────────────────────────────────────
-- 3. CUSTOMERS (Directory)
-- ─────────────────────────────────────────────
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  address     text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 4. SALES (Stock Out Header)
-- ─────────────────────────────────────────────
create table if not exists public.sales (
  id                uuid primary key default gen_random_uuid(),
  reference_number  text not null unique,
  customer_id       uuid not null references public.customers(id) on delete restrict,
  total_amount      numeric(12,2) not null check (total_amount >= 0),
  amount_paid       numeric(12,2) not null default 0 check (amount_paid >= 0),
  credit_amount     numeric(12,2) generated always as (total_amount - amount_paid) stored,
  payment_method    text check (payment_method in ('Cash', 'Telebirr', 'Bank Transfer', 'Credit')),
  notes             text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 5. SALE ITEMS (Stock Out Line Items)
-- ─────────────────────────────────────────────
create table if not exists public.sale_items (
  id                uuid primary key default gen_random_uuid(),
  sale_id           uuid not null references public.sales(id) on delete cascade,
  product_id        uuid not null references public.products(id) on delete restrict,
  quantity_cartons  int not null check (quantity_cartons > 0),
  price_per_carton  numeric(12,2) not null check (price_per_carton >= 0),
  subtotal          numeric(12,2) generated always as (quantity_cartons * price_per_carton) stored
);

-- ─────────────────────────────────────────────
-- 6. PURCHASES (Stock In Header)
-- ─────────────────────────────────────────────
create table if not exists public.purchases (
  id                uuid primary key default gen_random_uuid(),
  reference_number  text not null unique,
  product_id        uuid not null references public.products(id) on delete restrict,
  quantity_cartons  int not null check (quantity_cartons > 0),
  cost_per_carton   numeric(12,2) not null check (cost_per_carton >= 0),
  total_cost        numeric(12,2) generated always as (quantity_cartons * cost_per_carton) stored,
  supplier_name     text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 7. INVENTORY TRANSACTIONS (Stock Ledger Log)
-- ─────────────────────────────────────────────
create table if not exists public.inventory_transactions (
  id                  uuid primary key default gen_random_uuid(),
  reference_number    text not null,
  product_id          uuid not null references public.products(id) on delete restrict,
  type                text not null check (type in ('purchase', 'sale', 'adjustment')),
  quantity_cartons    int not null,  -- positive = in, negative = out
  related_sale_id     uuid references public.sales(id) on delete set null,
  related_purchase_id uuid references public.purchases(id) on delete set null,
  created_by          uuid references public.profiles(id),
  created_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 8. LEDGER TRANSACTIONS (Customer Financial Ledger)
-- ─────────────────────────────────────────────
create table if not exists public.ledger_transactions (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references public.customers(id) on delete restrict,
  reference_number  text not null,
  type              text not null check (type in ('Sale', 'Payment', 'Adjustment')),
  description       text,
  amount            numeric(12,2) not null,  -- Sales: positive (debit), Payments: negative (credit)
  payment_method    text,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 9. DERIVED VIEWS (Transactional Aggregates)
-- ─────────────────────────────────────────────

-- Derived Current Stock per Product
create or replace view public.v_product_stock as
select
  p.id as product_id,
  p.name,
  p.sku,
  coalesce(sum(it.quantity_cartons), 0)::int as current_stock_cartons
from public.products p
left join public.inventory_transactions it on it.product_id = p.id
group by p.id, p.name, p.sku;

-- Derived Customer Balances and Totals
create or replace view public.v_customer_balances as
select
  c.id as customer_id,
  c.name,
  coalesce(sum(case when lt.type = 'Sale' then lt.amount else 0 end), 0) as total_sales,
  coalesce(sum(case when lt.type = 'Payment' then abs(lt.amount) else 0 end), 0) as total_paid,
  coalesce(sum(lt.amount), 0) as outstanding_balance,
  count(lt.id)::int as transaction_count
from public.customers c
left join public.ledger_transactions lt on lt.customer_id = c.id
group by c.id, c.name;

-- ─────────────────────────────────────────────
-- 10. AUTH TRIGGER (Auto-create Profile)
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'warehouse'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    role = coalesce(excluded.role, profiles.role),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.purchases enable row level security;

-- PROFILES
create policy "profiles_select_own" on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_manager" on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'));

-- PRODUCTS
create policy "products_select_auth" on public.products for select
  using (auth.uid() is not null);

create policy "products_insert_manager" on public.products for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'));

create policy "products_update_manager" on public.products for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'));

-- CUSTOMERS
create policy "customers_select_auth" on public.customers for select
  using (auth.uid() is not null);

create policy "customers_insert_manager" on public.customers for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'));

create policy "customers_update_manager" on public.customers for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'));

-- INVENTORY TRANSACTIONS
create policy "inventory_select_auth" on public.inventory_transactions for select
  using (auth.uid() is not null);

create policy "inventory_insert_auth" on public.inventory_transactions for insert
  with check (auth.uid() is not null);

-- SALES (Stock Out)
create policy "sales_select_auth" on public.sales for select
  using (auth.uid() is not null);

create policy "sales_insert_auth" on public.sales for insert
  with check (auth.uid() is not null);

-- SALE ITEMS
create policy "sale_items_select_auth" on public.sale_items for select
  using (auth.uid() is not null);

create policy "sale_items_insert_auth" on public.sale_items for insert
  with check (auth.uid() is not null);

-- PURCHASES (Stock In)
create policy "purchases_select_auth" on public.purchases for select
  using (auth.uid() is not null);

create policy "purchases_insert_auth" on public.purchases for insert
  with check (auth.uid() is not null);

-- LEDGER TRANSACTIONS
-- Only Managers can view financial ledger transactions
create policy "ledger_select_manager" on public.ledger_transactions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'manager'));

-- Direct client INSERT into ledger_transactions is strictly FORBIDDEN for ALL clients (❌)
-- Ledger rows are created exclusively via authorized SECURITY DEFINER RPCs
create policy "ledger_no_direct_client_insert" on public.ledger_transactions for insert
  with check (false);

-- ─────────────────────────────────────────────
-- 12. RPC FUNCTIONS (Atomic Transactions)
-- ─────────────────────────────────────────────

-- 12.1 record_sale (Manager & Warehouse)
create or replace function public.record_sale(
  p_customer_id uuid,
  p_items jsonb,
  p_amount_paid numeric default 0,
  p_payment_method text default 'Cash',
  p_notes text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
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
begin
  -- 1. Determine caller from auth context (do NOT trust client-supplied ID)
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Unauthorized: Authentication required.';
  end if;

  -- 2. Verify caller role internally
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role not in ('manager', 'warehouse') then
    raise exception 'Forbidden: Insufficient privileges to record sale.';
  end if;

  -- 3. Validate customer exists
  if not exists (select 1 from public.customers where id = p_customer_id) then
    raise exception 'Customer not found.';
  end if;

  -- 4. Validate items array
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Sale must contain at least one item.';
  end if;

  -- 5. Validate stock and compute total
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_prod_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity_cartons')::int;
    v_price := (v_item->>'price_per_carton')::numeric;

    if v_qty is null or v_qty <= 0 then
      raise exception 'Quantity cartons must be greater than zero.';
    end if;
    if v_price is null or v_price < 0 then
      raise exception 'Price per carton cannot be negative.';
    end if;

    select name into v_prod_name from public.products where id = v_prod_id;
    if v_prod_name is null then
      raise exception 'Product % not found.', v_prod_id;
    end if;

    -- Transactional stock calculation from inventory ledger
    select coalesce(sum(quantity_cartons), 0) into v_current_stock
    from public.inventory_transactions
    where product_id = v_prod_id;

    if v_current_stock < v_qty then
      raise exception 'Insufficient stock for product "%". Requested: %, Available: %', v_prod_name, v_qty, v_current_stock;
    end if;

    v_total_amount := v_total_amount + (v_qty * v_price);
  end loop;

  -- 6. Generate sale reference number
  v_sale_ref := concat('SALE-', to_char(now(), 'YYMMDD-'), lpad(floor(random() * 10000)::text, 4, '0'));

  -- 7. Insert Sale Header
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

  -- 8. Insert Line Items and Inventory Deductions
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

  -- 9. Insert Sale Ledger Debit Row
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

  -- 10. If upfront payment > 0: Insert Payment Ledger Credit Row
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
      concat('PAY-', to_char(now(), 'YYMMDD-'), lpad(floor(random() * 10000)::text, 4, '0')),
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

-- 12.2 record_purchase (Manager & Warehouse)
create or replace function public.record_purchase(
  p_product_id uuid,
  p_quantity_cartons int,
  p_cost_per_carton numeric,
  p_supplier_name text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_purchase_id uuid;
  v_pur_ref text;
begin
  -- 1. Determine caller from auth context
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Unauthorized: Authentication required.';
  end if;

  -- 2. Verify caller role internally
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role not in ('manager', 'warehouse') then
    raise exception 'Forbidden: Insufficient privileges to record purchase.';
  end if;

  -- 3. Validate inputs
  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'Product not found.';
  end if;

  if p_quantity_cartons is null or p_quantity_cartons <= 0 then
    raise exception 'Quantity cartons must be greater than zero.';
  end if;

  if p_cost_per_carton is null or p_cost_per_carton < 0 then
    raise exception 'Cost per carton cannot be negative.';
  end if;

  -- 4. Generate reference number
  v_pur_ref := concat('PUR-', to_char(now(), 'YYMMDD-'), lpad(floor(random() * 10000)::text, 4, '0'));

  -- 5. Insert purchase record
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
    p_supplier_name,
    v_caller_id
  ) returning id into v_purchase_id;

  -- 6. Insert inventory Stock In transaction (positive quantity)
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

-- 12.3 record_customer_payment (Manager ONLY)
create or replace function public.record_customer_payment(
  p_customer_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_notes text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_caller_id uuid;
  v_caller_role text;
  v_payment_id uuid;
  v_pay_ref text;
  v_current_balance numeric;
begin
  -- 1. Determine caller from auth context
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Unauthorized: Authentication required.';
  end if;

  -- 2. Verify caller role internally (MANAGER ONLY)
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role != 'manager' then
    raise exception 'Forbidden: Only managers can record standalone customer payments.';
  end if;

  -- 3. Validate inputs
  if not exists (select 1 from public.customers where id = p_customer_id) then
    raise exception 'Customer not found.';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero.';
  end if;

  -- 4. Generate reference number
  v_pay_ref := concat('PAY-', to_char(now(), 'YYMMDD-'), lpad(floor(random() * 10000)::text, 4, '0'));

  -- 5. Insert payment credit row into ledger_transactions (negative amount)
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

  -- Calculate remaining balance
  select coalesce(sum(amount), 0) into v_current_balance
  from public.ledger_transactions
  where customer_id = p_customer_id;

  return jsonb_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'reference', v_pay_ref,
    'amount', p_amount,
    'remaining_balance', v_current_balance
  );
end;
$$;
