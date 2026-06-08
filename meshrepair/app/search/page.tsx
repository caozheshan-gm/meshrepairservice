import Link from "next/link";
import { Suspense } from "react";

import { SerialSearchForm } from "@/components/serial-search-form";

function SearchContent() {
  return (
    <div className="grid w-full gap-8">
      <div className="grid gap-3">
        <Link
          className="w-fit bg-primary px-5 py-3 text-[13px] font-bold uppercase tracking-[0.12em] text-white"
          href="/"
        >
          HDS Service
        </Link>
        <h1 className="text-4xl font-semibold leading-tight">
          Repair status lookup
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Enter the exact serial number printed on the product nameplate to
          view public repair history and service documentation.
        </p>
      </div>

      <div className="border-y border-neutral-200 bg-white px-6 py-8 shadow-sm">
        <SerialSearchForm buttonLabel="Check status" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center px-6 py-10">
      <Suspense>
        <SearchContent />
      </Suspense>
    </main>
  );
}
