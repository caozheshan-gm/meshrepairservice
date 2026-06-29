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
  max(rr.repair_date) as latest_repair_date,
  coalesce(
    string_agg(distinct rr.customer_repair_batch_no, ' | ')
      filter (where nullif(btrim(rr.customer_repair_batch_no), '') is not null),
    ''
  ) as repair_batch_numbers
from public.products p
left join public.customers c on c.id = p.customer_id
left join public.repair_records rr on rr.product_id = p.id
group by p.id, c.company_name;

alter view public.admin_product_list set (security_invoker = true);
