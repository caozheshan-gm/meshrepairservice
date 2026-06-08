import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { ReactNode } from "react";

export function PublicHeader({ children }: { children?: ReactNode }) {
  return (
    <>
      <Box sx={{ bgcolor: "#2b2b2b", height: 6 }} />
      <Box
        component="header"
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            minHeight: 96,
            py: 2,
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <Box
              component="span"
              sx={{
                alignItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "inline-flex",
                fontSize: 20,
                fontWeight: 800,
                height: 56,
                letterSpacing: 0.2,
                px: 3.5,
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              HDS Service
            </Box>
          </Link>
          {children ? <Box>{children}</Box> : null}
        </Container>
      </Box>
    </>
  );
}

export function PublicMain({
  children,
  maxWidth = "lg",
}: {
  children: ReactNode;
  maxWidth?: "md" | "lg";
}) {
  return (
    <Box component="main" sx={{ bgcolor: "background.default", minHeight: "100svh" }}>
      {children}
      <HemlockAboutSection maxWidth={maxWidth} />
    </Box>
  );
}

export function PageHero({
  eyebrow,
  meta,
  title,
}: {
  eyebrow: string;
  meta?: ReactNode;
  title: string;
}) {
  return (
    <Stack spacing={2.5} sx={{ maxWidth: 780 }}>
      <Typography
        color="primary"
        sx={{
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 42, md: 58 },
          fontWeight: 800,
          letterSpacing: 0,
          lineHeight: 1.06,
        }}
      >
        {title}
      </Typography>
      {meta ? (
        <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.8 }}>
          {meta}
        </Typography>
      ) : null}
    </Stack>
  );
}

export function LookupPanel({ children, side }: { children: ReactNode; side: ReactNode }) {
  return (
    <Paper
      square
      variant="outlined"
      sx={{
        display: "grid",
        gap: 4,
        gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) 300px" },
        p: { xs: 3, md: 4 },
      }}
    >
      <Box>{children}</Box>
      <Box
        sx={{
          borderColor: "divider",
          borderLeft: { md: "1px solid" },
          borderTop: { xs: "1px solid", md: 0 },
          pl: { md: 4 },
          pt: { xs: 3, md: 0 },
        }}
      >
        {side}
      </Box>
    </Paper>
  );
}

export function HemlockAboutSection({ maxWidth = "lg" }: { maxWidth?: "md" | "lg" }) {
  return (
    <Container maxWidth={maxWidth} sx={{ pb: 8, pt: 2 }}>
      <Paper
        square
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "grid",
          gap: { xs: 3, md: 5 },
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Typography component="h2" sx={{ fontSize: 34, fontWeight: 800, mb: 3 }}>
            About HDS
          </Typography>
          <Stack spacing={2.2}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.8 }}>
              Hemlock Drive Systems provides power transmission products and
              engineering support for customers across industrial applications.
            </Typography>
            <Typography sx={{ lineHeight: 1.8, opacity: 0.95 }}>
              This repair service page helps customers verify public repair
              history, completed service records, and available repair photos by
              product serial number.
            </Typography>
          </Stack>
          <Button
            color="secondary"
            href="https://www.hemlockus.com/"
            rel="noreferrer"
            sx={{ bgcolor: "white", color: "#222", mt: 4 }}
            target="_blank"
            variant="contained"
          >
            Visit Hemlock
          </Button>
        </Box>
        <Box
          sx={{
            bgcolor: "#f4f4f4",
            color: "text.primary",
            display: "grid",
            gap: 0,
            gridTemplateColumns: "1fr 1fr",
            p: { xs: 3, md: 4 },
          }}
        >
          {[
            ["Experience", "Power transmission industry support"],
            ["Service", "Public repair history and records"],
            ["Traceability", "Serial number based documentation"],
            ["Quality", "Completed repair status visibility"],
          ].map(([label, value], index) => (
            <Box key={label} sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>
                {label}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>
                {value}
              </Typography>
              {index < 2 ? null : null}
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  );
}

export function InfoTile({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <Box>
      <Typography color="text.secondary" sx={{ fontSize: 13, mb: 0.75 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{value || "Not provided"}</Typography>
    </Box>
  );
}
