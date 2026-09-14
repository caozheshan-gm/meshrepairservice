import { createClient } from "@/lib/supabase/server";
import { normalizeSerialSearch } from "@/lib/serial-search";

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
  const trimmedSerial = serial.trim();
  const normalizedSerial = normalizeSerialSearch(trimmedSerial);

  // QR URLs contain the canonical serial number, so query the database
  // directly instead of loading an arbitrary first page of products. The
  // canonical candidate also keeps the public search tolerant of omitted
  // separators in generated OWN/REP serial numbers.
  const candidates = new Set([trimmedSerial, trimmedSerial.toUpperCase()]);
  const generatedSerial = normalizedSerial.match(
    /^(OWN|REP)(\d{4})(\d{2})(\d{6})$/,
  );

  if (generatedSerial) {
    candidates.add(
      `${generatedSerial[1]}-${generatedSerial[2]}-${generatedSerial[3]}-${generatedSerial[4]}`,
    );
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("serial_number")
    .eq("status", "active")
    .in("serial_number", Array.from(candidates))
    .maybeSingle();

  return error ? null : product?.serial_number ?? null;
}
