import Link from "next/link";
import { Suspense } from "react";

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
import { createProduct } from "@/app/admin/products/actions";

async function NewProductContent() {
  await requireAdmin();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link className="text-sm text-muted-foreground" href="/admin/products">
          产品列表
        </Link>
        <h1 className="text-3xl font-semibold">新增产品</h1>
      </div>

      <form action={createProduct}>
        <Card>
          <CardHeader>
            <CardTitle>铭牌与产品信息</CardTitle>
            <CardDescription>
              保存后系统会自动生成唯一序列号和二维码链接。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="product_source">产品来源</Label>
              <select
                id="product_source"
                name="product_source"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                defaultValue="customer"
                required
              >
                <option value="customer">客户送修产品</option>
                <option value="own">本厂生产产品</option>
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="customer_company">客户公司</Label>
                <Input id="customer_company" name="customer_company" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact_name">联系人</Label>
                <Input id="contact_name" name="contact_name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact_email">联系邮箱</Label>
                <Input id="contact_email" name="contact_email" type="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact_phone">联系电话</Label>
                <Input id="contact_phone" name="contact_phone" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="product_type">产品类型</Label>
                <Input
                  id="product_type"
                  name="product_type"
                  placeholder="mesh gloves"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="material">材质</Label>
                <Input id="material" name="material" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">尺寸</Label>
                <Input id="size" name="size" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="production_date">生产日期</Label>
                <Input id="production_date" name="production_date" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="production_model">生产型号</Label>
                <Input id="production_model" name="production_model" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="production_batch">生产批次</Label>
                <Input id="production_batch" name="production_batch" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nameplate_text">铭牌文字</Label>
              <textarea
                id="nameplate_text"
                name="nameplate_text"
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                placeholder="可填写材质、维护提示、公司信息等。"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="internal_notes">内部备注</Label>
              <textarea
                id="internal_notes"
                name="internal_notes"
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button asChild type="button" variant="outline">
                <Link href="/admin/products">取消</Link>
              </Button>
              <Button type="submit">保存并生成序列号</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <Suspense>
        <NewProductContent />
      </Suspense>
    </main>
  );
}
