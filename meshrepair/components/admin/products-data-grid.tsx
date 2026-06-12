"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Divider from "@mui/material/Divider";
import { BlockingOverlay } from "@/components/ui/blocking-overlay";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

export type ProductFilters = {
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
  sort?: string;
  source?: string;
  size?: string;
};

export type ProductFilterOptionRow = {
  customer: string;
  material: string;
  productionBatch: string;
  productionModel: string;
  productSource: "customer" | "own" | string;
  productType: string;
  size: string;
};

export type ProductGridRow = {
  createdAt: string;
  customer: string;
  id: string;
  latestRepairDate: string;
  material: string;
  productionBatch: string;
  productionDate: string;
  productionModel: string;
  productSource: "customer" | "own" | string;
  productType: string;
  repairCount: number;
  serialNumber: string;
  size: string;
  status: string;
};

export function ProductsDataGrid({
  deleteAction,
  filterOptionRows,
  filters,
  page,
  pageSize,
  rows,
  sortDirection,
  sortField,
  totalCount,
}: {
  deleteAction: (formData: FormData) => void;
  filterOptionRows: ProductFilterOptionRow[];
  filters: ProductFilters;
  page: number;
  pageSize: number;
  rows: ProductGridRow[];
  sortDirection: "asc" | "desc";
  sortField: string;
  totalCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isRouting, startRouting] = useTransition();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteRows, setDeleteRows] = useState<ProductGridRow[]>([]);
  const [filterDraft, setFilterDraft] = useState<ProductFilters>(filters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState(filters.q ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeRow, setActiveRow] = useState<ProductGridRow | null>(null);

  useEffect(() => {
    setFilterDraft(filters);
    setQuery(filters.q ?? "");
    setSelected(new Set());
  }, [filters]);

  const allVisibleSelected =
    rows.length > 0 && rows.every((row) => selected.has(row.id));

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleVisibleRows() {
    setSelected((current) => {
      const next = new Set(current);

      if (allVisibleSelected) {
        rows.forEach((row) => next.delete(row.id));
      } else {
        rows.forEach((row) => next.add(row.id));
      }

      return next;
    });
  }

  function closeMenu() {
    setAnchorEl(null);
    setActiveRow(null);
  }

  function openDeleteDialog(rowsToDelete: ProductGridRow[]) {
    closeMenu();
    setDeleteRows(rowsToDelete);
  }

  function updateUrl(nextFilters: ProductFilters, options: { resetPage?: boolean } = {}) {
    const params = new URLSearchParams();
    const next = options.resetPage ? { ...nextFilters, page: "1" } : nextFilters;

    Object.entries(next).forEach(([key, value]) => {
      const normalized = typeof value === "string" ? value.trim() : "";
      if (normalized && !(key === "page" && normalized === "1")) {
        params.set(key, normalized);
      }
    });

    const queryString = params.toString();
    startRouting(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function applyFilters() {
    const nextFilters = { ...filterDraft, q: query };
    setFilterOpen(false);
    updateUrl(nextFilters, { resetPage: true });
  }

  function clearFilters() {
    const nextFilters: ProductFilters = {};
    setFilterDraft(nextFilters);
    setQuery("");
    setFilterOpen(false);
    updateUrl(nextFilters, { resetPage: true });
  }

  function removeFilter(key: keyof ProductFilters) {
    const nextFilters = { ...filterDraft, [key]: "" };
    if (key === "q") {
      setQuery("");
    }
    setFilterDraft(nextFilters);
    updateUrl({ ...nextFilters, q: key === "q" ? "" : query }, { resetPage: true });
  }

  const selectedRows = rows.filter((row) => selected.has(row.id));
  const activeFilters = filterEntries({ ...filters, q: query });
  const emptyRows = rows.length === 0;

  function changeSort(nextSort: string) {
    const nextDirection =
      sortField === nextSort && sortDirection === "desc" ? "asc" : "desc";
    updateUrl(
      {
        ...filterDraft,
        dir: nextDirection,
        page: "1",
        pageSize: String(pageSize),
        q: query,
        sort: nextSort,
      },
      { resetPage: true },
    );
  }

  function changePage(nextPage: number) {
    updateUrl({
      ...filterDraft,
      dir: sortDirection,
      page: String(nextPage + 1),
      pageSize: String(pageSize),
      q: query,
      sort: sortField,
    });
  }

  function changePageSize(nextPageSize: number) {
    updateUrl(
      {
        ...filterDraft,
        dir: sortDirection,
        page: "1",
        pageSize: String(nextPageSize),
        q: query,
        sort: sortField,
      },
      { resetPage: true },
    );
  }

  return (
    <Paper square variant="outlined" sx={{ overflow: "hidden" }}>
      <BlockingOverlay message="正在加载筛选结果..." open={isRouting} />
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { md: "center" },
          borderBottom: "1px solid",
          borderColor: "divider",
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography sx={{ fontWeight: 800 }}>产品数据</Typography>
          <Chip label={`${rows.length} / ${totalCount}`} size="small" />
          {selected.size > 0 ? (
            <Chip color="primary" label={`已选择 ${selected.size}`} size="small" />
          ) : null}
        </Stack>
        <Stack direction="row" spacing={1.5}>
          {selectedRows.length > 0 ? (
            <Button
              color="error"
              onClick={() => openDeleteDialog(selectedRows)}
              size="small"
              startIcon={<DeleteOutlineIcon />}
              variant="outlined"
            >
              批量删除
            </Button>
          ) : null}
          <TextField
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              if (!nextQuery.trim() && filters.q) {
                updateUrl({ ...filterDraft, q: "" }, { resetPage: true });
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateUrl({ ...filterDraft, q: query }, { resetPage: true });
              }
            }}
            placeholder="搜索序列号"
            size="small"
            sx={{ minWidth: { xs: "100%", md: 360 } }}
            value={query}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            onClick={() => setFilterOpen(true)}
            size="small"
            startIcon={<FilterListIcon />}
            variant={activeFilters.length > 0 ? "contained" : "outlined"}
          >
            筛选
          </Button>
          <Tooltip title="新增产品">
            <IconButton color="primary" onClick={() => router.push("/admin/products/new")}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {activeFilters.length > 0 ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            flexWrap: "wrap",
            gap: 1,
            p: 2,
          }}
        >
          {activeFilters.map((filter) => (
            <Chip
              key={filter.key}
              label={`${filter.label}: ${filter.value}`}
              onDelete={() => removeFilter(filter.key)}
              size="small"
              variant="outlined"
            />
          ))}
          <Button onClick={clearFilters} size="small" variant="text">
            清除全部
          </Button>
        </Stack>
      ) : null}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f2f2f2" }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allVisibleSelected}
                  indeterminate={selected.size > 0 && !allVisibleSelected}
                  onChange={toggleVisibleRows}
                  size="small"
                />
              </TableCell>
              <SortableHeader
                activeSort={sortField}
                direction={sortDirection}
                field="serial_number"
                label="序列号"
                onSort={changeSort}
              />
              <TableCell sx={{ fontWeight: 800 }}>产品类型</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>来源 / 客户</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>来源</TableCell>
              <SortableHeader
                activeSort={sortField}
                direction={sortDirection}
                field="created_at"
                label="添加时间"
                onSort={changeSort}
              />
              <SortableHeader
                activeSort={sortField}
                align="right"
                direction={sortDirection}
                field="repair_count"
                label="维修次数"
                onSort={changeSort}
              />
              <SortableHeader
                activeSort={sortField}
                direction={sortDirection}
                field="latest_repair_date"
                label="最近维修"
                onSort={changeSort}
              />
              <TableCell sx={{ fontWeight: 800 }}>状态</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.id} sx={{ cursor: "pointer" }}>
                <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    size="small"
                  />
                </TableCell>
                <TableCell onClick={() => router.push(`/admin/products/${row.id}`)}>
                  <Typography sx={{ fontFamily: "monospace", fontWeight: 800 }}>
                    {row.serialNumber}
                  </Typography>
                </TableCell>
                <TableCell onClick={() => router.push(`/admin/products/${row.id}`)}>
                  {row.productType}
                </TableCell>
                <TableCell onClick={() => router.push(`/admin/products/${row.id}`)}>
                  {row.customer}
                </TableCell>
                <TableCell onClick={() => router.push(`/admin/products/${row.id}`)}>
                  <Chip
                    color={row.productSource === "own" ? "secondary" : "primary"}
                    label={row.productSource === "own" ? "本厂生产" : "客户送修"}
                    size="small"
                    variant={row.productSource === "own" ? "outlined" : "filled"}
                  />
                </TableCell>
                <TableCell onClick={() => router.push(`/admin/products/${row.id}`)}>
                  {formatDate(row.createdAt)}
                </TableCell>
                <TableCell align="right" onClick={() => router.push(`/admin/products/${row.id}`)}>
                  {row.repairCount}
                </TableCell>
                <TableCell onClick={() => router.push(`/admin/products/${row.id}`)}>
                  {row.latestRepairDate || "无"}
                </TableCell>
                <TableCell onClick={() => router.push(`/admin/products/${row.id}`)}>
                  <Chip
                    label={row.status === "active" ? "公开使用" : "归档隐藏"}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                  <Tooltip title="更多操作">
                    <IconButton
                      onClick={(event) => {
                        setActiveRow(row);
                        setAnchorEl(event.currentTarget);
                      }}
                      size="small"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {emptyRows ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box sx={{ color: "text.secondary", p: 5, textAlign: "center" }}>
                    {activeFilters.length > 0
                      ? "没有匹配当前筛选条件的产品。"
                      : "暂无产品。可以先新增一件产品生成序列号和二维码。"}
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} / ${count === -1 ? `超过 ${to}` : count}`
        }
        labelRowsPerPage="每页"
        onPageChange={(_, nextPage) => changePage(nextPage)}
        onRowsPerPageChange={(event) => changePageSize(Number(event.target.value))}
        page={page - 1}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      <Menu
        anchorEl={anchorEl}
        onClose={closeMenu}
        open={Boolean(anchorEl)}
      >
        <MenuItem
          onClick={() => {
            if (activeRow) {
              router.push(`/admin/products/${activeRow.id}`);
            }
          }}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1.25 }} />
          查看详情
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeRow) {
              router.push(`/admin/products/${activeRow.id}/repairs/new`);
            }
          }}
        >
          <AddIcon fontSize="small" sx={{ mr: 1.25 }} />
          新增维修记录
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeRow) {
              openDeleteDialog([activeRow]);
            }
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1.25 }} />
          删除产品
        </MenuItem>
      </Menu>

      <ProductDeleteDialog
        action={deleteAction}
        onClose={() => setDeleteRows([])}
        rows={deleteRows}
      />
      <ProductFiltersDrawer
        draft={filterDraft}
        filterOptionRows={filterOptionRows}
        onApply={applyFilters}
        onChange={setFilterDraft}
        onClear={clearFilters}
        onClose={() => setFilterOpen(false)}
        open={filterOpen}
      />
    </Paper>
  );
}

function SortableHeader({
  activeSort,
  align,
  direction,
  field,
  label,
  onSort,
}: {
  activeSort: string;
  align?: "left" | "right";
  direction: "asc" | "desc";
  field: string;
  label: string;
  onSort: (field: string) => void;
}) {
  return (
    <TableCell align={align} sx={{ fontWeight: 800 }}>
      <TableSortLabel
        active={activeSort === field}
        direction={activeSort === field ? direction : "desc"}
        onClick={() => onSort(field)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function ProductFiltersDrawer({
  draft,
  filterOptionRows,
  onApply,
  onChange,
  onClear,
  onClose,
  open,
}: {
  draft: ProductFilters;
  filterOptionRows: ProductFilterOptionRow[];
  onApply: () => void;
  onChange: (filters: ProductFilters) => void;
  onClear: () => void;
  onClose: () => void;
  open: boolean;
}) {
  const source = draft.source ?? "";
  const optionRows =
    source === "own" || source === "customer"
      ? filterOptionRows.filter((row) => row.productSource === source)
      : filterOptionRows;
  const productTypeOptions = uniqueOptions(
    optionRows.map((row) => row.productType),
    "未填写产品类型",
  );
  const customerOptions = uniqueOptions(
    optionRows
      .filter((row) => row.productSource === "customer")
      .map((row) => row.customer),
    "无客户公司",
  );
  const materialOptions = uniqueOptions(optionRows.map((row) => row.material), "未填写材质");
  const sizeOptions = uniqueOptions(optionRows.map((row) => row.size), "未填写尺寸");
  const productionModelOptions = uniqueOptions(
    optionRows.map((row) => row.productionModel),
    "未填写生产 SKU",
  );
  const productionBatchOptions = uniqueOptions(
    optionRows.map((row) => row.productionBatch),
    "未填写生产批次",
  );

  function update(key: keyof ProductFilters, value: string) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <Drawer anchor="right" onClose={onClose} open={open}>
      <Box sx={{ width: { xs: 320, sm: 420 }, p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 800 }}>高级筛选</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              按产品来源显示对应字段，筛选结果会同步到地址栏。
            </Typography>
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel id="product-source-filter-label">产品来源</InputLabel>
            <Select
              label="产品来源"
              labelId="product-source-filter-label"
              onChange={(event) => update("source", event.target.value)}
              value={source}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="customer">客户送修</MenuItem>
              <MenuItem value="own">本厂生产</MenuItem>
            </Select>
          </FormControl>

          <FilterSelect
            label="产品类型"
            onChange={(value) => update("productType", value)}
            options={productTypeOptions}
            value={draft.productType ?? ""}
          />

          {source === "customer" ? (
            <FilterSelect
              label="客户公司"
              onChange={(value) => update("customer", value)}
              options={customerOptions}
              value={draft.customer ?? ""}
            />
          ) : null}

          {source === "own" ? (
            <>
              <Divider />
              <FilterSelect
                label="材质"
                onChange={(value) => update("material", value)}
                options={materialOptions}
                value={draft.material ?? ""}
              />
              <FilterSelect
                label="尺寸"
                onChange={(value) => update("size", value)}
                options={sizeOptions}
                value={draft.size ?? ""}
              />
              <TextField
                label="生产日期"
                onChange={(event) => update("productionDate", event.target.value)}
                size="small"
                type="date"
                value={draft.productionDate ?? ""}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <FilterSelect
                label="生产 SKU"
                onChange={(value) => update("productionModel", value)}
                options={productionModelOptions}
                value={draft.productionModel ?? ""}
              />
              <FilterSelect
                label="生产批次"
                onChange={(value) => update("productionBatch", value)}
                options={productionBatchOptions}
                value={draft.productionBatch ?? ""}
              />
            </>
          ) : null}

          {source === "" ? (
            <>
              <Divider />
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                选择产品来源后会显示该来源专属筛选项。通用字段可以先用主搜索或产品类型筛选。
              </Typography>
            </>
          ) : null}

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
            <Button onClick={onClear} variant="text">
              清除
            </Button>
            <Button onClick={onApply} variant="contained">
              应用筛选
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <MenuItem value="">全部</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function uniqueOptions(values: string[], emptyLabel: string) {
  const normalized = values.map((value) => value.trim());
  const hasEmpty = normalized.some((value) => !value);
  const options = Array.from(new Set(normalized.filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"))
    .map((value) => ({ label: value, value }));

  if (hasEmpty) {
    options.push({ label: emptyLabel, value: "__empty" });
  }

  return options;
}

function filterEntries(filters: ProductFilters) {
  const labels: Partial<Record<keyof ProductFilters, string>> = {
    customer: "客户公司",
    q: "搜索",
    material: "材质",
    productType: "产品类型",
    productionBatch: "生产批次",
    productionDate: "生产日期",
    productionModel: "生产 SKU",
    source: "来源",
    size: "尺寸",
  };
  const sourceLabels: Record<string, string> = {
    customer: "客户送修",
    own: "本厂生产",
  };

  return (Object.entries(filters) as Array<[keyof ProductFilters, string | undefined]>)
    .map(([key, value]) => {
      const normalized = value?.trim();
      if (!normalized) {
        return null;
      }
      if (!labels[key]) {
        return null;
      }

      return {
        key,
        label: labels[key],
        value:
          key === "source"
            ? sourceLabels[normalized] ?? normalized
            : normalized === "__empty"
              ? "未填写"
              : normalized,
      };
    })
    .filter(Boolean) as Array<{
      key: keyof ProductFilters;
      label: string;
      value: string;
    }>;
}

function ProductDeleteDialog({
  action,
  onClose,
  rows,
}: {
  action: (formData: FormData) => void;
  onClose: () => void;
  rows: ProductGridRow[];
}) {
  const open = rows.length > 0;

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {rows.length > 1 ? "批量删除产品" : "删除产品"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            确认删除 {rows.length} 个产品吗？
          </Typography>
          <Box
            sx={{
              bgcolor: "#f7f7f7",
              border: "1px solid",
              borderColor: "divider",
              maxHeight: 180,
              overflow: "auto",
              p: 2,
            }}
          >
            <Stack spacing={1}>
              {rows.map((row) => (
                <Typography key={row.id} sx={{ fontFamily: "monospace", fontWeight: 800 }}>
                  {row.serialNumber}
                </Typography>
              ))}
            </Stack>
          </Box>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            删除后会同时删除该产品下的维修记录、维修项目、图片记录和已上传的维修图片文件。此操作不可恢复。
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="text">
          取消
        </Button>
        <form action={action}>
          {rows.map((row) => (
            <input key={row.id} name="product_id" type="hidden" value={row.id} />
          ))}
          <DeleteSubmitButton label={rows.length > 1 ? "确认批量删除" : "确认删除"} />
        </form>
      </DialogActions>
    </Dialog>
  );
}

function DeleteSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <LoadingButton color="error" loading={pending} type="submit" variant="contained">
      {label}
    </LoadingButton>
  );
}
