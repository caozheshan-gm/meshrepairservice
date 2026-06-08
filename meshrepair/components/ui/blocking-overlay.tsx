"use client";

type BlockingOverlayProps = {
  message: string;
  open: boolean;
};

export function BlockingOverlay({ message, open }: BlockingOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4"
      role="dialog"
    >
      <div className="rounded-md border bg-background px-6 py-4 text-center shadow-lg">
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        <div className="text-sm font-medium">{message}</div>
      </div>
    </div>
  );
}
