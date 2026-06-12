import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getCustomerCompanyOptions(supabase: SupabaseServerClient) {
  const { data, error } = await supabase
    .from("products")
    .select("id,product_source,customers(company_name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return Array.from(
    new Set(
      data
        .filter((product) => product.product_source === "customer")
        .map((product) => product.customers?.company_name?.trim() ?? "")
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}
