"use client";

import { useFormStatus } from "react-dom";

import { BlockingOverlay } from "@/components/ui/blocking-overlay";

type PendingSubmitOverlayProps = {
  message: string;
};

export function PendingSubmitOverlay({ message }: PendingSubmitOverlayProps) {
  const { pending } = useFormStatus();

  return <BlockingOverlay message={message} open={pending} />;
}
