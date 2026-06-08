"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import type { RepairTaskFormValue } from "@/components/admin/repair-task-editor";

function optionalText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredText(formData: FormData, key: string, message: string) {
  const value = optionalText(formData, key);

  if (!value) {
    throw new Error(message);
  }

  return value;
}

function parseTasks(formData: FormData) {
  const rawTasks = formData.get("tasks_json");

  if (typeof rawTasks !== "string") {
    return [];
  }

  const parsed = JSON.parse(rawTasks) as RepairTaskFormValue[];

  return parsed
    .map((task, index) => ({
      sort_order: index,
      process_name_zh: clean(task.process_name_zh),
      process_name_en: clean(task.process_name_en),
      description_zh: clean(task.description_zh),
      description_en: clean(task.description_en),
      action_zh: clean(task.action_zh),
      action_en: clean(task.action_en),
      quantity: clean(task.quantity),
      equipment_zh: clean(task.equipment_zh),
      equipment_en: clean(task.equipment_en),
      responsible_person_zh: clean(task.responsible_person_zh),
      responsible_person_en: clean(task.responsible_person_en),
      result: clean(task.result),
    }))
    .filter((task) =>
      Object.entries(task).some(
        ([key, value]) => key !== "sort_order" && value !== null,
      ),
    );
}

function clean(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createRepairRecord(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = requiredText(formData, "product_id", "缺少产品 ID。");

  const { data: latestRepair, error: latestRepairError } = await supabase
    .from("repair_records")
    .select("repair_number")
    .eq("product_id", productId)
    .order("repair_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestRepairError) {
    throw new Error(latestRepairError.message);
  }

  const repairNumber = (latestRepair?.repair_number ?? 0) + 1;

  const { data: repairRecord, error: repairInsertError } = await supabase
    .from("repair_records")
    .insert({
      product_id: productId,
      repair_number: repairNumber,
      received_date: optionalText(formData, "received_date"),
      repair_date: requiredText(formData, "repair_date", "请填写维修日期。"),
      status: optionalText(formData, "status") ?? "completed",
      factory: optionalText(formData, "factory"),
      tracking_owner: optionalText(formData, "tracking_owner"),
      internal_code: optionalText(formData, "internal_code"),
      nameplate_code: optionalText(formData, "nameplate_code"),
      summary_zh: optionalText(formData, "summary_zh"),
      summary_en: optionalText(formData, "summary_en"),
      public_notes_en: optionalText(formData, "public_notes_en"),
      internal_notes_zh: optionalText(formData, "internal_notes_zh"),
    })
    .select("id")
    .single();

  if (repairInsertError) {
    throw new Error(repairInsertError.message);
  }

  const tasks = parseTasks(formData).map((task) => ({
    ...task,
    repair_record_id: repairRecord.id,
  }));

  if (tasks.length > 0) {
    const { error: tasksInsertError } = await supabase
      .from("repair_tasks")
      .insert(tasks);

    if (tasksInsertError) {
      throw new Error(tasksInsertError.message);
    }
  }

  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}/repairs/${repairRecord.id}/edit`);
}

export async function updateRepairRecord(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = requiredText(formData, "product_id", "缺少产品 ID。");
  const repairId = requiredText(formData, "repair_id", "缺少维修记录 ID。");

  const { error: repairUpdateError } = await supabase
    .from("repair_records")
    .update({
      received_date: optionalText(formData, "received_date"),
      repair_date: requiredText(formData, "repair_date", "请填写维修日期。"),
      status: optionalText(formData, "status") ?? "completed",
      factory: optionalText(formData, "factory"),
      tracking_owner: optionalText(formData, "tracking_owner"),
      internal_code: optionalText(formData, "internal_code"),
      nameplate_code: optionalText(formData, "nameplate_code"),
      summary_zh: optionalText(formData, "summary_zh"),
      summary_en: optionalText(formData, "summary_en"),
      public_notes_en: optionalText(formData, "public_notes_en"),
      internal_notes_zh: optionalText(formData, "internal_notes_zh"),
    })
    .eq("id", repairId)
    .eq("product_id", productId);

  if (repairUpdateError) {
    throw new Error(repairUpdateError.message);
  }

  const { error: deleteTasksError } = await supabase
    .from("repair_tasks")
    .delete()
    .eq("repair_record_id", repairId);

  if (deleteTasksError) {
    throw new Error(deleteTasksError.message);
  }

  const tasks = parseTasks(formData).map((task) => ({
    ...task,
    repair_record_id: repairId,
  }));

  if (tasks.length > 0) {
    const { error: tasksInsertError } = await supabase
      .from("repair_tasks")
      .insert(tasks);

    if (tasksInsertError) {
      throw new Error(tasksInsertError.message);
    }
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/admin/products/${productId}/repairs/${repairId}/edit`);
  redirect(`/admin/products/${productId}`);
}
