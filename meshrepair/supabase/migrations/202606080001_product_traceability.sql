create extension if not exists "pgcrypto";

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.serial_counters (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('OWN', 'REP')),
  year int not null,
  month int not null check (month between 1 and 12),
  next_number int not null default 1,
  unique (source, year, month)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  serial_number text unique not null,
  product_source text not null check (product_source in ('own', 'customer')),
  public_slug text unique not null,
  qr_url text not null,
  status text not null default 'active',
  customer_id uuid references public.customers(id) on delete set null,
  product_type text,
  nameplate_text text,
  production_date date,
  production_model text,
  production_batch text,
  material text,
  size text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.repair_records (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  repair_number int not null,
  repair_date date not null,
  status text not null default 'completed',
  factory text,
  internal_code text,
  nameplate_code text,
  summary_zh text,
  summary_en text,
  public_notes_en text,
  internal_notes_zh text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, repair_number)
);

create table public.repair_tasks (
  id uuid primary key default gen_random_uuid(),
  repair_record_id uuid not null references public.repair_records(id) on delete cascade,
  sort_order int not null default 0,
  process_type text,
  process_name_zh text,
  process_name_en text,
  description_zh text,
  description_en text,
  action_zh text,
  action_en text,
  quantity text,
  equipment_zh text,
  equipment_en text,
  responsible_person_zh text,
  responsible_person_en text,
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.repair_images (
  id uuid primary key default gen_random_uuid(),
  repair_record_id uuid not null references public.repair_records(id) on delete cascade,
  image_type text not null check (image_type in ('before', 'after', 'other')),
  storage_path text not null,
  caption_zh text,
  caption_en text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index products_serial_number_idx on public.products (serial_number);
create index products_customer_id_idx on public.products (customer_id);
create index repair_records_product_id_idx on public.repair_records (product_id);
create index repair_tasks_repair_record_id_idx on public.repair_tasks (repair_record_id);
create index repair_images_repair_record_id_idx on public.repair_images (repair_record_id);

alter table public.admin_users enable row level security;
alter table public.customers enable row level security;
alter table public.serial_counters enable row level security;
alter table public.products enable row level security;
alter table public.repair_records enable row level security;
alter table public.repair_tasks enable row level security;
alter table public.repair_images enable row level security;

create policy "Admins can read own admin row"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can manage customers"
on public.customers
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can manage serial counters"
on public.serial_counters
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (status = 'active');

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Public can read completed repair records"
on public.repair_records
for select
to anon, authenticated
using (status = 'completed');

create policy "Admins can manage repair records"
on public.repair_records
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Public can read repair tasks for completed records"
on public.repair_tasks
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.repair_records
    where repair_records.id = repair_tasks.repair_record_id
      and repair_records.status = 'completed'
  )
);

create policy "Admins can manage repair tasks"
on public.repair_tasks
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Public can read repair images for completed records"
on public.repair_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.repair_records
    where repair_records.id = repair_images.repair_record_id
      and repair_records.status = 'completed'
  )
);

create policy "Admins can manage repair images"
on public.repair_images
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
