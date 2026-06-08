import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductQrCode } from "@/components/admin/qr-code";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/admin";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function ProductDetailContent({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "*,customers(company_name,contact_name,contact_email,contact_phone),repair_records(id,repair_number,repair_date,status,summary_zh,summary_en)",
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const repairs = [...product.repair_records].sort(
    (a, b) => b.repair_number - a.repair_number,
  );

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <Link className="text-sm text-muted-foreground" href="/admin/products">
            产品列表
          </Link>
          <h1 className="text-3xl font-semibold">{product.serial_number}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {product.product_source === "own" ? "本厂生产" : "客户送修"}
            </Badge>
            <Badge variant="outline">{product.status}</Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/admin/products/${product.id}/edit`}>编辑产品</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/products/${product.id}/repairs/new`}>
              新增维修记录
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>二维码铭牌</CardTitle>
            <CardDescription>用于制作铭牌和客户扫码追溯。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="aspect-square w-full max-w-64 justify-self-center">
              <ProductQrCode
                fileName={`${product.serial_number}-qr`}
                value={product.qr_url}
              />
            </div>
            <div className="grid gap-1 text-sm">
              <div className="text-muted-foreground">QR URL</div>
              <div className="break-all font-mono">{product.qr_url}</div>
            </div>
            <div className="grid gap-1 text-sm">
              <div className="text-muted-foreground">铭牌文字</div>
              <div className="whitespace-pre-wrap">
                {product.nameplate_text || "未填写"}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>产品信息</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Info label="产品类型" value={product.product_type} />
              <Info label="材质" value={product.material} />
              <Info label="尺寸" value={product.size} />
              <Info label="生产日期" value={product.production_date} />
              <Info label="生产型号" value={product.production_model} />
              <Info label="生产批次" value={product.production_batch} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>客户信息</CardTitle>
              <CardDescription>仅管理员可见。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Info label="客户公司" value={product.customers?.company_name} />
              <Info label="联系人" value={product.customers?.contact_name} />
              <Info label="联系邮箱" value={product.customers?.contact_email} />
              <Info label="联系电话" value={product.customers?.contact_phone} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>维修记录</CardTitle>
          <CardDescription>当前产品的全部维修记录。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {repairs.map((repair) => (
            <Link
              href={`/admin/products/${product.id}/repairs/${repair.id}/edit`}
              key={repair.id}
            >
              <div className="grid gap-2 rounded-md border p-4 transition-colors hover:bg-muted/40 md:grid-cols-[120px_140px_1fr]">
                <div className="font-medium">第 {repair.repair_number} 次</div>
                <div className="text-sm text-muted-foreground">
                  {repair.repair_date}
                </div>
                <div className="text-sm">
                  {repair.summary_zh || repair.summary_en || "未填写摘要"}
                </div>
              </div>
            </Link>
          ))}

          {repairs.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              还没有维修记录。
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="grid gap-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm">{value || "未填写"}</div>
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <Suspense>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
