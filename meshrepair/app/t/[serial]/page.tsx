import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicProductBySerial } from "@/lib/public-data";

type TracePageProps = {
  params: Promise<{ serial: string }>;
};

async function TraceContent({ params }: TracePageProps) {
  const { serial } = await params;
  const product = await getPublicProductBySerial(decodeURIComponent(serial));

  if (!product) {
    notFound();
  }

  const repairs = product.repair_records
    .filter((repair) => repair.status === "completed")
    .sort((a, b) => b.repair_number - a.repair_number);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Mesh Repair Service</p>
        <h1 className="text-3xl font-semibold">Repair History</h1>
        <p className="font-mono text-sm text-muted-foreground">
          {product.serial_number}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Traceability</CardTitle>
          <CardDescription>
            This page shows public repair records linked to the product
            nameplate.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Info label="Serial Number" value={product.serial_number} />
          <Info
            label="Product Source"
            value={
              product.product_source === "own"
                ? "Manufactured Product"
                : "Customer Supplied Product"
            }
          />
          <Info label="Product Type" value={product.product_type} />
          {product.product_source === "own" ? (
            <>
              <Info label="Production Date" value={product.production_date} />
              <Info label="Model" value={product.production_model} />
              <Info label="Material" value={product.material} />
              <Info label="Size" value={product.size} />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Repair Records</CardTitle>
              <CardDescription>
                {repairs.length} completed repair record
                {repairs.length === 1 ? "" : "s"}.
              </CardDescription>
            </div>
            <Badge variant="secondary">{repairs.length} repairs</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {repairs.map((repair) => (
            <Link
              href={`/t/${encodeURIComponent(product.serial_number)}/repairs/${repair.id}`}
              key={repair.id}
            >
              <div className="grid gap-2 rounded-md border p-4 transition-colors hover:bg-muted/40 md:grid-cols-[120px_140px_1fr]">
                <div className="font-medium">Repair #{repair.repair_number}</div>
                <div className="text-sm text-muted-foreground">
                  {repair.repair_date}
                </div>
                <div className="text-sm">
                  {repair.summary_en ||
                    repair.public_notes_en ||
                    "Repair details available."}
                </div>
              </div>
            </Link>
          ))}

          {repairs.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No public repair records are available for this product yet.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="grid gap-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm">{value || "Not provided"}</div>
    </div>
  );
}

export default function TracePage({ params }: TracePageProps) {
  return (
    <Suspense>
      <TraceContent params={params} />
    </Suspense>
  );
}
