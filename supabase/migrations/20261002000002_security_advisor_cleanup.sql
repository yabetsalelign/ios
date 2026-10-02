-- Restrict SECURITY DEFINER RPC execution to the roles that need it.
revoke execute on function public.handle_new_user()
  from PUBLIC, anon, authenticated;

revoke execute on function public.record_customer_payment(uuid, numeric, text, text)
  from PUBLIC, anon;
grant execute on function public.record_customer_payment(uuid, numeric, text, text)
  to authenticated;

revoke execute on function public.record_purchase(uuid, integer, numeric, text)
  from PUBLIC, anon;
grant execute on function public.record_purchase(uuid, integer, numeric, text)
  to authenticated;

revoke execute on function public.record_sale(uuid, jsonb, numeric, text, text)
  from PUBLIC, anon;
grant execute on function public.record_sale(uuid, jsonb, numeric, text, text)
  to authenticated;

revoke execute on function public.set_my_avatar_url(text)
  from PUBLIC, anon;
grant execute on function public.set_my_avatar_url(text)
  to authenticated;

-- These advisor-named policies are not in the tracked migrations. If present
-- in the linked schema, wrap only their direct auth.uid() calls; policy roles,
-- commands, and all other predicates remain unchanged.
do $$
declare
  profile_policy record;
  optimized_qual text;
  optimized_with_check text;
begin
  for profile_policy in
    select policyname, qual, with_check
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname in (
        'Users can update own profile',
        'Users can view own profile'
      )
  loop
    optimized_qual := replace(profile_policy.qual, 'auth.uid()', '(select auth.uid())');
    optimized_with_check := replace(profile_policy.with_check, 'auth.uid()', '(select auth.uid())');

    if profile_policy.qual is not null
      and optimized_qual is distinct from profile_policy.qual then
      execute format(
        'alter policy %I on public.profiles using (%s)',
        profile_policy.policyname,
        optimized_qual
      );
    end if;

    if profile_policy.with_check is not null
      and optimized_with_check is distinct from profile_policy.with_check then
      execute format(
        'alter policy %I on public.profiles with check (%s)',
        profile_policy.policyname,
        optimized_with_check
      );
    end if;
  end loop;
end;
$$;

-- Fail the migration if the intended RPC grants were not applied.
do $$
begin
  if has_function_privilege('anon', 'public.handle_new_user()', 'execute')
    or has_function_privilege('authenticated', 'public.handle_new_user()', 'execute') then
    raise exception 'handle_new_user must not be directly executable by anon or authenticated';
  end if;

  if has_function_privilege('anon', 'public.record_customer_payment(uuid,numeric,text,text)', 'execute')
    or not has_function_privilege('authenticated', 'public.record_customer_payment(uuid,numeric,text,text)', 'execute') then
    raise exception 'Unexpected record_customer_payment execution grants';
  end if;

  if has_function_privilege('anon', 'public.record_purchase(uuid,integer,numeric,text)', 'execute')
    or not has_function_privilege('authenticated', 'public.record_purchase(uuid,integer,numeric,text)', 'execute') then
    raise exception 'Unexpected record_purchase execution grants';
  end if;

  if has_function_privilege('anon', 'public.record_sale(uuid,jsonb,numeric,text,text)', 'execute')
    or not has_function_privilege('authenticated', 'public.record_sale(uuid,jsonb,numeric,text,text)', 'execute') then
    raise exception 'Unexpected record_sale execution grants';
  end if;

  if has_function_privilege('anon', 'public.set_my_avatar_url(text)', 'execute')
    or not has_function_privilege('authenticated', 'public.set_my_avatar_url(text)', 'execute') then
    raise exception 'Unexpected set_my_avatar_url execution grants';
  end if;
end;
$$;