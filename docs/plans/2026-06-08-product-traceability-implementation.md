# Product Traceability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a QR/serial-number product traceability system with public repair history pages and a Chinese admin CRUD backend.

**Architecture:** Use Supabase Postgres as the source of truth, Supabase Auth for admin login, Supabase Storage for repair images, and Next.js App Router for public and admin pages. Public pages read only published traceability data by exact serial number, while admin pages use server-side Supabase clients and RLS-backed permissions.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase Auth, Supabase Postgres, Supabase Storage, `@supabase/ssr`, Tailwind, existing shadcn-style UI components.

---

## Current Context

Project root:

```text
/Users/czss/gitwork/meshrepairservice
```

Next.js app:

```text
/Users/czss/gitwork/meshrepairservice/meshrepair
```

Design doc:

```text
docs/plans/2026-06-08-product-traceability-design.md
```

Existing useful files:

- `meshrepair/lib/supabase/client.ts`
- `meshrepair/lib/supabase/server.ts`
- `meshrepair/lib/supabase/proxy.ts`
- `meshrepair/proxy.ts`
- `meshrepair/app/auth/login/page.tsx`
- `meshrepair/app/protected/layout.tsx`
- `meshrepair/components/ui/button.tsx`
- `meshrepair/components/ui/input.tsx`
- `meshrepair/components/ui/card.tsx`
- `meshrepair/components/ui/badge.tsx`
- `meshrepair/components/ui/label.tsx`

Run checks from:

```bash
cd /Users/czss/gitwork/meshrepairservice/meshrepair
npm run lint
npm run build
```

## Task 1: Database Schema And RLS

**Files:**

- Create: `meshrepair/supabase/migrations/202606080001_product_traceability.sql`
- Create or verify through Supabase MCP using `apply_migration`

**Step 1: Create migration file**

Create the migration with tables:

```sql
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
```

