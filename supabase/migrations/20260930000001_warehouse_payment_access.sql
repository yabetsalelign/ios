-- Migration: Allow warehouse role to record customer payments
-- Previously: record_customer_payment was manager-only
-- Now: both 'manager' and 'warehouse' roles are permitted

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

  -- 2. Verify caller role internally (MANAGER or WAREHOUSE)
  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role not in ('manager', 'warehouse') then
    raise exception 'Forbidden: Only managers and warehouse staff can record customer payments.';
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
  );

  -- 6. Compute updated balance
  select coalesce(sum(amount), 0) into v_current_balance
  from public.ledger_transactions
  where customer_id = p_customer_id;

  return jsonb_build_object(
    'success', true,
    'reference', v_pay_ref,
    'amount', p_amount,
    'remaining_balance', v_current_balance
  );
end;
$$;
