import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Suspense } from "react";

import { AdminPageShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";

async function AdminContent() {
  await requireAdmin();

  return (
    <AdminPageShell
      subtitle="创建产品铭牌、管理维修记录、维护客户可见的追溯页面。"
      title="管理后台"
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
        {[
          {
            action: "进入产品列表",
            description: "浏览产品、创建铭牌序列号、管理二维码和维修记录。",
            href: "/admin/products",
            title: "产品追溯",
            variant: "contained" as const,
          },
          {
            action: "新增产品",
            description: "为本厂产品或客户送修产品创建唯一序列号和二维码。",
            href: "/admin/products/new",
            title: "新增产品",
            variant: "outlined" as const,
          },
        ].map((item) => (
          <Paper key={item.href} square variant="outlined" sx={{ flex: 1, p: 3 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{item.title}</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7, my: 2 }}>
              {item.description}
            </Typography>
            <Button href={item.href} variant={item.variant}>
              {item.action}
            </Button>
          </Paper>
        ))}
      </Stack>
    </AdminPageShell>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminContent />
    </Suspense>
  );
}
