"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const emptyTask: RepairTaskFormValue = {
  process_name_zh: "",
  process_name_en: "",
  description_zh: "",
  description_en: "",
  action_zh: "",
  action_en: "",
  quantity: "",
  equipment_zh: "",
  equipment_en: "",
  responsible_person_zh: "",
  responsible_person_en: "",
  result: "",
};

type RepairTaskEditorProps = {
  initialTasks?: RepairTaskFormValue[];
};

export function RepairTaskEditor({ initialTasks }: RepairTaskEditorProps) {
  const [tasks, setTasks] = useState<RepairTaskFormValue[]>(
    initialTasks && initialTasks.length > 0 ? initialTasks : [emptyTask],
  );

  const tasksJson = useMemo(() => JSON.stringify(tasks), [tasks]);

  function updateTask(
    index: number,
    field: keyof RepairTaskFormValue,
    value: string,
  ) {
    setTasks((currentTasks) =>
      currentTasks.map((task, taskIndex) =>
        taskIndex === index ? { ...task, [field]: value } : task,
      ),
    );
  }

  function addTask() {
    setTasks((currentTasks) => [...currentTasks, emptyTask]);
  }

  function removeTask(index: number) {
    setTasks((currentTasks) =>
      currentTasks.length === 1
        ? [emptyTask]
        : currentTasks.filter((_, taskIndex) => taskIndex !== index),
    );
  }

  return (
    <div className="grid gap-4">
      <input name="tasks_json" type="hidden" value={tasksJson} />

      {tasks.map((task, index) => (
        <div className="grid gap-4 rounded-md border p-4" key={index}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">维修项目 {index + 1}</h3>
            <Button
              onClick={() => removeTask(index)}
              type="button"
              variant="outline"
            >
              删除
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TaskInput
              label="工序（中文）"
              onChange={(value) => updateTask(index, "process_name_zh", value)}
              value={task.process_name_zh}
            />
            <TaskInput
              label="Process (English)"
              onChange={(value) => updateTask(index, "process_name_en", value)}
              value={task.process_name_en}
            />
            <TaskTextarea
              label="问题描述（中文）"
              onChange={(value) => updateTask(index, "description_zh", value)}
              value={task.description_zh}
            />
            <TaskTextarea
              label="Description (English)"
              onChange={(value) => updateTask(index, "description_en", value)}
              value={task.description_en}
            />
            <TaskTextarea
              label="处理办法（中文）"
              onChange={(value) => updateTask(index, "action_zh", value)}
              value={task.action_zh}
            />
            <TaskTextarea
              label="Corrective Action (English)"
              onChange={(value) => updateTask(index, "action_en", value)}
              value={task.action_en}
            />
            <TaskInput
              label="数量"
              onChange={(value) => updateTask(index, "quantity", value)}
              value={task.quantity}
            />
            <TaskInput
              label="结果"
              onChange={(value) => updateTask(index, "result", value)}
              value={task.result}
            />
            <TaskInput
              label="设备（中文）"
              onChange={(value) => updateTask(index, "equipment_zh", value)}
              value={task.equipment_zh}
            />
            <TaskInput
              label="Equipment (English)"
              onChange={(value) => updateTask(index, "equipment_en", value)}
              value={task.equipment_en}
            />
            <TaskInput
              label="责任人（中文）"
              onChange={(value) =>
                updateTask(index, "responsible_person_zh", value)
              }
              value={task.responsible_person_zh}
            />
            <TaskInput
              label="Person Responsible (English)"
              onChange={(value) =>
                updateTask(index, "responsible_person_en", value)
              }
              value={task.responsible_person_en}
            />
          </div>
        </div>
      ))}

      <Button onClick={addTask} type="button" variant="outline">
        添加维修项目
      </Button>
    </div>
  );
}

function TaskInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} onChange={(event) => onChange(event.target.value)} value={value} />
    </div>
  );
}

function TaskTextarea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </div>
  );
}
