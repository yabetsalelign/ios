-- ==============================================================================
-- StockFlow — Phase 4B Seed Data
-- Creates default auth users, profiles, products, customers, and transactions
-- Default Accounts:
--   Manager: manager@stockflow.app / manager123
--   Warehouse: warehouse@stockflow.app / warehouse123
-- ==============================================================================

-- 1. Create auth users (if using local Supabase CLI or pg_crypto)
-- Note: In Supabase cloud dashboard, users can also be created via Auth UI.
DO $$
DECLARE
  v_manager_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  v_warehouse_id uuid := 'a0000000-0000-0000-0000-000000000002'::uuid;
  v_prod1_id uuid := 'b0000000-0000-0000-0000-000000000001'::uuid;
  v_prod2_id uuid := 'b0000000-0000-0000-0000-000000000002'::uuid;
  v_prod3_id uuid := 'b0000000-0000-0000-0000-000000000003'::uuid;
  v_cust1_id uuid := 'c0000000-0000-0000-0000-000000000001'::uuid;
  v_cust2_id uuid := 'c0000000-0000-0000-0000-000000000002'::uuid;
  v_cust3_id uuid := 'c0000000-0000-0000-0000-000000000003'::uuid;
BEGIN
  -- Insert Auth users into auth.users (when executing with Postgres superuser / local CLI)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES
    (
      v_manager_id,
      '00000000-0000-0000-0000-000000000000',
      'manager@stockflow.app',
      crypt('manager123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Alex Morgan","role":"manager"}',
      now(), now(), 'authenticated', 'authenticated'
    ),
    (
      v_warehouse_id,
      '00000000-0000-0000-0000-000000000000',
      'warehouse@stockflow.app',
      crypt('warehouse123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Dawit Haile","role":"warehouse"}',
      now(), now(), 'authenticated', 'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Profiles (1-to-1 with auth users)
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES
  (
    v_manager_id,
    'Alex Morgan',
    'manager',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80'
  ),
  (
    v_warehouse_id,
    'Dawit Haile',
    'warehouse',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url;

  -- 3. Products
  INSERT INTO public.products (id, name, sku, category, image_url, pieces_per_carton, selling_price_per_carton, cost_per_carton, low_stock_threshold_cartons, created_by)
  VALUES
  (
    v_prod1_id,
    'White Cooking Oil 5L',
    'OIL-5L-WHT',
    'Cooking Oils',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60',
    4,
    3200.00,
    2800.00,
    15,
    v_manager_id
  ),
  (
    v_prod2_id,
    'Tomato Paste 800g',
    'TOM-800G-PST',
    'Canned Foods',
    'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=60',
    12,
    1450.00,
    1150.00,
    20,
    v_manager_id
  ),
  (
    v_prod3_id,
    'Wheat Flour 25kg',
    'FLR-25KG-WHT',
    'Grains & Flour',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    1,
    2100.00,
    1850.00,
    10,
    v_manager_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- 4. Initial Inventory Transactions (to seed stock)
  INSERT INTO public.inventory_transactions (id, reference_number, product_id, type, quantity_cartons, created_by)
  VALUES
  ('d0000000-0000-0000-0000-000000000001'::uuid, 'INIT-STOCK-01', v_prod1_id, 'purchase', 85, v_manager_id),
  ('d0000000-0000-0000-0000-000000000002'::uuid, 'INIT-STOCK-02', v_prod2_id, 'purchase', 120, v_manager_id),
  ('d0000000-0000-0000-0000-000000000003'::uuid, 'INIT-STOCK-03', v_prod3_id, 'purchase', 60, v_manager_id)
  ON CONFLICT (id) DO NOTHING;

  -- 5. Customers
  INSERT INTO public.customers (id, name, phone, address, notes)
  VALUES
  (
    v_cust1_id,
    'Merkato Supermarket',
    '+251 91 123 4567',
    'Merkato, Addis Ababa',
    'High-volume wholesale buyer. Weekly credit term.'
  ),
  (
    v_cust2_id,
    'Bole Mini Market',
    '+251 92 234 5678',
    'Bole Medhanialem, Addis Ababa',
    'Retail store. Reliable payer.'
  ),
  (
    v_cust3_id,
    'Piazza Corner Grocery',
    '+251 93 345 6789',
    'Piazza, Addis Ababa',
    'Established partner.'
  )
  ON CONFLICT (id) DO NOTHING;

END $$;
