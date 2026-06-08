"use client";

import { useActionState, useEffect, useState } from "react";

import {
  searchBySerial,
  type SearchBySerialState,
} from "@/app/search/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: SearchBySerialState = {};

export function SerialSearchForm({
  buttonLabel = "Search",
  className,
}: {
  buttonLabel?: string;
  className?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    searchBySerial,
    initialState,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (state.error) {
      setIsDialogOpen(true);
    }
  }, [state]);

  const message =
    state.error === "missing_serial"
      ? "Please enter a serial number."
      : `No active product was found for ${state.serial}. Please check the serial number and try again.`;

  return (
    <>
      <form action={formAction} className={cn("grid gap-4", className)}>
        <div className="grid gap-2">
          <Label className="text-[13px] font-semibold" htmlFor="serial">
            Product serial number
          </Label>
          <Input
            autoCapitalize="characters"
            className="h-12 rounded-none border-neutral-300 bg-white px-4 font-mono text-[15px] shadow-none focus-visible:ring-2"
            id="serial"
            name="serial"
            placeholder="Enter serial number"
            required
          />
        </div>
        <Button
          className="h-11 w-fit min-w-40 rounded-none bg-primary px-7 text-[13px] font-semibold uppercase tracking-[0.08em] shadow-none hover:bg-red-700"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Searching..." : buttonLabel}
        </Button>
      </form>

      {isDialogOpen && state.error ? (
        <div
          aria-labelledby="serial-search-error-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
          role="dialog"
        >
          <div className="grid w-full max-w-sm gap-4 rounded-md border bg-background p-6 shadow-lg">
            <div className="grid gap-2">
              <h2
                className="text-lg font-semibold"
                id="serial-search-error-title"
              >
                Serial number not found
              </h2>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsDialogOpen(false)} type="button">
                OK
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
