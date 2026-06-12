import { createClient } from "@/lib/supabase/server";
import { serialMatches } from "@/lib/serial-search";

export async function getPublicProductBySerial(serial: string) {
  const supabase = await createClient();
  const canonicalSerial = await findActiveSerialNumber(serial);

  if (!canonicalSerial) {
    return null;
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id,serial_number,product_source,product_type,production_date,production_model,material,size,qr_url,repair_records(id,repair_number,customer_repair_batch_no,repair_date,status,summary_en,public_notes_en)",
    )
    .eq("serial_number", canonicalSerial)
    .eq("status", "active")
    .single();

  if (error) {
    return null;
  }

  return product;
}

export async function getPublicRepairRecord(serial: string, repairId: string) {
  const supabase = await createClient();
  const canonicalSerial = await findActiveSerialNumber(serial);

  if (!canonicalSerial) {
    return null;
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,serial_number,product_source,product_type")
    .eq("serial_number", canonicalSerial)
    .eq("status", "active")
    .single();

  if (productError || !product) {
    return null;
  }

  const { data: repair, error: repairError } = await supabase
    .from("repair_records")
    .select("id,repair_number,customer_repair_batch_no,received_date,repair_date,status,factory,summary_en,public_notes_en,repair_tasks(*),repair_images(*)")
    .eq("id", repairId)
    .eq("product_id", product.id)
    .eq("status", "completed")
    .single();

  if (repairError || !repair) {
    return null;
  }

  return { product, repair, supabase };
}

export async function findActiveSerialNumber(serial: string) {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("serial_number")
    .eq("status", "active")
    .limit(2000);

  if (error) {
    return null;
  }

  return (
    products.find((product) => serialMatches(product.serial_number, serial))
      ?.serial_number ?? null
  );
}