Add helper function:

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;
```

Add serial function:

```sql
create or replace function public.generate_serial_number(product_source_input text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  prefix text;
  current_year int;
  current_month int;
  sequence_number int;
begin
  if product_source_input = 'own' then
    prefix := 'OWN';
  elsif product_source_input = 'customer' then
    prefix := 'REP';
  else
    raise exception 'Invalid product source: %', product_source_input;
  end if;

  current_year := extract(year from now())::int;
  current_month := extract(month from now())::int;

  insert into public.serial_counters (source, year, month, next_number)
  values (prefix, current_year, current_month, 2)
  on conflict (source, year, month)
  do update set next_number = public.serial_counters.next_number + 1
  returning next_number - 1 into sequence_number;

  return format('%s-%s-%s-%s', prefix, current_year, lpad(current_month::text, 2, '0'), lpad(sequence_number::text, 6, '0'));
end;
$$;
```

Enable RLS and policies:

```sql
alter table public.admin_users enable row level security;
alter table public.customers enable row level security;
alter table public.serial_counters enable row level security;
alter table public.products enable row level security;
alter table public.repair_records enable row level security;
alter table public.repair_tasks enable row level security;
alter table public.repair_images enable row level security;

create policy "Admins can manage admin users" on public.admin_users
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage customers" on public.customers
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage serial counters" on public.serial_counters
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read active products" on public.products
for select to anon, authenticated using (status = 'active');

create policy "Admins can manage products" on public.products
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read completed repair records" on public.repair_records
for select to anon, authenticated using (status = 'completed');

create policy "Admins can manage repair records" on public.repair_records
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read repair tasks" on public.repair_tasks
for select to anon, authenticated using (
  exists (
    select 1 from public.repair_records rr
    where rr.id = repair_record_id and rr.status = 'completed'
  )
);

create policy "Admins can manage repair tasks" on public.repair_tasks
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public can read repair images" on public.repair_images
for select to anon, authenticated using (
  exists (
    select 1 from public.repair_records rr
    where rr.id = repair_record_id and rr.status = 'completed'
  )
);

create policy "Admins can manage repair images" on public.repair_images
for all to authenticated using (public.is_admin()) with check (public.is_admin());
```

**Step 2: Apply migration**

Use Supabase MCP:

```text
apply_migration(name: "product_traceability", query: migration_sql)
```

**Step 3: Verify schema**

Use Supabase MCP:

```text
list_tables(schemas: ["public"], verbose: true)
get_advisors(type: "security")
```

Expected:

- All six business tables exist.
- RLS is enabled.
- No missing-RLS warnings for these tables.

**Step 4: Commit**

```bash
git add meshrepair/supabase/migrations/202606080001_product_traceability.sql
git commit -m "feat: add traceability database schema"
```

## Task 2: Admin Bootstrap

**Files:**

- Create: `meshrepair/lib/auth/admin.ts`
- Modify: database via Supabase MCP to insert current admin user.

**Step 1: Add admin helper**

Create:

```ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    redirect("/auth/error?message=Not%20authorized");
  }

  return { supabase, user };
}
```

**Step 2: Insert current admin user**

Use Supabase MCP `execute_sql`:

```sql
insert into public.admin_users (user_id, role)
values ('357d8df1-7acc-4970-a4de-83ac8aab1225', 'admin')
on conflict (user_id) do nothing;
```

**Step 3: Create admin home page**

Create:

```text
meshrepair/app/admin/page.tsx
```

It should call `requireAdmin()` and render links to products.

**Step 4: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

**Step 5: Commit**

```bash
git add meshrepair/lib/auth/admin.ts meshrepair/app/admin/page.tsx
git commit -m "feat: add admin gate"
```

## Task 3: TypeScript Database Types

**Files:**

- Create: `meshrepair/lib/database.types.ts`
- Modify: `meshrepair/lib/supabase/client.ts`
- Modify: `meshrepair/lib/supabase/server.ts`

**Step 1: Generate types**

Use Supabase MCP:

```text
generate_typescript_types()
```

Save the output as:

```text
meshrepair/lib/database.types.ts
```

**Step 2: Type Supabase clients**

Update `client.ts` and `server.ts` to pass the generated `Database` type:

```ts
import type { Database } from "@/lib/database.types";
```

Use:

```ts
createBrowserClient<Database>(...)
createServerClient<Database>(...)
```

**Step 3: Verify**

```bash
npm run lint
npm run build
```

**Step 4: Commit**

```bash
git add meshrepair/lib/database.types.ts meshrepair/lib/supabase/client.ts meshrepair/lib/supabase/server.ts
git commit -m "chore: add typed supabase clients"
```

## Task 4: Product Creation

**Files:**

- Create: `meshrepair/app/admin/products/page.tsx`
- Create: `meshrepair/app/admin/products/new/page.tsx`
- Create: `meshrepair/app/admin/products/actions.ts`
- Create: `meshrepair/lib/serials.ts`

**Step 1: Add serial helper**

Create a server helper that calls:

```ts
const { data, error } = await supabase.rpc("generate_serial_number", {
  product_source_input: productSource,
});
```

Build QR URL from:

```ts
const qrUrl = `${origin}/t/${serialNumber}`;
```

Use `headers()` to read host/protocol in server actions, or fallback to `NEXT_PUBLIC_SITE_URL`.

**Step 2: Add product creation action**

Server action input fields:

- product source.
- customer company.
- product type.
- production date/model/batch for own products.
- material.
- size.
- nameplate text.
- internal notes.

The action should:

1. Require admin.
2. Create or reuse customer if customer company is provided.
3. Generate serial.
4. Insert product.
5. Redirect to `/admin/products/[id]`.

**Step 3: Add new product page**

Use Chinese labels:

- 产品来源.
- 客户送修.
- 本厂生产.
- 客户公司.
- 产品类型.
- 生产日期.
- 生产型号.
- 材质.
- 尺寸.
- 铭牌文字.
- 内部备注.

**Step 4: Add product list page**

Query admin-visible products with customer company and repair count. Start with server-rendered filtering by `searchParams`.

**Step 5: Verify**

```bash
npm run lint
npm run build
```

Manually test:

```bash
npm run dev
```

Create one `REP` product and one `OWN` product. Confirm serial formats.

**Step 6: Commit**

```bash
git add meshrepair/app/admin/products meshrepair/lib/serials.ts
git commit -m "feat: add admin product creation"
```

## Task 5: Product Detail And QR Display

**Files:**

- Create: `meshrepair/app/admin/products/[id]/page.tsx`
- Create: `meshrepair/app/admin/products/[id]/edit/page.tsx`
- Modify: `meshrepair/app/admin/products/actions.ts`
- Install: `qrcode.react` or use a server-generated SVG helper.

**Step 1: Install QR dependency**

```bash
npm install qrcode.react
```

**Step 2: Show product detail**

Render:

- Serial number.
- QR code.
- QR URL.
- Copyable nameplate information.
- Product fields.
- Customer company for admin.
- Repair records list.

**Step 3: Add edit page and action**

Allow editing all non-serial fields. Keep `serial_number` immutable.

**Step 4: Verify**

```bash
npm run lint
npm run build
```

**Step 5: Commit**

```bash
git add meshrepair/package.json meshrepair/package-lock.json meshrepair/app/admin/products
git commit -m "feat: add product detail and QR display"
```

## Task 6: Repair Record CRUD

**Files:**

- Create: `meshrepair/app/admin/products/[id]/repairs/new/page.tsx`
- Create: `meshrepair/app/admin/products/[id]/repairs/[repairId]/edit/page.tsx`
- Create: `meshrepair/app/admin/products/[id]/repairs/actions.ts`
- Create: `meshrepair/components/admin/repair-task-editor.tsx`

**Step 1: Create repair record action**

The action should:

1. Require admin.
2. Find next `repair_number` for the product.
3. Insert `repair_records`.
4. Insert multiple `repair_tasks`.
5. Redirect to the product detail page.

**Step 2: Add flexible repair task editor**

A client component should allow:

- Add task.
- Remove task.
- Reorder through sort numbers for MVP.
- Edit Chinese and English fields.

Fields:

- 工序.
- 问题描述.
- 处理办法.
- 数量.
- 设备.
- 责任人.
- 结果.

**Step 3: Add edit action**

For MVP, replace all existing tasks for the repair record on save:

1. Update repair record.
2. Delete existing tasks.
3. Insert submitted tasks.

**Step 4: Verify**

```bash
npm run lint
npm run build
```

Manual test:

- Create a product.
- Add repair record with two tasks.
- Edit the repair record.

**Step 5: Commit**

```bash
git add meshrepair/app/admin/products/[id]/repairs meshrepair/components/admin/repair-task-editor.tsx
git commit -m "feat: add repair record management"
```

## Task 7: Repair Image Upload

**Files:**

- Modify migration or create: `meshrepair/supabase/migrations/202606080002_repair_images_bucket.sql`
- Create: `meshrepair/components/admin/repair-image-uploader.tsx`
- Modify: repair edit/new pages and actions.

**Step 1: Create Storage bucket**

Use Supabase MCP or SQL:

```sql
insert into storage.buckets (id, name, public)
values ('repair-images', 'repair-images', true)
on conflict (id) do nothing;
```

Add storage policies:

```sql
create policy "Public can read repair images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'repair-images');

