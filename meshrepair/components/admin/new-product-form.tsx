"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { createProduct } from "@/app/admin/products/actions";
import { CustomerCompanyCombobox } from "@/components/admin/customer-company-combobox";
import { ProductTypeSelect } from "@/components/admin/product-type-select";
import { BlockingOverlay } from "@/components/ui/blocking-overlay";
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

type ProductSource = "customer" | "own";

export function NewProductForm({
  customerCompanyOptions,
}: {
  customerCompanyOptions: string[];
}) {
  const [productSource, setProductSource] = useState<ProductSource>("customer");
  const [, formAction, isPending] = useActionState(createProduct, null);
  const isOwnProduct = productSource === "own";

  return (
    <form action={formAction}>
      <BlockingOverlay message="正在保存并生成序列号..." open={isPending} />
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
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              id="product_source"
              name="product_source"
              onChange={(event) =>
                setProductSource(event.target.value as ProductSource)
              }
              required
              value={productSource}
            >
              <option value="customer">客户送修产品</option>
              <option value="own">本厂生产产品</option>
            </select>
          </div>

          {!isOwnProduct ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="customer_company_picker">客户公司</Label>
                <CustomerCompanyCombobox options={customerCompanyOptions} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product_type">产品类型</Label>
                <ProductTypeSelect />
              </div>
            </div>
          ) : null}

          {isOwnProduct ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="product_type">产品类型</Label>
                <ProductTypeSelect />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="material">材质</Label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
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
                  id="production_date"
                  name="production_date"
                  type="date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="production_model">生产 SKU</Label>
                <Input id="production_model" name="production_model" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="production_batch">生产批次</Label>
                <Input id="production_batch" name="production_batch" />
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="internal_notes">内部备注</Label>
            <textarea
              className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              id="internal_notes"
              name="internal_notes"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button asChild type="button" variant="outline">
              <Link href="/admin/products" prefetch={false}>
                取消
              </Link>
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "保存中..." : "保存并生成序列号"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
