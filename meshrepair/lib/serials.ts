import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

export type ProductSource = "own" | "customer";

const SOURCE_PREFIX: Record<ProductSource, "OWN" | "REP"> = {
  own: "OWN",
  customer: "REP",
};

export async function generateSerialNumber(
  supabase: SupabaseClient<Database>,
  productSource: ProductSource,
) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const source = SOURCE_PREFIX[productSource];

  const { data: existingCounter, error: selectError } = await supabase
    .from("serial_counters")
    .select("id,next_number")
    .eq("source", source)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  const sequence = existingCounter?.next_number ?? 1;

  if (existingCounter) {
    const { error: updateError } = await supabase
      .from("serial_counters")
      .update({ next_number: sequence + 1 })
      .eq("id", existingCounter.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } else {
    const { error: insertError } = await supabase
      .from("serial_counters")
      .insert({
        source,
        year,
        month,
        next_number: 2,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return [
    source,
    year.toString(),
    month.toString().padStart(2, "0"),
    sequence.toString().padStart(6, "0"),
  ].join("-");
}

export function isProductSource(value: FormDataEntryValue | null): value is ProductSource {
  return value === "own" || value === "customer";
}