create policy "Admins can upload repair images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'repair-images' and public.is_admin());

create policy "Admins can update repair images"
on storage.objects for update
to authenticated
using (bucket_id = 'repair-images' and public.is_admin())
with check (bucket_id = 'repair-images' and public.is_admin());

create policy "Admins can delete repair images"
on storage.objects for delete
to authenticated
using (bucket_id = 'repair-images' and public.is_admin());
```

**Step 2: Add upload UI**

Support:

- Before images.
- After images.
- Other images.
- Caption fields.

Use browser Supabase client for upload after admin page load, or route through server actions. Prefer server actions if implementation time allows; otherwise use client upload protected by Storage RLS.

**Step 3: Save image metadata**

Insert rows into `repair_images` with `storage_path`, `image_type`, caption, and order.

**Step 4: Verify**

Manual test:

- Upload before and after images.
- Open the public image URL.
- Delete image metadata and storage object.

Run:

```bash
npm run lint
npm run build
```

**Step 5: Commit**

```bash
git add meshrepair/supabase/migrations meshrepair/components/admin/repair-image-uploader.tsx meshrepair/app/admin/products
git commit -m "feat: add repair image uploads"
```

## Task 8: Public Traceability Pages

**Files:**

- Create: `meshrepair/app/t/[serial]/page.tsx`
- Create: `meshrepair/app/t/[serial]/repairs/[repairId]/page.tsx`
- Create: `meshrepair/app/search/page.tsx`
- Create: `meshrepair/app/search/actions.ts`
- Create: `meshrepair/lib/public-data.ts`

**Step 1: Add public data helpers**

Functions:

- `getPublicProductBySerial(serial: string)`.
- `getPublicRepairRecord(serial: string, repairId: string)`.

Ensure these helpers only select public fields. Do not select:

- `customers.contact_email`.
- `customers.contact_phone`.
- `products.internal_notes`.
- `repair_records.internal_notes_zh`.

**Step 2: Build `/t/[serial]`**

English UI:

- Serial Number.
- Product Source.
- Production Information, only for `own`.
- Repair History.
- Repair count.

List repairs by newest first by default. Add links to repair detail pages.

**Step 3: Build repair detail page**

English UI:

- Repair date.
- Repair number.
- Summary.
- Repair tasks.
- Person responsible.
- Before repair images.
- After repair images.

Use English fields when present. Fallback to generic English labels if missing.

**Step 4: Build exact search**

Input serial number. On submit, redirect to `/t/[serial]`. If not found, show a not-found message.

**Step 5: Verify**

Manual test:

- Open `/t/[serial]` while logged out.
- Open a repair detail while logged out.
- Try a fake serial.

Run:

```bash
npm run lint
npm run build
```

**Step 6: Commit**

```bash
git add meshrepair/app/t meshrepair/app/search meshrepair/lib/public-data.ts
git commit -m "feat: add public traceability pages"
```

## Task 9: Admin List Filtering

**Files:**

- Modify: `meshrepair/app/admin/products/page.tsx`
- Create: `meshrepair/components/admin/product-filters.tsx`

**Step 1: Add filters**

Filters:

- Serial number.
- Product source.
- Customer company.
- Created month.
- Status.

Use URL query params so filters are shareable.

**Step 2: Add repair count and recent repair date**

Use a SQL view or server-side aggregation. Prefer a view if query complexity grows:

```sql
create view public.product_admin_summary as
select
  p.id,
  p.serial_number,
  p.product_source,
  p.status,
  p.created_at,
  c.company_name,
  count(rr.id) as repair_count,
  max(rr.repair_date) as latest_repair_date
