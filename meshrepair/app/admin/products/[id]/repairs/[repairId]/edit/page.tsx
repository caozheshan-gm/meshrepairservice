import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { updateRepairRecord } from "@/app/admin/products/[id]/repairs/actions";
import { RepairForm } from "@/app/admin/products/[id]/repairs/new/page";
import { requireAdmin } from "@/lib/auth/admin";

type EditRepairPageProps = {
  params: Promise<{ id: string; repairId: string }>;
};

async function EditRepairContent({ params }: EditRepairPageProps) {
  const { id, repairId } = await params;
  const { supabase } = await requireAdmin();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id,serial_number")
    .eq("id", id)
    .single();

  if (productError || !product) {
    notFound();
  }

  const { data: repair, error: repairError } = await supabase
    .from("repair_records")
    .select("*,repair_tasks(*)")
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
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          className="text-sm text-muted-foreground"
          href={`/admin/products/${product.id}`}
        >
          产品详情
        </Link>
        <h1 className="text-3xl font-semibold">
          编辑第 {repair.repair_number} 次维修
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          {product.serial_number}
        </p>
      </div>

      <RepairForm
        action={updateRepairRecord}
        cancelHref={`/admin/products/${product.id}`}
        productId={product.id}
        repair={repair}
        repairId={repair.id}
        tasks={tasks}
      />
    </div>
  );
}

export default function EditRepairPage({ params }: EditRepairPageProps) {
  return (
    <Suspense>
      <EditRepairContent params={params} />
    </Suspense>
  );
}
