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

async function resolveCustomerId(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  formData: FormData,
) {
  const customerCompany = optionalText(formData, "customer_company");

  if (!customerCompany) {
    return null;
  }

  const { data: existingCustomer, error: customerSelectError } = await supabase
    .from("customers")
    .select("id")
    .eq("company_name", customerCompany)
    .maybeSingle();

  if (customerSelectError) {
    throw new Error(customerSelectError.message);
  }

  if (existingCustomer) {
    return existingCustomer.id;
  }

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

  return newCustomer.id;
}

export async function createProduct(_prevState: unknown, formData: FormData) {
  const { supabase } = await requireAdmin();
  const productSource = formData.get("product_source");

  if (!isProductSource(productSource)) {
    throw new Error("请选择有效的产品来源。");
  }

  const customerId = await resolveCustomerId(supabase, formData);

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

export async function updateProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = optionalText(formData, "product_id");

  if (!productId) {
    throw new Error("缺少产品 ID。");
  }

  const { error: productSelectError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .single();

  if (productSelectError) {
    throw new Error(productSelectError.message);
  }

  const customerId = await resolveCustomerId(supabase, formData);

  const { error: productUpdateError } = await supabase
    .from("products")
    .update({
      customer_id: customerId,
      status: optionalText(formData, "status") ?? "active",
      product_type: optionalText(formData, "product_type"),
      nameplate_text: optionalText(formData, "nameplate_text"),
      production_date: optionalText(formData, "production_date"),
      production_model: optionalText(formData, "production_model"),
      production_batch: optionalText(formData, "production_batch"),
      material: optionalText(formData, "material"),
      size: optionalText(formData, "size"),
      internal_notes: optionalText(formData, "internal_notes"),
    })
    .eq("id", productId);

  if (productUpdateError) {
    throw new Error(productUpdateError.message);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}

export async function deleteProducts(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productIds = Array.from(new Set(formData.getAll("product_id")))
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  if (productIds.length === 0) {
    throw new Error("请选择要删除的产品。");
  }

  const { data: repairs, error: repairsError } = await supabase
    .from("repair_records")
    .select("id")
    .in("product_id", productIds);

  if (repairsError) {
    throw new Error(repairsError.message);
  }

  const repairIds = repairs.map((repair) => repair.id);

  if (repairIds.length > 0) {
    const { data: images, error: imagesError } = await supabase
      .from("repair_images")
      .select("storage_path")
      .in("repair_record_id", repairIds);

    if (imagesError) {
      throw new Error(imagesError.message);
    }

    const storagePaths = images
      .map((image) => image.storage_path)
      .filter(Boolean);

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("repair-images")
        .remove(storagePaths);

      if (storageError) {
        throw new Error(storageError.message);
      }
    }
  }

  const { error: deleteProductsError } = await supabase
    .from("products")
    .delete()
    .in("id", productIds);

  if (deleteProductsError) {
    throw new Error(deleteProductsError.message);
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
