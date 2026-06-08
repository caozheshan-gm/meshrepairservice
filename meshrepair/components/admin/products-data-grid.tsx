"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

export type ProductGridRow = {
  customer: string;
  id: string;
  latestRepairDate: string;
  productSource: "customer" | "own" | string;
  productType: string;
  repairCount: number;
  serialNumber: string;
  status: string;
};

export function ProductsDataGrid({ rows }: { rows: ProductGridRow[] }) {
  const router = useRouter();

  if (rows.length === 0) {
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
        暂无产品。可以先新增一件产品生成序列号和二维码。
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} square variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#f2f2f2" }}>
            <TableCell sx={{ fontWeight: 800 }}>序列号</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>产品类型</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>来源 / 客户</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>来源</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>维修次数</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>最近维修</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>状态</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              hover
              key={row.id}
              onClick={() => router.push(`/admin/products/${row.id}`)}
              sx={{ cursor: "pointer" }}
            >
              <TableCell>
                <Typography sx={{ fontFamily: "monospace", fontWeight: 800 }}>
                  {row.serialNumber}
                </Typography>
              </TableCell>
              <TableCell>{row.productType}</TableCell>
              <TableCell>{row.customer}</TableCell>
              <TableCell>
                <Chip
                  color={row.productSource === "own" ? "secondary" : "primary"}
                  label={row.productSource === "own" ? "本厂生产" : "客户送修"}
                  size="small"
                  variant={row.productSource === "own" ? "outlined" : "filled"}
                />
              </TableCell>
              <TableCell>{row.repairCount}</TableCell>
              <TableCell>{row.latestRepairDate || "无"}</TableCell>
              <TableCell>
                <Chip
                  label={row.status === "active" ? "公开使用" : "归档隐藏"}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
