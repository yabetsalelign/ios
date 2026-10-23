-- Phase 1 Concurrency Fixes
-- Fixes CRIT-1: record_sale — FOR SHARE → FOR UPDATE on products row + ORDER BY prod_id
-- Fixes CRIT-2: record_customer_payment — lock customers row FOR UPDATE before balance check
--
-- Analysis of whether record_sale also needs customer-row locking (step 3):
--   record_sale inserts a Sale debit (+total_amount) and optionally a Payment credit
--   (-amount_paid). Since amount_paid <= total_amount is enforced (step 7), the net
--   ledger effect of any sale is always >= 0. A sale can only increase or maintain a
--   customer's outstanding balance — it can never drive the balance negative.
--   Therefore record_sale does NOT need to lock the customers row.
--   Only record_customer_payment can decrease the balance, and serializing those
--   operations via FOR UPDATE on the customers row is sufficient to prevent
--   overpayment.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. record_sale — fix stock race condition (CRIT-1)
--    Changes vs 20261001000000_backend_security_hardening.sql lines 434-646:
--      • Step 8 loop query: added ORDER BY prod_id (deadlock prevention)
--      • Step 8 product lock: FOR SHARE → FOR UPDATE (serialize per product)
-- ────────────────────────────────────────────────────────────────────────────
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
  -- ORDER BY prod_id ensures consistent lock acquisition order to prevent deadlocks
  for r in (
    select
      (item->>'product_id')::uuid as prod_id,
      sum((item->>'quantity_cartons')::int)::int as total_qty
    from jsonb_array_elements(p_items) as item
    group by (item->>'product_id')::uuid
    order by prod_id                              -- ← ADDED: deadlock prevention
  ) loop
    select name into v_prod_name
    from public.products
    where id = r.prod_id
    for update;                                   -- ← CHANGED: was FOR SHARE

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

-- ────────────────────────────────────────────────────────────────────────────
-- 2. record_customer_payment — fix balance race condition (CRIT-2)
--    Changes vs 20261001000000_backend_security_hardening.sql lines 759-852:
--      • Step 6: added PERFORM … FOR UPDATE on customers row before balance query
--      • Comment updated to reflect actual locking behavior
-- ────────────────────────────────────────────────────────────────────────────
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

  -- 6. Lock customer row to serialize concurrent payments, then calculate balance
  -- The exclusive row lock on customers prevents concurrent record_customer_payment
  -- calls for the same customer from reading a stale balance.
  perform 1 from public.customers
  where id = p_customer_id
  for update;                                     -- ← ADDED: serialize per customer

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
