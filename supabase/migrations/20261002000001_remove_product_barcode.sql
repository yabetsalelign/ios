-- Remove the unused optional product barcode feature.
drop index if exists public.products_barcode_unique;
alter table public.products drop column if exists barcode;