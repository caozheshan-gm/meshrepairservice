import { LoginForm } from "@/components/login-form";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Suspense } from "react";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

async function LoginContent({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;

  return (
    <Box sx={{ bgcolor: "#f6f7f9", minHeight: "100svh" }}>
      <Box sx={{ bgcolor: "#2b2b2b", height: 6 }} />
      <Container
        maxWidth="lg"
        sx={{
          alignItems: "center",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 420px" },
          minHeight: "calc(100svh - 6px)",
          py: 6,
        }}
      >
        <Box sx={{ display: { xs: "none", md: "block" }, pr: 8 }}>
          <Typography color="primary" sx={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.2em", mb: 2, textTransform: "uppercase" }}>
            HDS Control Panel
          </Typography>
          <Typography component="h1" sx={{ fontSize: 58, fontWeight: 800, lineHeight: 1.05 }}>
            Repair service administration
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.8, mt: 3 }}>
            Sign in to manage product serial numbers, repair records, public
            tracking cards, and customer-visible documentation.
          </Typography>
        </Box>
        <Paper square variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
          <LoginForm redirectTo={redirectTo} />
        </Paper>
      </Container>
    </Box>
  );
}

export default function Page({ searchParams }: LoginPageProps) {
  return (
    <Suspense>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
