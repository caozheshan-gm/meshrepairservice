import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updateProduct } from "@/app/admin/products/actions";
import { AdminPageShell } from "@/components/admin/admin-shell";
import { ProductTypeSelect } from "@/components/admin/product-type-select";
import { PendingSubmitOverlay } from "@/components/pending-submit-overlay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAdmin } from "@/lib/auth/admin";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

async function EditProductContent({ params }: EditProductPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: product, error } = await supabase
    .from("products")
    .select("*,customers(company_name,contact_name,contact_email,contact_phone)")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const isOwnProduct = product.product_source === "own";

  return (
    <AdminPageShell
      maxWidth="md"
      subtitle={product.serial_number}
      title="编辑产品"
    >
      <form action={updateProduct}>
        <PendingSubmitOverlay message="正在保存产品..." />
        <input name="product_id" type="hidden" value={product.id} />
        <Card>
          <CardHeader>
            <CardTitle>产品信息</CardTitle>
            <CardDescription>序列号创建后不可修改。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label>产品来源</Label>
              <Input
                disabled
                value={
                  product.product_source === "own" ? "本厂生产产品" : "客户送修产品"
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">产品状态</Label>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                defaultValue={product.status}
                id="status"
                name="status"
              >
                <option value="active">公开使用</option>
                <option value="archived">归档隐藏</option>
              </select>
              <p className="text-sm text-muted-foreground">
                归档后客户公开追溯页不可访问，后台仍会保留记录。
              </p>
            </div>

            {!isOwnProduct ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="customer_company">客户公司</Label>
                  <Input
                    defaultValue={product.customers?.company_name ?? ""}
                    id="customer_company"
                    name="customer_company"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product_type">产品类型</Label>
                  <ProductTypeSelect defaultValue={product.product_type ?? ""} />
                </div>
              </div>
            ) : null}

            {isOwnProduct ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product_type">产品类型</Label>
                  <ProductTypeSelect defaultValue={product.product_type ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="material">材质</Label>
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                    defaultValue={product.material ?? ""}
                    id="material"
                    name="material"
                  >
                    <option value="">请选择</option>
                    <option value="不锈钢">不锈钢</option>
                    <option value="钛丝">钛丝</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="size">尺寸</Label>
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                    defaultValue={product.size ?? ""}
                    id="size"
                    name="size"
                  >
                    <option value="">请选择</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="production_date">生产日期</Label>
                  <Input
                    defaultValue={product.production_date ?? ""}
                    id="production_date"
                    name="production_date"
                    type="date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="production_model">生产 SKU</Label>
                  <Input
                    defaultValue={product.production_model ?? ""}
                    id="production_model"
                    name="production_model"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="production_batch">生产批次</Label>
                  <Input
                    defaultValue={product.production_batch ?? ""}
                    id="production_batch"
                    name="production_batch"
                  />
                </div>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="internal_notes">内部备注</Label>
              <textarea
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                defaultValue={product.internal_notes ?? ""}
                id="internal_notes"
                name="internal_notes"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button asChild type="button" variant="outline">
                <Link href={`/admin/products/${product.id}`} prefetch={false}>
                  取消
                </Link>
              </Button>
              <Button type="submit">保存修改</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </AdminPageShell>
  );
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <Suspense>
      <EditProductContent params={params} />
    </Suspense>
  );
}
