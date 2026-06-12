import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditNoteIcon from "@mui/icons-material/EditNote";
import InventoryIcon from "@mui/icons-material/Inventory2";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { ReactNode } from "react";

export type RepairTimelineEntry = {
  actions?: ReactNode;
  badge?: ReactNode;
  date?: ReactNode;
  description?: ReactNode;
  href?: string;
  icon?: "completed" | "draft" | "inspection" | "repair";
  status?: "completed" | "draft" | "archived" | "neutral";
  title: ReactNode;
};

const statusColor = {
  archived: "grey",
  completed: "primary",
  draft: "grey",
  neutral: "grey",
} as const;

function iconFor(entry: RepairTimelineEntry) {
  if (entry.icon === "inspection") {
    return <InventoryIcon fontSize="small" />;
  }

  if (entry.icon === "repair") {
    return <EditNoteIcon fontSize="small" />;
  }

  if (entry.status === "completed" || entry.icon === "completed") {
    return <CheckCircleIcon fontSize="small" />;
  }

  return <RadioButtonUncheckedIcon fontSize="small" />;
}

export function RepairTimeline({
  emptyText = "No records are available.",
  entries,
  interactive = false,
}: {
  emptyText?: string;
  entries: RepairTimelineEntry[];
  interactive?: boolean;
}) {
  if (entries.length === 0) {
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
        {emptyText}
      </Box>
    );
  }

  return (
    <Timeline
      position="right"
      sx={{
        m: 0,
        p: 0,
        "& .MuiTimelineItem-root:before": { display: "none" },
      }}
    >
      {entries.map((entry, index) => {
        const content = (
          <Paper
            square
            variant="outlined"
            sx={{
              color: "text.primary",
              p: { xs: 2.25, md: 2.75 },
              transition: "border-color .15s ease, box-shadow .15s ease",
              ...(interactive
                ? {
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
                    },
                  }
                : null),
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ justifyContent: "space-between" }}
            >
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  {entry.title}
                </Typography>
                {entry.description ? (
                  <Typography color="text.secondary" sx={{ lineHeight: 1.65, mt: 0.75 }}>
                    {entry.description}
                  </Typography>
                ) : null}
              </Box>
              <Stack spacing={1} sx={{ alignItems: { xs: "flex-start", md: "flex-end" } }}>
                {entry.badge ? (
                  entry.badge
                ) : entry.status ? (
                  <Chip label={entry.status} size="small" variant="outlined" />
                ) : null}
                {entry.date ? (
                  <Typography color="text.secondary" sx={{ fontFamily: "monospace", fontSize: 13 }}>
                    {entry.date}
                  </Typography>
                ) : null}
                {entry.actions ? (
                  <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                    {entry.actions}
                  </Stack>
                ) : null}
              </Stack>
            </Stack>
          </Paper>
        );

        return (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot
                color={statusColor[entry.status ?? "neutral"]}
                sx={{
                  alignItems: "center",
                  display: "inline-flex",
                  height: 36,
                  justifyContent: "center",
                  mt: 1,
                  width: 36,
                }}
              >
                {iconFor(entry)}
              </TimelineDot>
              {index < entries.length - 1 ? <TimelineConnector /> : null}
            </TimelineSeparator>
            <TimelineContent sx={{ pb: index < entries.length - 1 ? 3 : 0 }}>
              {entry.href && !entry.actions ? (
                <Link href={entry.href} prefetch={false} style={{ color: "inherit", textDecoration: "none" }}>
                  {content}
                </Link>
              ) : (
                content
              )}
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
