import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { Suspense } from "react";

import { AdminPageShell, AdminPanel } from "@/components/admin/admin-shell";
import {
  ProductsDataGrid,
  type ProductGridRow,
} from "@/components/admin/products-data-grid";
import { requireAdmin } from "@/lib/auth/admin";

type ProductsPageProps = {
  searchParams: Promise<{
    serial?: string;
    source?: string;
    customer?: string;
  }>;
};

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("products")
    .select(
      "id,serial_number,product_source,status,product_type,created_at,customer_id,customers(company_name),repair_records(id,repair_date)",
    )
    .order("created_at", { ascending: false });

  if (params.serial) {
    query = query.ilike("serial_number", `%${params.serial}%`);
  }

  if (params.source === "own" || params.source === "customer") {
    query = query.eq("product_source", params.source);
  }

  const { data: products, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const filteredProducts = params.customer
    ? products.filter((product) =>
        product.customers?.company_name
          ?.toLowerCase()
          .includes(params.customer!.toLowerCase()),
      )
    : products;

  const rows: ProductGridRow[] = filteredProducts.map((product) => {
    const latestRepairDate =
      product.repair_records
        .map((record) => record.repair_date)
        .filter(Boolean)
        .sort()
        .at(-1) ?? "";

    return {
      customer:
        product.product_source === "own"
          ? "本厂生产"
          : (product.customers?.company_name ?? "无客户公司"),
      id: product.id,
      latestRepairDate,
      productSource: product.product_source,
      productType: product.product_type ?? "未填写",
      repairCount: product.repair_records.length,
      serialNumber: product.serial_number,
      status: product.status,
    };
  });

  return (
    <AdminPageShell
      actions={
        <Button href="/admin/products/new" variant="contained">
          新增产品
        </Button>
      }
      maxWidth="xl"
      subtitle="浏览产品、客户送修件、维修次数和最近维修日期。"
      title="产品列表"
    >
      <AdminPanel>
        <Box component="form">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <TextField
              defaultValue={params.serial ?? ""}
              label="序列号"
              name="serial"
              placeholder="REP-2026-06"
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              defaultValue={params.source ?? ""}
              label="产品来源"
              name="source"
              select
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="customer">客户送修</MenuItem>
              <MenuItem value="own">本厂生产</MenuItem>
            </TextField>
            <TextField
              defaultValue={params.customer ?? ""}
              label="客户公司"
              name="customer"
              size="small"
              sx={{ flex: 1 }}
            />
            <Button type="submit" variant="outlined">
              筛选
            </Button>
          </Stack>
        </Box>
        <ProductsDataGrid rows={rows} />
      </AdminPanel>
    </AdminPageShell>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}
