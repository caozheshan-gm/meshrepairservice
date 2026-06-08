import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPublicRepairRecord } from "@/lib/public-data";

type PublicRepairPageProps = {
  params: Promise<{ repairId: string; serial: string }>;
};

async function PublicRepairContent({ params }: PublicRepairPageProps) {
  const { repairId, serial } = await params;
  const result = await getPublicRepairRecord(
    decodeURIComponent(serial),
    repairId,
  );

  if (!result) {
    notFound();
  }

  const { product, repair, supabase } = result;
  const tasks = [...repair.repair_tasks].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const beforeImages = repair.repair_images
    .filter((image) => image.image_type === "before")
    .sort((a, b) => a.sort_order - b.sort_order);
  const afterImages = repair.repair_images
    .filter((image) => image.image_type === "after")
    .sort((a, b) => a.sort_order - b.sort_order);

  function imageUrl(storagePath: string) {
    return supabase.storage.from("repair-images").getPublicUrl(storagePath).data
      .publicUrl;
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          className="text-sm text-muted-foreground"
          href={`/t/${encodeURIComponent(product.serial_number)}`}
        >
          Repair History
        </Link>
        <h1 className="text-3xl font-semibold">
          Repair #{repair.repair_number}
        </h1>
        <p className="font-mono text-sm text-muted-foreground">
          {product.serial_number}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repair Summary</CardTitle>
          <CardDescription>{repair.repair_date}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <p>{repair.summary_en || "Repair details available."}</p>
          {repair.public_notes_en ? <p>{repair.public_notes_en}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Repair Items</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {tasks.map((task, index) => (
            <div className="grid gap-3 rounded-md border p-4" key={task.id}>
              <div className="font-medium">
                {task.process_name_en || `Repair Item ${index + 1}`}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Info label="Description" value={task.description_en} />
                <Info label="Corrective Action" value={task.action_en} />
                <Info label="Quantity" value={task.quantity} />
                <Info label="Equipment" value={task.equipment_en} />
                <Info
                  label="Person Responsible"
                  value={task.responsible_person_en || "Service Team"}
                />
                <Info label="Result" value={task.result} />
              </div>
            </div>
          ))}

          {tasks.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No repair item details are available.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ImageSection images={beforeImages} imageUrl={imageUrl} title="Before Repair" />
      <ImageSection images={afterImages} imageUrl={imageUrl} title="After Repair" />
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

function ImageSection({
  imageUrl,
  images,
  title,
}: {
  imageUrl: (storagePath: string) => string;
  images: Array<{
    caption_en: string | null;
    caption_zh: string | null;
    id: string;
    storage_path: string;
  }>;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {images.map((image) => (
          <a
            className="grid gap-2 rounded-md border p-3 transition-colors hover:bg-muted/40"
            href={imageUrl(image.storage_path)}
            key={image.id}
            rel="noreferrer"
            target="_blank"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={image.caption_en || image.caption_zh || title}
              className="aspect-square w-full rounded-md object-cover"
              src={imageUrl(image.storage_path)}
            />
            <div className="text-sm text-muted-foreground">
              {image.caption_en || image.caption_zh || "No caption"}
            </div>
          </a>
        ))}

        {images.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-3">
            No images available.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function PublicRepairPage({ params }: PublicRepairPageProps) {
  return (
    <Suspense>
      <PublicRepairContent params={params} />
    </Suspense>
  );
}
