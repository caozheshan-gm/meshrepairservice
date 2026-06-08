import { Suspense } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { AuthButton } from "@/components/auth-button";
import {
  LookupPanel,
  PageHero,
  PublicHeader,
  PublicMain,
} from "@/components/public/hemlock-public";
import { SerialSearchForm } from "@/components/serial-search-form";

export default function Home() {
  return (
    <PublicMain>
      <PublicHeader>
        <Suspense>
          <AuthButton showLoggedOut={false} />
        </Suspense>
      </PublicHeader>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={{ xs: 5, md: 7 }}>
          <PageHero
            eyebrow="Product support"
            meta={
              <>
                Enter the serial number printed on the product nameplate to view
                public service records, completed repair work, and available
                before and after documentation.
              </>
            }
            title="Check repair history by serial number"
          />

          <LookupPanel
            side={
              <Stack spacing={2.4}>
                <Typography sx={{ fontWeight: 800 }}>What you can view</Typography>
                {[
                  "Product identification and nameplate details",
                  "Completed repair records by date",
                  "Repair items, results, and service notes",
                  "Before and after repair photos when available",
                ].map((item) => (
                  <Typography color="text.secondary" key={item} sx={{ lineHeight: 1.55 }}>
                    {item}
                  </Typography>
                ))}
              </Stack>
            }
          >
            <Box sx={{ maxWidth: 620 }}>
              <Typography component="h2" sx={{ fontSize: 24, fontWeight: 800, mb: 1.5 }}>
                Repair status lookup
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
                Use the exact serial number from the product label. Search
                results only include active products and completed public repair
                records.
              </Typography>
              <SerialSearchForm buttonLabel="Check status" />
            </Box>
          </LookupPanel>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            }}
          >
            {[
              ["Serial number", "Match the full value shown on the product nameplate."],
              ["Repair records", "Public records are shown after the repair is completed."],
              ["Service support", "Contact the service team if a serial number cannot be found."],
            ].map(([title, description]) => (
              <Box
                key={title}
                sx={{ borderLeft: "4px solid", borderColor: "primary.main", pl: 2 }}
              >
                <Typography sx={{ fontWeight: 800 }}>{title}</Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7, mt: 0.75 }}>
                  {description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </Container>
    </PublicMain>
  );
}
