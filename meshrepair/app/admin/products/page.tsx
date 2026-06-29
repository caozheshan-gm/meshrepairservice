import Button from "@mui/material/Button";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { deleteProducts } from "@/app/admin/products/actions";
import { AdminPageShell, AdminPanel } from "@/components/admin/admin-shell";
import {
  ProductsDataGrid,
  type ProductFilterOptionRow,
  type ProductGridRow,
} from "@/components/admin/products-data-grid";
import { requireAdmin } from "@/lib/auth/admin";
import { normalizeSerialSearch } from "@/lib/serial-search";

type ProductsPageProps = {
  searchParams: Promise<{
    customer?: string;
    dir?: string;
    material?: string;
    page?: string;
    pageSize?: string;
    productionBatch?: string;
    productionDate?: string;
    productionModel?: string;
    productType?: string;
    q?: string;
    repairBatch?: string;
    sort?: string;
    source?: string;
    size?: string;
  }>;
};

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SORT_COLUMNS: Record<string, string> = {
  created_at: "created_at",
  latest_repair_date: "latest_repair_date",
  repair_count: "repair_count",
  serial_number: "serial_number",
};

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const page = Math.max(Number(params.page ?? "1") || 1, 1);
  const requestedPageSize = Number(params.pageSize ?? DEFAULT_PAGE_SIZE);
  const pageSize = PAGE_SIZE_OPTIONS.includes(requestedPageSize)
    ? requestedPageSize
    : DEFAULT_PAGE_SIZE;
  const sort = SORT_COLUMNS[params.sort ?? "created_at"]
    ? (params.sort ?? "created_at")
    : "created_at";
  const dir = params.dir === "asc" ? "asc" : "desc";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const productListClient = supabase as never as AdminProductListClient;
  const repairBatch = params.repairBatch?.trim();
  let query = repairBatch
    ? productListClient.rpc(
        "search_admin_product_list_by_repair_batch",
        { repair_batch_search: repairBatch },
        { count: "exact" },
      )
    : productListClient.from("admin_product_list").select(
      "id,serial_number,product_source,status,product_type,created_at,customer_id,customer_company,material,size,production_date,production_model,production_batch,repair_count,latest_repair_date,repair_batch_numbers",
      { count: "exact" },
    );

  if (params.source === "own" || params.source === "customer") {
    query = query.eq("product_source", params.source);
  }

  if (params.productType === "__empty") {
    query = query.is("product_type", null);
  } else if (params.productType) {
    query = query.eq("product_type", params.productType);
  }

  if (params.material === "__empty") {
    query = query.is("material", null);
  } else if (params.material) {
    query = query.eq("material", params.material);
  }

  if (params.size === "__empty") {
    query = query.is("size", null);
  } else if (params.size) {
    query = query.eq("size", params.size);
  }

  if (params.productionDate) {
    query = query.eq("production_date", params.productionDate);
  }

  if (params.productionModel === "__empty") {
    query = query.is("production_model", null);
  } else if (params.productionModel) {
    query = query.eq("production_model", params.productionModel);
  }

  if (params.productionBatch === "__empty") {
    query = query.is("production_batch", null);
  } else if (params.productionBatch) {
    query = query.eq("production_batch", params.productionBatch);
  }

  if (params.customer === "__empty") {
    query = query.is("customer_company", null);
  } else if (params.customer) {
    query = query.eq("customer_company", params.customer);
  }

  const normalizedQ = normalizeSerialSearch(params.q ?? "");
  if (normalizedQ) {
    query = query.ilike("serial_number_normalized", `%${normalizedQ}%`);
  }

  const [productsResult, filterOptionsResult] = await Promise.all([
    query
      .order(SORT_COLUMNS[sort], {
        ascending: dir === "asc",
        nullsFirst: false,
      })
      .range(from, to),
    (supabase as never as AdminProductListClient)
      .from("admin_product_list")
      .select(
        "id,product_source,product_type,material,size,production_model,production_batch,customer_company",
      )
      .order("created_at", { ascending: false }),
  ]);

  const { data: products, error, count } = productsResult;

  if (error) {
    throw new Error(error.message);
  }

  if (filterOptionsResult.error) {
    throw new Error(filterOptionsResult.error.message);
  }

  const totalCount = count ?? 0;
  const maxPage = Math.max(Math.ceil(totalCount / pageSize), 1);
  if (page > maxPage) {
    redirect(buildProductsPageUrl(params, maxPage, pageSize, sort, dir));
  }

  const filterOptionRows: ProductFilterOptionRow[] = filterOptionsResult.data.map(
    (product) => ({
      customer: product.customer_company ?? "",
      material: product.material ?? "",
      productionBatch: product.production_batch ?? "",
      productionModel: product.production_model ?? "",
      productSource: product.product_source,
      productType: product.product_type ?? "",
      size: product.size ?? "",
    }),
  );

  const rows: ProductGridRow[] = products.map((product) => ({
    createdAt: product.created_at,
    customer:
      product.product_source === "own"
        ? "本厂生产"
        : (product.customer_company ?? "无客户公司"),
    id: product.id,
    latestRepairDate: product.latest_repair_date ?? "",
    material: product.material ?? "",
    productionBatch: product.production_batch ?? "",
    productionDate: product.production_date ?? "",
    productionModel: product.production_model ?? "",
    productSource: product.product_source,
    productType: product.product_type ?? "未填写",
    repairCount: product.repair_count,
    serialNumber: product.serial_number,
    size: product.size ?? "",
    status: product.status,
  }));

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
        <ProductsDataGrid
          deleteAction={deleteProducts}
          filterOptionRows={filterOptionRows}
          filters={{ ...params, dir, page: String(page), pageSize: String(pageSize), sort }}
          page={page}
          pageSize={pageSize}
          rows={rows}
          sortDirection={dir}
          sortField={sort}
          totalCount={totalCount}
        />
      </AdminPanel>
    </AdminPageShell>
  );
}

