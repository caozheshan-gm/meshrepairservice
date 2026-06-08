"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { generateSerialNumber, isProductSource } from "@/lib/serials";

function optionalText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function getSiteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}

export async function createProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productSource = formData.get("product_source");

  if (!isProductSource(productSource)) {
    throw new Error("请选择有效的产品来源。");
  }

  const customerCompany = optionalText(formData, "customer_company");
  let customerId: string | null = null;

  if (customerCompany) {
    const { data: existingCustomer, error: customerSelectError } = await supabase
      .from("customers")
      .select("id")
      .eq("company_name", customerCompany)
      .maybeSingle();

    if (customerSelectError) {
      throw new Error(customerSelectError.message);
    }

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerInsertError } = await supabase
        .from("customers")
        .insert({
          company_name: customerCompany,
          contact_name: optionalText(formData, "contact_name"),
          contact_email: optionalText(formData, "contact_email"),
          contact_phone: optionalText(formData, "contact_phone"),
        })
        .select("id")
        .single();

      if (customerInsertError) {
        throw new Error(customerInsertError.message);
      }

      customerId = newCustomer.id;
    }
  }

  const serialNumber = await generateSerialNumber(supabase, productSource);
  const origin = await getSiteOrigin();
  const qrUrl = `${origin}/t/${serialNumber}`;

  const { data: product, error: productInsertError } = await supabase
    .from("products")
    .insert({
      serial_number: serialNumber,
      public_slug: serialNumber,
      qr_url: qrUrl,
      product_source: productSource,
      customer_id: customerId,
      product_type: optionalText(formData, "product_type"),
      nameplate_text: optionalText(formData, "nameplate_text"),
      production_date: optionalText(formData, "production_date"),
      production_model: optionalText(formData, "production_model"),
      production_batch: optionalText(formData, "production_batch"),
      material: optionalText(formData, "material"),
      size: optionalText(formData, "size"),
      internal_notes: optionalText(formData, "internal_notes"),
    })
    .select("id,serial_number")
    .single();

  if (productInsertError) {
    throw new Error(productInsertError.message);
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products?serial=${encodeURIComponent(product.serial_number)}`);
}
