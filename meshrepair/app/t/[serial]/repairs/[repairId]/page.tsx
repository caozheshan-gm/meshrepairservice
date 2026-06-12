import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  REPAIR_TASK_TEMPLATE_ROWS,
  type RepairTaskTemplateRow,
} from "@/components/admin/repair-task-template";
import {
  InfoTile,
  PageHero,
  PublicHeader,
  PublicMain,
} from "@/components/public/hemlock-public";
import { RepairTimeline } from "@/components/public/repair-timeline";
import { getPublicRepairRecord } from "@/lib/public-data";
import { publicProductTypeLabel } from "@/lib/public-labels";

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
    <PublicMain>
      <PublicHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack spacing={5}>
          <PageHero
            eyebrow="Repair tracking card"
            meta={
              <>
                <Box component="span" sx={{ fontFamily: "monospace" }}>
                  {product.serial_number}
                </Box>
                {" · "}
                Repair #{repair.repair_number}
              </>
            }
            title="Completed repair details"
          />

          <Paper square variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ justifyContent: "space-between", mb: 4 }}
            >
              <Box>
                <Typography component="h2" sx={{ fontSize: 24, fontWeight: 800 }}>
                  Repair #{repair.repair_number}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Public tracking card for this completed service record.
                </Typography>
              </Box>
              <Chip color="primary" label="Completed" sx={{ alignSelf: "flex-start" }} />
            </Stack>
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              }}
            >
              <InfoTile label="Received Date" value={repair.received_date} />
              <InfoTile label="Qualified Date" value={repair.repair_date} />
              <InfoTile label="Factory" value={repair.factory} />
              <InfoTile
                label="Product Type"
                value={publicProductTypeLabel(product.product_type)}
              />
              <InfoTile label="Serial Number" value={product.serial_number} />
              <InfoTile
                label="Customer Repair Batch No."
                value={repair.customer_repair_batch_no}
              />
            </Box>
          </Paper>

          <Paper square variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Typography component="h2" sx={{ fontSize: 24, fontWeight: 800, mb: 3 }}>
              Service Progress
            </Typography>
            <RepairTimeline
              entries={[
                {
                  date: repair.received_date || "Not provided",
                  description: "Product received by the service team.",
                  icon: "inspection",
                  status: "completed",
                  title: "Received",
                },
                {
                  description: "Product condition reviewed and service scope confirmed.",
                  icon: "inspection",
                  status: "completed",
                  title: "Inspection",
                },
                {
                  description: "Corrective actions completed according to the repair process.",
                  icon: "repair",
                  status: "completed",
                  title: "Repair",
                },
                {
                  date: repair.repair_date || "Not provided",
                  description: "Repair completed and qualified for public tracking.",
                  status: "completed",
                  title: "Qualified",
                },
              ]}
            />
          </Paper>

          <Paper square variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
            <Typography component="h2" sx={{ fontSize: 24, fontWeight: 800, mb: 3, px: { xs: 1, md: 0 } }}>
              Repair Items
            </Typography>
            <RepairCardTable tasks={tasks} />
          </Paper>

          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
            <ImageSection images={beforeImages} imageUrl={imageUrl} title="Before Repair" />
            <ImageSection images={afterImages} imageUrl={imageUrl} title="After Repair" />
          </Box>

          <Button
            href={`/t/${encodeURIComponent(product.serial_number)}`}
            sx={{ alignSelf: "flex-start" }}
            variant="outlined"
          >
            Back to repair history
          </Button>
        </Stack>
      </Container>
    </PublicMain>
  );
}

function RepairCardTable({
  tasks,
}: {
  tasks: Array<{
    action_en: string | null;
    description_en: string | null;
    id: string;
    process_name_zh: string | null;
    quantity: string | null;
  }>;
}) {
  const byProcess = new Map(tasks.map((task) => [task.process_name_zh, task]));
  const rows = REPAIR_TASK_TEMPLATE_ROWS.filter(
    (row) => !row.selectable || byProcess.has(row.processZh),
  );

  if (rows.length === 0) {
    return (
      <Box
        sx={{
          border: "1px dashed",
          borderColor: "divider",
          color: "text.secondary",
          p: 5,
          textAlign: "center",
        }}
      >
        No repair item details are available.
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} square variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            <TableCell sx={{ color: "primary.contrastText", fontWeight: 800 }}>
              Section
            </TableCell>
            <TableCell sx={{ color: "primary.contrastText", fontWeight: 800 }}>
              Process
            </TableCell>
            <TableCell sx={{ color: "primary.contrastText", fontWeight: 800 }}>
              Condition
            </TableCell>
            <TableCell sx={{ color: "primary.contrastText", fontWeight: 800 }}>
              Repair Method
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groupRows(rows).flatMap(([section, sectionRows]) =>
            sectionRows.map((row, index) => {
              const task = byProcess.get(row.processZh);
              return (
                <TableRow key={row.key}>
                  {index === 0 ? (
                    <TableCell
                      rowSpan={sectionRows.length}
                      sx={{ bgcolor: "#f7f7f7", fontWeight: 800, width: 180 }}
                    >
                      {sectionLabel(section)}
                    </TableCell>
                  ) : null}
                  <TableCell sx={{ fontWeight: 800 }}>{row.processEn}</TableCell>
                  <TableCell>
                    {task?.description_en || row.descriptionEn || "Not provided"}
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography>{task?.action_en || row.actionEn || "Not provided"}</Typography>
                      {task?.quantity ? (
                        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                          Quantity: {task.quantity}
                        </Typography>
                      ) : null}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            }),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function groupRows(rows: RepairTaskTemplateRow[]) {
  const groups: Array<[string, RepairTaskTemplateRow[]]> = [];

  for (const row of rows) {
    const group = groups.at(-1);
    if (group?.[0] === row.section) {
      group[1].push(row);
    } else {
      groups.push([row.section, [row]]);
    }
  }

  return groups;
}

function sectionLabel(section: string) {
  const labels: Record<string, string> = {
    产品清洗: "Cleaning",
    检验标记问题: "Inspection",
    维修制程: "Repair Process",
    复检: "Re-inspection",
    产品抛光清洗: "Polishing and Cleaning",
    "终检、包装": "Final Inspection",
  };

  return labels[section] ?? section;
}

function ImageSection({
  imageUrl,
  images,
  title,
}: {
  imageUrl: (storagePath: string) => string;
  images: Array<{
    id: string;
    storage_path: string;
  }>;
  title: string;
}) {
  return (
    <Paper square variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Typography component="h2" sx={{ fontSize: 22, fontWeight: 800, mb: 2 }}>
        {title}
      </Typography>
      {images.length > 0 ? (
        <ImageList cols={2} gap={12}>
          {images.map((image) => (
            <ImageListItem
              component="a"
              href={imageUrl(image.storage_path)}
              key={image.id}
              rel="noreferrer"
              sx={{ border: "1px solid", borderColor: "divider" }}
              target="_blank"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={title}
                loading="lazy"
                src={imageUrl(image.storage_path)}
                style={{ aspectRatio: "1 / 1", objectFit: "cover", width: "100%" }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            color: "text.secondary",
            p: 5,
            textAlign: "center",
          }}
        >
          No images available.
        </Box>
      )}
    </Paper>
  );
}

export default function PublicRepairPage({ params }: PublicRepairPageProps) {
  return (
    <Suspense>
      <PublicRepairContent params={params} />
    </Suspense>
  );
}
