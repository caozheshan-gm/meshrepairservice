import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
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

type ProductsPageProps = {
  searchParams: Promise<{
    serial?: string;
    source?: string;
    customer?: string;
  }>;
};

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("products")
    .select(
      "id,serial_number,product_source,status,product_type,created_at,customer_id,customers(company_name),repair_records(id,repair_date)",
    )
    .order("created_at", { ascending: false });

  if (params.serial) {
    query = query.ilike("serial_number", `%${params.serial}%`);
  }

  if (params.source === "own" || params.source === "customer") {
    query = query.eq("product_source", params.source);
  }

  const { data: products, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const filteredProducts = params.customer
    ? products.filter((product) =>
        product.customers?.company_name
          ?.toLowerCase()
          .includes(params.customer!.toLowerCase()),
      )
    : products;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Link className="text-sm text-muted-foreground" href="/admin">
            管理后台
          </Link>
          <h1 className="text-3xl font-semibold">产品列表</h1>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">新增产品</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选</CardTitle>
          <CardDescription>按序列号、产品来源或客户公司缩小范围。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1fr_180px_1fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="serial">序列号</Label>
              <Input
                id="serial"
                name="serial"
                placeholder="REP-2026-06"
                defaultValue={params.serial}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">产品来源</Label>
              <select
                id="source"
                name="source"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                defaultValue={params.source ?? ""}
              >
                <option value="">全部</option>
                <option value="customer">客户送修</option>
                <option value="own">本厂生产</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer">客户公司</Label>
              <Input
                id="customer"
                name="customer"
                placeholder="公司名称"
                defaultValue={params.customer}
              />
            </div>
            <Button className="md:self-end" type="submit" variant="outline">
              筛选
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {filteredProducts.map((product) => {
          const latestRepairDate = product.repair_records
            .map((record) => record.repair_date)
            .filter(Boolean)
            .sort()
            .at(-1);

          return (
            <Link href={`/admin/products/${product.id}`} key={product.id}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="grid gap-4 p-4 md:grid-cols-[1.4fr_1fr_120px_140px] md:items-center">
                  <div className="grid gap-1">
                    <div className="font-medium">{product.serial_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.product_type ?? "未填写产品类型"}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {product.customers?.company_name ?? "无客户公司"}
                  </div>
                  <Badge variant="secondary">
                    {product.product_source === "own" ? "本厂生产" : "客户送修"}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    维修 {product.repair_records.length} 次
                    {latestRepairDate ? ` · 最近 ${latestRepairDate}` : ""}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              暂无产品。可以先新增一件产品生成序列号和二维码。
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}
