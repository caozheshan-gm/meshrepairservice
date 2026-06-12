"use server";

import { redirect } from "next/navigation";

import { findActiveSerialNumber } from "@/lib/public-data";

export type SearchBySerialState = {
  error?: "missing_serial" | "not_found";
  serial?: string;
};

export async function searchBySerial(
  _prevState: SearchBySerialState,
  formData: FormData,
): Promise<SearchBySerialState> {
  const serial = formData.get("serial");

  if (typeof serial !== "string" || serial.trim().length === 0) {
    return { error: "missing_serial" };
  }

  const normalizedSerial = serial.trim();
  const serialNumber = await findActiveSerialNumber(normalizedSerial);

  if (!serialNumber) {
    return { error: "not_found", serial: normalizedSerial };
  }

  redirect(`/t/${encodeURIComponent(serialNumber)}`);
}