from public.products p
left join public.customers c on c.id = p.customer_id
left join public.repair_records rr on rr.product_id = p.id
group by p.id, c.company_name;
```

If using a view, add RLS-safe access by querying underlying tables as admin or using a security invoker view.

**Step 3: Verify**

Manual test filters with seeded data.

Run:

```bash
npm run lint
npm run build
```

**Step 4: Commit**

```bash
git add meshrepair/app/admin/products meshrepair/components/admin/product-filters.tsx
git commit -m "feat: add admin product filters"
```

## Task 10: Cleanup Template Pages

**Files:**

- Modify: `meshrepair/app/page.tsx`
- Remove or keep but unlink: `meshrepair/app/protected/*`
- Modify auth navigation components as needed.

**Step 1: Replace template homepage**

Make homepage a simple public entry:

- Service identity.
- Serial search.
- Admin login link.

Avoid marketing-heavy layout; this is an operational traceability website.

**Step 2: Remove confusing template tutorial content**

Delete or stop linking template tutorial components if unused.

**Step 3: Verify**

```bash
npm run lint
npm run build
```

**Step 4: Commit**

```bash
git add meshrepair/app meshrepair/components
git commit -m "chore: replace template content"
```

## Task 11: End-To-End Verification

**Files:**

- No required code changes unless bugs are found.

**Step 1: Full admin flow**

Run:

```bash
npm run dev
```

Verify:

- Admin can log in.
- Admin can create `REP` product.
- Admin can create `OWN` product.
- Serial numbers match format.
- QR URL points to `/t/[serial]`.
- Admin can add a repair record with tasks.
- Admin can upload before and after images.

**Step 2: Full public flow**

Log out or use private browser.

Verify:

- Exact serial search works.
- `/t/[serial]` loads without login.
- Repair list does not show customer company.
- Repair list does not show responsible person.
- Repair detail shows responsible person.
- Repair images load.
- Fake serial shows a clear not-found state.

**Step 3: Security checks**

Use Supabase MCP:

```text
get_advisors(type: "security")
get_advisors(type: "performance")
```

Expected:

- No missing RLS on business tables.
- No unintended public writable policies.

**Step 4: Final checks**

```bash
npm run lint
npm run build
git status --short
```

**Step 5: Commit fixes**

If verification fixes were needed:

```bash
git add <changed-files>
git commit -m "fix: complete traceability flow verification"
```

