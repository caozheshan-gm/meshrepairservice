import Link from "next/link";
import { Suspense } from "react";

import { searchBySerial } from "@/app/search/actions";
import { AuthButton } from "@/components/auth-button";
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

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <nav className="flex items-center justify-between gap-4 border-b pb-4 text-sm">
        <Link className="font-semibold" href="/">
          Mesh Repair Service
        </Link>
        <Suspense>
          <AuthButton />
        </Suspense>
      </nav>

      <section className="grid flex-1 gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Product Traceability</CardTitle>
            <CardDescription>
              Enter the exact serial number from the product nameplate to view
              public repair history.
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
              <Button type="submit">Search Repair History</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>
              Create product nameplates, manage serial numbers, and update
              repair records.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild>
              <Link href="/admin">Open Admin</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">Admin Login</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
