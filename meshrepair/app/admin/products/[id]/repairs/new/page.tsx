import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { createRepairRecord } from "@/app/admin/products/[id]/repairs/actions";
import { RepairTaskEditor } from "@/components/admin/repair-task-editor";
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

type NewRepairPageProps = {
  params: Promise<{ id: string }>;
};

async function NewRepairContent({ params }: NewRepairPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,serial_number")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          className="text-sm text-muted-foreground"
          href={`/admin/products/${product.id}`}
        >
          产品详情
        </Link>
        <h1 className="text-3xl font-semibold">新增维修记录</h1>
        <p className="font-mono text-sm text-muted-foreground">
          {product.serial_number}
        </p>
      </div>

      <RepairForm
        action={createRepairRecord}
        cancelHref={`/admin/products/${product.id}`}
        productId={product.id}
      />
    </div>
  );
}

type RepairFormProps = {
  action: (formData: FormData) => void;
  cancelHref: string;
  productId: string;
  repairId?: string;
  repair?: {
    factory: string | null;
    internal_code: string | null;
    internal_notes_zh: string | null;
    nameplate_code: string | null;
    public_notes_en: string | null;
    repair_date: string;
    status: string;
    summary_en: string | null;
    summary_zh: string | null;
  };
  tasks?: React.ComponentProps<typeof RepairTaskEditor>["initialTasks"];
};

export function RepairForm({
  action,
  cancelHref,
  productId,
  repair,
  repairId,
  tasks,
}: RepairFormProps) {
  return (
    <form action={action}>
      <input name="product_id" type="hidden" value={productId} />
      {repairId ? <input name="repair_id" type="hidden" value={repairId} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>维修基本信息</CardTitle>
          <CardDescription>
            中文用于内部管理，英文用于客户公开页面。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="repair_date">维修日期</Label>
              <Input
                defaultValue={
                  repair?.repair_date ?? new Date().toISOString().slice(0, 10)
                }
                id="repair_date"
                name="repair_date"
                required
                type="date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">状态</Label>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                defaultValue={repair?.status ?? "completed"}
                id="status"
                name="status"
              >
                <option value="completed">已完成</option>
                <option value="draft">草稿</option>
                <option value="archived">归档隐藏</option>
              </select>
              <p className="text-sm text-muted-foreground">
                只有“已完成”的维修记录会显示在客户公开页。
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="factory">维修工厂</Label>
              <Input
                defaultValue={repair?.factory ?? ""}
                id="factory"
                name="factory"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="internal_code">内部编码</Label>
              <Input
                defaultValue={repair?.internal_code ?? ""}
                id="internal_code"
                name="internal_code"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nameplate_code">铭牌编码</Label>
              <Input
                defaultValue={repair?.nameplate_code ?? ""}
                id="nameplate_code"
                name="nameplate_code"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="summary_zh">维修摘要（中文）</Label>
              <textarea
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                defaultValue={repair?.summary_zh ?? ""}
                id="summary_zh"
                name="summary_zh"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary_en">Repair Summary (English)</Label>
              <textarea
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                defaultValue={repair?.summary_en ?? ""}
                id="summary_en"
                name="summary_en"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="public_notes_en">Public Notes (English)</Label>
              <textarea
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                defaultValue={repair?.public_notes_en ?? ""}
                id="public_notes_en"
                name="public_notes_en"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="internal_notes_zh">内部备注</Label>
              <textarea
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                defaultValue={repair?.internal_notes_zh ?? ""}
                id="internal_notes_zh"
                name="internal_notes_zh"
              />
            </div>
          </div>

          <div className="grid gap-3">
            <div>
              <h2 className="text-lg font-medium">维修项目</h2>
              <p className="text-sm text-muted-foreground">
                可自由添加清洗、补环、更换织带、复检等项目。
              </p>
            </div>
            <RepairTaskEditor initialTasks={tasks} />
          </div>

          <div className="flex justify-end gap-3">
            <Button asChild type="button" variant="outline">
              <Link href={cancelHref}>取消</Link>
            </Button>
            <Button type="submit">保存维修记录</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default function NewRepairPage({ params }: NewRepairPageProps) {
  return (
    <Suspense>
      <NewRepairContent params={params} />
    </Suspense>
  );
}
