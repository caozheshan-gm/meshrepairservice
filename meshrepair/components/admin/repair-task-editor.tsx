"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  REPAIR_TASK_TEMPLATE_ROWS,
  type RepairTaskTemplateRow,
} from "@/components/admin/repair-task-template";

export type RepairTaskFormValue = {
  process_name_zh: string;
  process_name_en: string;
  description_zh: string;
  description_en: string;
  action_zh: string;
  action_en: string;
  quantity: string;
  equipment_zh: string;
  equipment_en: string;
  responsible_person_zh: string;
  responsible_person_en: string;
  result: string;
};

type RepairTaskEditorProps = {
  initialTasks?: RepairTaskFormValue[];
};

type RowState = {
  checked: boolean;
  descriptionZh: string;
  quantity: string;
  responsibleZh: string;
};

export function RepairTaskEditor({ initialTasks }: RepairTaskEditorProps) {
  const [rows, setRows] = useState<Record<string, RowState>>(() => {
    const byProcess = new Map(
      (initialTasks ?? []).map((task) => [task.process_name_zh, task]),
    );

    return Object.fromEntries(
      REPAIR_TASK_TEMPLATE_ROWS.map((row) => {
        const existing = byProcess.get(row.processZh);
        return [
          row.key,
          {
            checked: row.selectable ? Boolean(existing) : true,
            descriptionZh: existing?.description_zh ?? row.descriptionZh,
            quantity: existing?.quantity ?? "",
            responsibleZh: existing?.responsible_person_zh ?? row.responsibleZh,
          },
        ];
      }),
    );
  });

  const tasksJson = useMemo(() => {
    const tasks = REPAIR_TASK_TEMPLATE_ROWS.flatMap((row) => {
      const state = rows[row.key];
      if (!state || (row.selectable && !state.checked)) {
        return [];
      }

      return [
        {
          process_name_zh: row.processZh,
          process_name_en: row.processEn,
          description_zh: state.descriptionZh,
          description_en: row.descriptionEn,
          action_zh: row.actionZh,
          action_en: row.actionEn,
          quantity: state.quantity,
          equipment_zh: row.equipmentZh,
          equipment_en: row.equipmentEn,
          responsible_person_zh: state.responsibleZh,
          responsible_person_en: row.responsibleEn,
          result: row.selectable ? "已处理" : "完成",
        },
      ];
    });

    return JSON.stringify(tasks);
  }, [rows]);

  function updateRow(key: string, patch: Partial<RowState>) {
    setRows((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...patch,
      },
    }));
  }

  return (
    <div className="grid gap-4">
      <input name="tasks_json" type="hidden" value={tasksJson} />

      <div className="overflow-hidden rounded-md border">
        <div className="grid grid-cols-[140px_1fr_1fr_120px] bg-primary text-sm font-medium text-primary-foreground">
          <div className="border-r p-3">工序</div>
          <div className="border-r p-3">情况描述</div>
          <div className="border-r p-3">处理办法</div>
          <div className="p-3">责任人</div>
        </div>

        {groupedRows().map(([section, sectionRows]) => (
          <div className="grid grid-cols-[140px_1fr] border-t" key={section}>
            <div className="grid place-items-center border-r bg-muted/40 p-3 text-center text-sm font-medium">
              {section}
            </div>
            <div>
              {sectionRows.map((row) => {
                const state = rows[row.key];
                return (
                  <div
                    className="grid gap-3 border-b p-3 last:border-b-0 md:grid-cols-[1fr_1fr_120px]"
                    key={row.key}
                  >
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {row.selectable ? (
                          <input
                            checked={state.checked}
                            onChange={(event) =>
                              updateRow(row.key, { checked: event.target.checked })
                            }
                            type="checkbox"
                          />
                        ) : null}
                        <span>{row.processZh}</span>
                      </div>
                      {row.editableDescription ? (
                        <textarea
                          className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                          onChange={(event) =>
                            updateRow(row.key, { descriptionZh: event.target.value })
                          }
                          placeholder="填写本次发现的问题"
                          value={state.descriptionZh}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {state.descriptionZh}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2 text-sm">
                      <div className="font-medium">{row.actionZh}</div>
                      {row.quantityPlaceholder ? (
                        <Input
                          onChange={(event) =>
                            updateRow(row.key, { quantity: event.target.value })
                          }
                          placeholder={row.quantityPlaceholder}
                          value={state.quantity}
                        />
                      ) : row.equipmentZh ? (
                        <div className="text-muted-foreground">{row.equipmentZh}</div>
                      ) : (
                        <div className="text-muted-foreground">√</div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label className="sr-only">责任人</Label>
                      <Input
                        onChange={(event) =>
                          updateRow(row.key, { responsibleZh: event.target.value })
                        }
                        value={state.responsibleZh}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function groupedRows() {
  const groups: Array<[string, RepairTaskTemplateRow[]]> = [];

  for (const row of REPAIR_TASK_TEMPLATE_ROWS) {
    const group = groups.at(-1);
    if (group?.[0] === row.section) {
      group[1].push(row);
    } else {
      groups.push([row.section, [row]]);
    }
  }

  return groups;
}
