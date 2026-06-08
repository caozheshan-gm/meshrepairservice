import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  InfoTile,
  PageHero,
  PublicHeader,
  PublicMain,
} from "@/components/public/hemlock-public";
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

            {repairs.length > 0 ? (
              <Timeline
                position="right"
                sx={{
                  m: 0,
                  mt: 2,
                  p: 0,
                  "& .MuiTimelineItem-root:before": { display: "none" },
                }}
              >
                {repairs.map((repair, index) => (
                  <TimelineItem key={repair.id}>
                    <TimelineSeparator>
                      <TimelineDot color="primary" variant="filled" />
                      {index < repairs.length - 1 ? <TimelineConnector /> : null}
                    </TimelineSeparator>
                    <TimelineContent sx={{ pb: 3 }}>
                      <Link
                        href={`/t/${encodeURIComponent(product.serial_number)}/repairs/${repair.id}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        <Paper
                          square
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            color: "text.primary",
                            display: "block",
                            p: 3,
                            transition: "border-color .15s ease, box-shadow .15s ease",
                            "&:hover": {
                              borderColor: "primary.main",
                              boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
                            },
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            sx={{ justifyContent: "space-between" }}
                          >
                            <Box>
                              <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                                Repair #{repair.repair_number}
                              </Typography>
                              <Typography color="text.secondary" sx={{ mt: 1 }}>
                                {repair.summary_en ||
                                  repair.public_notes_en ||
                                  "Repair details available."}
                              </Typography>
                            </Box>
                            <Stack spacing={1} sx={{ alignItems: { xs: "flex-start", md: "flex-end" } }}>
                              <Chip label="Completed" size="small" />
                              <Typography color="text.secondary" sx={{ fontFamily: "monospace" }}>
                                {repair.repair_date}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Link>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <Box
                sx={{
                  border: "1px dashed",
                  borderColor: "divider",
                  color: "text.secondary",
                  mt: 3,
                  p: 5,
                  textAlign: "center",
                }}
              >
                No public repair records are available for this product yet.
              </Box>
            )}
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
