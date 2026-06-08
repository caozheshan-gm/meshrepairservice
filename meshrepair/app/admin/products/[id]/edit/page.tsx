import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updateProduct } from "@/app/admin/products/actions";
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

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          className="text-sm text-muted-foreground"
          href={`/admin/products/${product.id}`}
        >
          产品详情
        </Link>
        <h1 className="text-3xl font-semibold">编辑产品</h1>
        <p className="font-mono text-sm text-muted-foreground">
          {product.serial_number}
        </p>
      </div>

      <form action={updateProduct}>
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
                <Label htmlFor="contact_name">联系人</Label>
                <Input
                  defaultValue={product.customers?.contact_name ?? ""}
                  id="contact_name"
                  name="contact_name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact_email">联系邮箱</Label>
                <Input
                  defaultValue={product.customers?.contact_email ?? ""}
                  id="contact_email"
                  name="contact_email"
                  type="email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact_phone">联系电话</Label>
                <Input
                  defaultValue={product.customers?.contact_phone ?? ""}
                  id="contact_phone"
                  name="contact_phone"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="product_type">产品类型</Label>
                <Input
                  defaultValue={product.product_type ?? ""}
                  id="product_type"
                  name="product_type"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="material">材质</Label>
                <Input
                  defaultValue={product.material ?? ""}
                  id="material"
                  name="material"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">尺寸</Label>
                <Input defaultValue={product.size ?? ""} id="size" name="size" />
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
                <Label htmlFor="production_model">生产型号</Label>
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

            <div className="grid gap-2">
              <Label htmlFor="nameplate_text">铭牌文字</Label>
              <textarea
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                defaultValue={product.nameplate_text ?? ""}
                id="nameplate_text"
                name="nameplate_text"
              />
            </div>

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
                <Link href={`/admin/products/${product.id}`}>取消</Link>
              </Button>
              <Button type="submit">保存修改</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <Suspense>
      <EditProductContent params={params} />
    </Suspense>
  );
}
