"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type SearchBySerialState = {
  error?: "missing_serial" | "not_found";
  serial?: string;
};

export async function searchBySerial(
  _prevState: SearchBySerialState,
  formData: FormData,
): Promise<SearchBySerialState> {
  const serial = formData.get("serial");

  if (typeof serial !== "string" || serial.trim().length === 0) {
    return { error: "missing_serial" };
  }

  const normalizedSerial = serial.trim();
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("serial_number")
    .eq("serial_number", normalizedSerial)
    .eq("status", "active")
    .maybeSingle();

  if (error || !product) {
    return { error: "not_found", serial: normalizedSerial };
  }

  redirect(`/t/${encodeURIComponent(product.serial_number)}`);
}
