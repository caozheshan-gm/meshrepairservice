import { createClient } from "@/lib/supabase/server";

export async function getPublicProductBySerial(serial: string) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id,serial_number,product_source,product_type,production_date,production_model,material,size,qr_url,repair_records(id,repair_number,repair_date,status,summary_en,public_notes_en)",
    )
    .eq("serial_number", serial)
    .eq("status", "active")
    .single();

  if (error) {
    return null;
  }

  return product;
}

export async function getPublicRepairRecord(serial: string, repairId: string) {
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,serial_number,product_source,product_type")
    .eq("serial_number", serial)
    .eq("status", "active")
    .single();

  if (productError || !product) {
    return null;
  }

  const { data: repair, error: repairError } = await supabase
    .from("repair_records")
    .select("id,repair_number,repair_date,status,summary_en,public_notes_en,repair_tasks(*),repair_images(*)")
    .eq("id", repairId)
    .eq("product_id", product.id)
    .eq("status", "completed")
    .single();

  if (repairError || !repair) {
    return null;
  }

  return { product, repair, supabase };
}
