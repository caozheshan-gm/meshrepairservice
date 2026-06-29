create index if not exists repair_records_customer_batch_trgm_idx
on public.repair_records
using gin (customer_repair_batch_no extensions.gin_trgm_ops)
where customer_repair_batch_no is not null;

create or replace function public.search_admin_product_list_by_repair_batch(
  repair_batch_search text
)
returns setof public.admin_product_list
language sql
stable
security invoker
set search_path = ''
as $$
  select product_list.*
  from public.admin_product_list as product_list
  where exists (
    select 1
    from public.repair_records as repair
    where repair.product_id = product_list.id
      and repair.customer_repair_batch_no ilike
        ('%' || repair_batch_search || '%')
  );
$$;

revoke all on function public.search_admin_product_list_by_repair_batch(text) from public;
revoke all on function public.search_admin_product_list_by_repair_batch(text) from anon;
grant execute on function public.search_admin_product_list_by_repair_batch(text) to authenticated;
