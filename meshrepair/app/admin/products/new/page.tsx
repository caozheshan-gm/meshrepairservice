import { Suspense } from "react";

import { AdminPageShell } from "@/components/admin/admin-shell";
import { NewProductForm } from "@/components/admin/new-product-form";
import { requireAdmin } from "@/lib/auth/admin";

async function NewProductContent() {
  await requireAdmin();

  return (
    <AdminPageShell maxWidth="md" subtitle="创建唯一序列号和二维码链接。" title="新增产品">
      <NewProductForm />
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
