import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageShell({
  actions,
  children,
  eyebrow = "HDS Control Panel",
  maxWidth = "lg",
  subtitle,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  eyebrow?: string;
  maxWidth?: "md" | "lg" | "xl";
  subtitle?: ReactNode;
  title: string;
}) {
  return (
    <Box sx={{ bgcolor: "#f6f7f9", minHeight: "100svh" }}>
      <Box sx={{ bgcolor: "#2b2b2b", height: 6 }} />
      <Box
        component="header"
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container
          maxWidth={maxWidth}
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            minHeight: 72,
          }}
        >
          <Stack direction="row" spacing={1.25}>
            {[
              ["/admin", "Dashboard"],
              ["/admin/products", "Products"],
              ["/", "Public lookup"],
            ].map(([href, label]) => (
              <Button href={href} key={href} size="small" variant="text">
                {label}
              </Button>
            ))}
          </Stack>
        </Container>
      </Box>
      <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ alignItems: { md: "flex-end" }, justifyContent: "space-between" }}
          >
            <Box>
              <Typography
                color="primary"
                sx={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", mb: 1, textTransform: "uppercase" }}
              >
                {eyebrow}
              </Typography>
              <Typography component="h1" sx={{ fontSize: { xs: 34, md: 46 }, fontWeight: 800, lineHeight: 1.08 }}>
                {title}
              </Typography>
              {subtitle ? (
                <Typography color="text.secondary" sx={{ mt: 1.25 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
            {actions ? <Stack direction="row" spacing={1.5}>{actions}</Stack> : null}
          </Stack>
          {children}
        </Stack>
      </Container>
    </Box>
  );
}

export function AdminPanel({ children }: { children: ReactNode }) {
  return (
    <Paper square variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
      {children}
    </Paper>
  );
}

export function AdminInfoTile({
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
      <Typography sx={{ fontWeight: 800 }}>{value || "未填写"}</Typography>
    </Box>
  );
}

export function TextLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link href={href} prefetch={false} style={{ color: "inherit", textDecoration: "none" }}>
      {children}
    </Link>
  );
}
