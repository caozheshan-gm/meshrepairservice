import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updateRepairRecord } from "@/app/admin/products/[id]/repairs/actions";
import { AdminPageShell } from "@/components/admin/admin-shell";
import { RepairImageUploader } from "@/components/admin/repair-image-uploader";
import { RepairTaskEditor } from "@/components/admin/repair-task-editor";
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

type NewRepairPageProps = {
  params: Promise<{ id: string }>;
};

async function NewRepairContent({ params }: NewRepairPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: product, error } = await supabase
    .from("products")
    .select("id,serial_number,product_type")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const { data: existingDraft, error: draftSelectError } = await supabase
    .from("repair_records")
    .select("*,repair_tasks(*),repair_images(*)")
    .eq("product_id", product.id)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (draftSelectError) {
    throw new Error(draftSelectError.message);
  }

  let draft = existingDraft;

  if (!draft) {
    const { data: latestRepair, error: latestRepairError } = await supabase
      .from("repair_records")
      .select("repair_number")
      .eq("product_id", product.id)
      .order("repair_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestRepairError) {
      throw new Error(latestRepairError.message);
    }

    const { data: newDraft, error: draftInsertError } = await supabase
      .from("repair_records")
      .insert({
        product_id: product.id,
        repair_number: (latestRepair?.repair_number ?? 0) + 1,
        repair_date: new Date().toISOString().slice(0, 10),
        status: "draft",
      })
      .select("*,repair_tasks(*),repair_images(*)")
      .single();

    if (draftInsertError) {
      throw new Error(draftInsertError.message);
    }

    draft = newDraft;
  }

  const tasks = [...draft.repair_tasks]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((task) => ({
      action_en: task.action_en ?? "",
      action_zh: task.action_zh ?? "",
      description_en: task.description_en ?? "",
      description_zh: task.description_zh ?? "",
      equipment_en: task.equipment_en ?? "",
      equipment_zh: task.equipment_zh ?? "",
      process_name_en: task.process_name_en ?? "",
      process_name_zh: task.process_name_zh ?? "",
      quantity: task.quantity ?? "",
      responsible_person_en: task.responsible_person_en ?? "",
      responsible_person_zh: task.responsible_person_zh ?? "",
      result: task.result ?? "",
    }));

  return (
    <AdminPageShell
      subtitle={product.serial_number}
      title="新增维修记录"
    >
      <RepairForm
        action={updateRepairRecord}
        cancelHref={`/admin/products/${product.id}`}
        productId={product.id}
        productSerialNumber={product.serial_number}
        productType={product.product_type}
        repair={draft}
        repairId={draft.id}
        statusOnSubmit="completed"
        tasks={tasks}
      />

      <Card>
        <CardHeader>
          <CardTitle>维修图片</CardTitle>
          <CardDescription>上传维修前、维修后或其他补充图片。</CardDescription>
        </CardHeader>
        <CardContent>
          <RepairImageUploader
            existingImages={[...draft.repair_images].sort(
              (a, b) => a.sort_order - b.sort_order,
            )}
            repairRecordId={draft.id}
          />
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

type RepairFormProps = {
  action: (formData: FormData) => void;
  cancelHref: string;
  productId: string;
  productSerialNumber: string;
  productType: string | null;
  repairId?: string;
  statusOnSubmit?: string;
  repair?: {
    customer_repair_batch_no: string | null;
    factory: string | null;
    internal_code: string | null;
    internal_notes_zh: string | null;
    nameplate_code: string | null;
    public_notes_en: string | null;
    received_date: string | null;
    repair_date: string;
    status: string;
    summary_en: string | null;
    summary_zh: string | null;
    tracking_owner: string | null;
  };
  tasks?: React.ComponentProps<typeof RepairTaskEditor>["initialTasks"];
};

export function RepairForm({
  action,
  cancelHref,
  productId,
  productSerialNumber,
  productType,
  repair,
  repairId,
  statusOnSubmit,
  tasks,
}: RepairFormProps) {
  return (
    <form action={action}>
      <PendingSubmitOverlay message="正在保存维修记录..." />
      <input name="product_id" type="hidden" value={productId} />
      {repairId ? <input name="repair_id" type="hidden" value={repairId} /> : null}
      <input
        name="status"
        type="hidden"
        value={statusOnSubmit ?? repair?.status ?? "completed"}
      />

      <Card>
        <CardHeader>
          <CardTitle>维修随行卡</CardTitle>
          <CardDescription>
            固定工序已按维修卡模板列出，空白处填写本次维修的变化内容。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="received_date">收件日期</Label>
              <Input
                defaultValue={repair?.received_date ?? ""}
                id="received_date"
                name="received_date"
                type="date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repair_date">合格日期</Label>
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
              <Label htmlFor="tracking_owner">跟踪负责人</Label>
              <Input
                defaultValue={repair?.tracking_owner ?? ""}
                id="tracking_owner"
                name="tracking_owner"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer_repair_batch_no">维修批次号</Label>
              <Input
                defaultValue={repair?.customer_repair_batch_no ?? ""}
                id="customer_repair_batch_no"
                name="customer_repair_batch_no"
                placeholder="客户送修时提供的批次号"
              />
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
              <Label>产品类型</Label>
              <Input disabled value={productType ?? "未填写"} />
            </div>
            <div className="grid gap-2">
              <Label>序列号</Label>
              <Input disabled value={productSerialNumber} />
            </div>
          </div>

          <div className="grid gap-3">
            <div>
              <h2 className="text-lg font-medium">维修项目</h2>
              <p className="text-sm text-muted-foreground">
                勾选本次发生的维修制程，填写问题描述、数量和责任人。
              </p>
            </div>
            <RepairTaskEditor initialTasks={tasks} />
          </div>

          <div className="flex justify-end gap-3">
            <p className="mr-auto self-center text-sm text-muted-foreground">
              图片可先上传，保存后该草稿会变为已完成维修记录。
            </p>
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
