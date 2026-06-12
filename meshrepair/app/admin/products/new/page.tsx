import { Suspense } from "react";
import { connection } from "next/server";

import { AdminPageShell } from "@/components/admin/admin-shell";
import { NewProductForm } from "@/components/admin/new-product-form";
import { getCustomerCompanyOptions } from "@/lib/admin/customer-options";
import { requireAdmin } from "@/lib/auth/admin";

async function NewProductContent() {
  await connection();
  const { supabase } = await requireAdmin();
  const customerCompanyOptions = await getCustomerCompanyOptions(supabase);

  return (
    <AdminPageShell maxWidth="md" subtitle="创建唯一序列号和二维码链接。" title="新增产品">
      <NewProductForm customerCompanyOptions={customerCompanyOptions} />
    </AdminPageShell>
  );
}

export default function NewProductPage() {
  return (
    <Suspense>
      <NewProductContent />
    </Suspense>
  );
}
