alter table public.repair_records
  add column if not exists received_date date,
  add column if not exists tracking_owner text;
