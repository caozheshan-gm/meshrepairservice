alter table public.repair_records
  add column if not exists customer_repair_batch_no text;