function buildProductsPageUrl(
  params: ProductsPageProps["searchParams"] extends Promise<infer T> ? T : never,
  page: number,
  pageSize: number,
  sort: string,
  dir: "asc" | "desc",
) {
  const nextParams = new URLSearchParams();
  const entries = {
    ...params,
    dir,
    page: page === 1 ? "" : String(page),
    pageSize: String(pageSize),
    sort,
  };

  Object.entries(entries).forEach(([key, value]) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (normalized) {
      nextParams.set(key, normalized);
    }
  });

  const queryString = nextParams.toString();
  return queryString ? `/admin/products?${queryString}` : "/admin/products";
}

type AdminProductListRow = {
  created_at: string;
  customer_company: string | null;
  customer_id: string | null;
  id: string;
  latest_repair_date: string | null;
  material: string | null;
  product_source: string;
  product_type: string | null;
  production_batch: string | null;
  production_date: string | null;
  production_model: string | null;
  repair_count: number;
  repair_batch_numbers: string;
  serial_number: string;
  serial_number_normalized: string;
  size: string | null;
  status: string;
};

type AdminProductListClient = {
  from(table: "admin_product_list"): {
    select(
      columns: string,
      options?: { count?: "exact" },
    ): AdminProductListQuery;
  };
  rpc(
    functionName: "search_admin_product_list_by_repair_batch",
    args: { repair_batch_search: string },
    options: { count: "exact" },
  ): AdminProductListQuery;
};

type AdminProductListQuery = {
  data: AdminProductListRow[];
  error: { message: string } | null;
  count: number | null;
  eq(column: string, value: string): AdminProductListQuery;
  ilike(column: string, value: string): AdminProductListQuery;
  is(column: string, value: null): AdminProductListQuery;
  limit(count: number): AdminProductListQuery;
  order(
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ): AdminProductListQuery;
  range(from: number, to: number): Promise<{
    data: AdminProductListRow[];
    error: { message: string } | null;
    count: number | null;
  }>;
  then<TResult1 = {
    data: AdminProductListRow[];
    error: { message: string } | null;
    count: number | null;
  }, TResult2 = never>(
    onfulfilled?:
      | ((
          value: {
            data: AdminProductListRow[];
            error: { message: string } | null;
            count: number | null;
          },
        ) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2>;
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}
