"use server";

import { redirect } from "next/navigation";

export async function searchBySerial(formData: FormData) {
  const serial = formData.get("serial");

  if (typeof serial !== "string" || serial.trim().length === 0) {
    redirect("/search?error=missing_serial");
  }

  redirect(`/t/${encodeURIComponent(serial.trim())}`);
}
