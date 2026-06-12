"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";

type CustomerCompanyComboboxProps = {
  defaultValue?: string;
  options: string[];
};

export function CustomerCompanyCombobox({
  defaultValue = "",
  options,
}: CustomerCompanyComboboxProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
      <Input
        autoComplete="off"
        id="customer_company_picker"
        name="customer_company"
        onChange={(event) => setValue(event.target.value)}
        placeholder="输入新客户公司"
        value={value}
      />
      <select
        aria-label="选择已有客户公司"
        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        onChange={(event) => {
          const nextValue = event.target.value;
          if (nextValue) {
            setValue(nextValue);
          }
        }}
        value=""
      >
        <option value="">选择已有客户</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
