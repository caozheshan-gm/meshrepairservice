import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updateRepairRecord } from "@/app/admin/products/[id]/repairs/actions";
import { RepairForm } from "@/app/admin/products/[id]/repairs/new/page";
import { AdminPageShell } from "@/components/admin/admin-shell";
import { RepairImageUploader } from "@/components/admin/repair-image-uploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/admin";

type EditRepairPageProps = {
  params: Promise<{ id: string; repairId: string }>;
};

async function EditRepairContent({ params }: EditRepairPageProps) {
  const { id, repairId } = await params;
  const { supabase } = await requireAdmin();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,serial_number,product_type")
    .eq("id", id)
    .single();

  if (productError || !product) {
    notFound();
  }

  const { data: repair, error: repairError } = await supabase
    .from("repair_records")
    .select("*,repair_tasks(*),repair_images(*)")
    .eq("id", repairId)
    .eq("product_id", product.id)
    .single();

  if (repairError || !repair) {
    notFound();
  }

  const tasks = [...repair.repair_tasks]
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
      title={`编辑第 ${repair.repair_number} 次维修`}
    >
      <RepairForm
        action={updateRepairRecord}
        cancelHref={`/admin/products/${product.id}`}
        productId={product.id}
        productSerialNumber={product.serial_number}
        productType={product.product_type}
        repair={repair}
        repairId={repair.id}
        tasks={tasks}
      />

      <Card>
        <CardHeader>
          <CardTitle>维修图片</CardTitle>
          <CardDescription>
            上传维修前、维修后或其他补充图片。删除图片会同时删除 Storage 文件和
            repair_images 元数据。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RepairImageUploader
            existingImages={[...repair.repair_images].sort(
              (a, b) => a.sort_order - b.sort_order,
            )}
            repairRecordId={repair.id}
          />
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

export default function EditRepairPage({ params }: EditRepairPageProps) {
  return (
    <Suspense>
      <EditRepairContent params={params} />
    </Suspense>
  );
}
