import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  InfoTile,
  PageHero,
  PublicHeader,
  PublicMain,
} from "@/components/public/hemlock-public";
import { RepairTimeline } from "@/components/public/repair-timeline";
import { getPublicProductBySerial } from "@/lib/public-data";
import {
  publicMaterialLabel,
  publicProductTypeLabel,
} from "@/lib/public-labels";

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
    <PublicMain>
      <PublicHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack spacing={5}>
          <PageHero
            eyebrow="Repair history"
            meta={
              <Box component="span" sx={{ fontFamily: "monospace" }}>
                {product.serial_number}
              </Box>
            }
            title="Product service records"
          />

          <Paper square variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              sx={{ justifyContent: "space-between", mb: 4 }}
            >
              <Box>
                <Typography component="h2" sx={{ fontSize: 24, fontWeight: 800 }}>
                  Product Traceability
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Public repair records linked to this product nameplate.
                </Typography>
              </Box>
              <Chip
                color="primary"
                label={`${repairs.length} completed repair${repairs.length === 1 ? "" : "s"}`}
                sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              }}
            >
              <InfoTile label="Serial Number" value={product.serial_number} />
              <InfoTile
                label="Product Source"
                value={
                  product.product_source === "own"
                    ? "Manufactured Product"
                    : "Customer Supplied Product"
                }
              />
              <InfoTile
                label="Product Type"
                value={publicProductTypeLabel(product.product_type)}
              />
              {product.product_source === "own" ? (
                <>
                  <InfoTile label="Production Date" value={product.production_date} />
                  <InfoTile label="Model" value={product.production_model} />
                  <InfoTile label="Material" value={publicMaterialLabel(product.material)} />
                  <InfoTile label="Size" value={product.size} />
                </>
              ) : null}
            </Box>
          </Paper>

          <Paper square variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
            <Typography component="h2" sx={{ fontSize: 24, fontWeight: 800, px: { xs: 1, md: 0 } }}>
              Repair Records
            </Typography>

            <Box sx={{ mt: 3 }}>
              <RepairTimeline
                emptyText="No public repair records are available for this product yet."
                entries={repairs.map((repair) => ({
                  badge: (
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      {repair.customer_repair_batch_no ? (
                        <Chip
                          label={`Batch ${repair.customer_repair_batch_no}`}
                          size="small"
                          variant="outlined"
                        />
                      ) : null}
                      <Chip label="Completed" size="small" />
                    </Stack>
                  ),
                  date: repair.repair_date,
                  description:
                    repair.summary_en ||
                    repair.public_notes_en ||
                    "Repair details available.",
                  href: `/t/${encodeURIComponent(product.serial_number)}/repairs/${repair.id}`,
                  status: "completed",
                  title: `Repair #${repair.repair_number}`,
                }))}
                interactive
              />
            </Box>
          </Paper>

          <Button href="/" sx={{ alignSelf: "flex-start" }} variant="outlined">
            Search another serial
          </Button>
        </Stack>
      </Container>
    </PublicMain>
  );
}

export default function TracePage({ params }: TracePageProps) {
  return (
    <Suspense>
      <TraceContent params={params} />
    </Suspense>
  );
}
