import Link from "next/link";
import { Suspense } from "react";

import { searchBySerial } from "@/app/search/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SearchPageProps = {
  searchParams: Promise<{ error?: string }>;
};

async function SearchContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <Link className="text-sm text-muted-foreground" href="/">
          Mesh Repair Service
        </Link>
        <h1 className="text-3xl font-semibold">Serial Number Search</h1>
        <p className="text-sm text-muted-foreground">
          Enter the exact serial number printed on the product nameplate.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Repair History</CardTitle>
          <CardDescription>
            The serial number is formatted like REP-2026-06-000001.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={searchBySerial} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="serial">Serial Number</Label>
              <Input
                autoCapitalize="characters"
                id="serial"
                name="serial"
                placeholder="REP-2026-06-000001"
                required
              />
            </div>

            {params.error === "missing_serial" ? (
              <p className="text-sm text-destructive">
                Please enter a serial number.
              </p>
            ) : null}

            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center gap-6 px-6 py-10">
      <Suspense>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
