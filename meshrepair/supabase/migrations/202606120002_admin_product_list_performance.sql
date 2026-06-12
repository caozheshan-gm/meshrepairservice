create extension if not exists pg_trgm;

create or replace view public.admin_product_list as
select
  p.id,
  p.serial_number,
  upper(regexp_replace(p.serial_number, '[-[:space:]]', '', 'g')) as serial_number_normalized,
  p.product_source,
  p.status,
  p.product_type,
  p.created_at,
  p.customer_id,
  c.company_name as customer_company,
  p.material,
  p.size,
  p.production_date,
  p.production_model,
  p.production_batch,
  count(rr.id)::integer as repair_count,
  max(rr.repair_date) as latest_repair_date
from public.products p
left join public.customers c on c.id = p.customer_id
left join public.repair_records rr on rr.product_id = p.id
group by p.id, c.company_name;

create index if not exists products_serial_number_normalized_trgm_idx
  on public.products
  using gin ((upper(regexp_replace(serial_number, '[-[:space:]]', '', 'g'))) gin_trgm_ops);

create index if not exists products_admin_filter_idx
  on public.products (product_source, status, created_at desc);

create index if not exists products_admin_own_filter_idx
  on public.products (product_type, material, size, production_date, production_model, production_batch);

create index if not exists repair_records_product_stats_idx
  on public.repair_records (product_id, repair_date desc);
