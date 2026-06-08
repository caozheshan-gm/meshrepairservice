import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
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
  AdminInfoTile,
  AdminPageShell,
  AdminPanel,
} from "@/components/admin/admin-shell";
import { ProductQrCode } from "@/components/admin/qr-code";
import { requireAdmin } from "@/lib/auth/admin";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

const PRODUCT_STATUS_LABELS: Record<string, string> = {
  active: "公开使用",
  archived: "归档隐藏",
};

const REPAIR_STATUS_LABELS: Record<string, string> = {
  completed: "已完成 / 客户可见",
  draft: "草稿 / 客户不可见",
  archived: "归档隐藏 / 客户不可见",
};

async function ProductDetailContent({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "*,customers(company_name,contact_name,contact_email,contact_phone),repair_records(id,repair_number,repair_date,status,summary_zh,summary_en)",
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const repairs = [...product.repair_records].sort(
    (a, b) => b.repair_number - a.repair_number,
  );
  const isOwnProduct = product.product_source === "own";

  return (
    <AdminPageShell
      actions={
        <>
          <Button href={`/admin/products/${product.id}/edit`} variant="outlined">
            编辑产品
          </Button>
          <Button href={`/admin/products/${product.id}/repairs/new`} variant="contained">
            新增维修记录
          </Button>
        </>
      }
      subtitle={product.serial_number}
      title="产品详情"
    >
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" } }}>
        <AdminPanel>
          <Stack spacing={2.5}>
            <Typography sx={{ fontSize: 22, fontWeight: 800 }}>二维码铭牌</Typography>
            <Box sx={{ mx: "auto", width: 240 }}>
              <ProductQrCode fileName={`${product.serial_number}-qr`} value={product.qr_url} />
            </Box>
            <Box>
              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                QR URL
              </Typography>
              <Typography sx={{ fontFamily: "monospace", fontSize: 13, overflowWrap: "anywhere" }}>
                {product.qr_url}
              </Typography>
            </Box>
          </Stack>
        </AdminPanel>

        <Stack spacing={3}>
          <AdminPanel>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 3 }}>
              <Chip label={product.product_source === "own" ? "本厂生产" : "客户送修"} />
              <Chip
                label={PRODUCT_STATUS_LABELS[product.status] ?? product.status}
                variant="outlined"
              />
            </Stack>
            <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" } }}>
              {isOwnProduct ? (
                <>
                  <AdminInfoTile label="产品类型" value={product.product_type} />
                  <AdminInfoTile label="材质" value={product.material} />
                  <AdminInfoTile label="尺寸" value={product.size} />
                  <AdminInfoTile label="生产日期" value={product.production_date} />
                  <AdminInfoTile label="生产 SKU" value={product.production_model} />
                  <AdminInfoTile label="生产批次" value={product.production_batch} />
                </>
              ) : (
                <>
                  <AdminInfoTile label="客户公司" value={product.customers?.company_name} />
                  <AdminInfoTile label="产品类型" value={product.product_type} />
                </>
              )}
            </Box>
          </AdminPanel>
        </Stack>
      </Box>

      <AdminPanel>
        <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 2 }}>维修记录</Typography>
        {repairs.length > 0 ? (
          <Timeline
            position="right"
            sx={{ m: 0, p: 0, "& .MuiTimelineItem-root:before": { display: "none" } }}
          >
            {repairs.map((repair, index) => (
              <TimelineItem key={repair.id}>
                <TimelineSeparator>
                  <TimelineDot color={repair.status === "completed" ? "primary" : "grey"} />
                  {index < repairs.length - 1 ? <TimelineConnector /> : null}
                </TimelineSeparator>
                <TimelineContent sx={{ pb: 2.5 }}>
                  <Link
                    href={`/admin/products/${product.id}/repairs/${repair.id}/edit`}
                    prefetch={false}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <Paper square variant="outlined" sx={{ p: 2.5 }}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800 }}>第 {repair.repair_number} 次维修</Typography>
                          <Typography color="text.secondary">{repair.repair_date || "未填写日期"}</Typography>
                        </Box>
                        <Chip label={REPAIR_STATUS_LABELS[repair.status] ?? repair.status} size="small" variant="outlined" />
                      </Stack>
                    </Paper>
                  </Link>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Box sx={{ border: "1px dashed", borderColor: "divider", color: "text.secondary", p: 4, textAlign: "center" }}>
            还没有维修记录。
          </Box>
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <Suspense>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
