-- ==============================================================================
-- StockFlow — Product Foundation: barcode, description, Storage bucket
-- ==============================================================================

-- ─────────────────────────────────────────────
-- 1. Add missing columns to products
-- ─────────────────────────────────────────────

-- Barcode: optional, unique when present (NULL values are excluded by partial index)
alter table public.products
  add column if not exists barcode text,
  add column if not exists description text;

-- Partial unique index: enforces uniqueness only for non-null, non-empty barcodes
create unique index if not exists products_barcode_unique
  on public.products (barcode)
  where barcode is not null and barcode <> '';

-- ─────────────────────────────────────────────
-- 2. Supabase Storage — product-images bucket
-- ─────────────────────────────────────────────
-- Create the bucket (idempotent via on conflict)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'product-images',
    'product-images',
    true,
    5242880,   -- 5 MB per image
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  on conflict (id) do update set
    public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Ensure idempotent policy creation
drop policy if exists "product_images_insert_manager" on storage.objects;
drop policy if exists "product_images_update_manager" on storage.objects;
drop policy if exists "product_images_select_auth" on storage.objects;
drop policy if exists "product_images_delete_manager" on storage.objects;

-- Managers can upload new product images
create policy "product_images_insert_manager"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- Managers can replace/update product images
create policy "product_images_update_manager"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );

-- All authenticated users can view product images
create policy "product_images_select_auth"
  on storage.objects for select
  using (
    bucket_id = 'product-images'
    and auth.uid() is not null
  );

-- Managers can delete product images
create policy "product_images_delete_manager"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'manager'
    )
  );
