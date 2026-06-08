# Product Traceability and Repair Records Design

## Background

The company repairs titanium wire and stainless-steel mesh products. Some products are manufactured by the company, while others are customer-supplied products purchased elsewhere and repaired by the company.

Each product needs a unique serial number and QR code on a nameplate. Customers scan the QR code, or manually enter the serial number, to view that product's repair history. A single product may be repaired multiple times, so the public page should show a repair record list and allow users to open each repair detail.

The existing Excel repair card is a reference for the kind of information captured during one repair, but the new system should not depend on Excel. Future records will be entered directly in the web admin UI.

## Goals

- Generate a unique serial number and QR URL for each product.
- Support two product sources:
  - `OWN`: company-manufactured product.
  - `REP`: customer-supplied product repaired by the company.
- Let customers view a public traceability page by QR code or exact serial number.
- Let customers view a product's repair history and individual repair details.
- Let administrators create products, generate nameplate information, and manage repair records.
- Let administrators upload before-repair and after-repair images.
- Keep customer company information and internal notes visible only to administrators.

## Non-Goals For MVP

- No customer login.
- No Excel import.
- No Excel-like page rendering.
- No payment flow.
- No automatic translation.
- No complex multi-role permission system beyond admin/non-admin.

## Serial Number Format

Serial numbers include product source, year, month, and a monthly sequence:

```text
OWN-2026-06-000001
REP-2026-06-000001
```

Rules:

- `OWN` means company-manufactured.
- `REP` means customer-supplied and repaired.
- The year and month come from the product creation date.
- The numeric sequence resets per source and month.
- The serial number must be globally unique.

The public QR code URL should be short:

```text
/t/[serial]
```

Example:

```text
/t/REP-2026-06-000001
```

## Language Strategy

The public customer-facing site should be English-first because customers are overseas.

The admin interface should be Chinese-first because internal users are Chinese-speaking.

Repair data should support both internal Chinese fields and optional public English fields where useful. The MVP can require Chinese internal fields and allow optional English public summaries. If English details are missing, the public page can show a simple generic English fallback.

## Public Pages

### `/t/[serial]`

Public product traceability page.

Shows:

- Serial number.
- Product source.
- Production information summary for company-manufactured products.
- Total repair count.
- Repair record list.

Repair list items show:

- Repair date.
- Repair number, such as `Repair #1`.
- Public summary.
- Status.

Repair list items should not show:

- Customer company.
- Contact information.
- Internal notes.
- Internal code.
- Responsible employee.

### `/t/[serial]/repairs/[repairId]`

Public repair detail page.

Shows one repair record:

- Repair date.
- Repair number.
- Public summary.
- Repair tasks.
- Before-repair images.
- After-repair images.
- Responsible person for each task, preferably English name or fallback `Service Team`.

### `/search`

Public exact serial number search.

The search should not expose browsing over all products. It should only redirect to a product page when the exact serial number exists and is public.

## Admin Pages

### `/admin/products`

Admin product list with filters:

- Serial number.
- Product source.
- Customer company.
- Repair count.
- Created month.
- Recent repair date.
- Product status.

### `/admin/products/new`

Create a product and generate:

- Serial number.
- QR code URL.
- Nameplate information.

Company-manufactured products collect more production information. Customer-supplied products collect customer and repair intake information.

### `/admin/products/[id]`

Admin product detail page.

Shows all product fields, internal customer fields, QR URL, serial number, and repair records.

### `/admin/products/[id]/edit`

Edit product information.

The serial number should generally be immutable after creation.

### `/admin/products/[id]/repairs/new`

Create a new repair record for a product.

The repair record can contain any number of free-form repair tasks.

### `/admin/products/[id]/repairs/[repairId]/edit`

Edit a repair record, repair tasks, and images.

## Data Model

### `admin_users`

Stores which Supabase Auth users are administrators.

Fields:

- `user_id uuid primary key references auth.users(id)`
- `role text`
- `created_at timestamptz`

### `customers`

Stores customer companies for internal admin use.

Fields:

- `id uuid primary key`
- `company_name text not null`
- `contact_name text`
- `contact_email text`
- `contact_phone text`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `serial_counters`

Tracks monthly serial number sequences.

Fields:

- `id uuid primary key`
- `source text not null`
- `year int not null`
- `month int not null`
- `next_number int not null`
- Unique constraint on `(source, year, month)`.

### `products`

Represents one physical product and nameplate.

Fields:

- `id uuid primary key`
- `serial_number text unique not null`
- `product_source text not null` (`own` or `customer`)
- `public_slug text unique not null`
- `qr_url text not null`
- `status text not null`
- `customer_id uuid references customers(id)`
- `product_type text`
- `nameplate_text text`
- `production_date date`
- `production_model text`
- `production_batch text`
- `material text`
- `size text`
- `internal_notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `repair_records`

Represents one repair event for one product.

Fields:

- `id uuid primary key`
- `product_id uuid not null references products(id)`
- `repair_number int not null`
- `repair_date date not null`
- `status text not null`
- `factory text`
- `internal_code text`
- `nameplate_code text`
- `summary_zh text`
- `summary_en text`
- `public_notes_en text`
- `internal_notes_zh text`
- `created_at timestamptz`
- `updated_at timestamptz`
- Unique constraint on `(product_id, repair_number)`.

### `repair_tasks`

Represents a flexible repair item under one repair record.

Fields:

- `id uuid primary key`
- `repair_record_id uuid not null references repair_records(id)`
- `sort_order int not null`
- `process_type text`
- `process_name_zh text`
- `process_name_en text`
- `description_zh text`
- `description_en text`
- `action_zh text`
- `action_en text`
- `quantity text`
- `equipment_zh text`
- `equipment_en text`
- `responsible_person_zh text`
- `responsible_person_en text`
- `result text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `repair_images`

Stores image metadata. The actual image files live in Supabase Storage.

Fields:

- `id uuid primary key`
- `repair_record_id uuid not null references repair_records(id)`
- `image_type text not null` (`before`, `after`, or `other`)
- `storage_path text not null`
- `caption_zh text`
- `caption_en text`
- `sort_order int not null`
- `created_at timestamptz`

## Storage

Use a Supabase Storage bucket:

```text
repair-images
```

Policy:

- Public read is acceptable for MVP because QR pages publicly show repair images.
- Upload, update, and delete are admin-only.

If customers later require privacy, switch to private storage with signed URLs.

## Authorization And RLS

Authentication:

- Customers do not log in.
- Administrators log in with Supabase email/password.
- Admin status is determined by `admin_users`.

RLS policy direction:

- Public users can read products and repair records only through public-facing queries and only for published records.
- Public users cannot list internal customer information.
- Public users cannot insert, update, or delete any data.
- Admin users can CRUD products, customers, repair records, repair tasks, and repair images.

Internal fields like customer company, contact info, and internal notes should not be exposed to public pages.

## MVP Build Order

1. Create database schema and RLS policies.
2. Add admin gate using Supabase Auth and `admin_users`.
3. Build product creation with serial number generation.
4. Build admin product list and filters.
5. Build repair record CRUD with free-form repair tasks.
6. Add image upload to Supabase Storage.
7. Build public traceability pages.
8. Build exact serial number search.
9. Add QR code display/download for nameplate creation.

## Open Decisions

- Whether public pages should show all repair task details by default or use a collapsed layout.
- Whether nameplate QR codes should include the full domain or a short redirect path.
- Whether admin should be able to regenerate QR code images with specific print dimensions.
- Whether repair images need watermarks.
