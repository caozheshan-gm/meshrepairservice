"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useFormStatus } from "react-dom";

type DeleteRepairRecordButtonProps = {
  action: (formData: FormData) => void;
  productId: string;
  repairId: string;
  repairNumber: number;
};

export function DeleteRepairRecordButton({
  action,
  productId,
  repairId,
  repairNumber,
}: DeleteRepairRecordButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        color="error"
        onClick={() => setOpen(true)}
        size="small"
        startIcon={<DeleteOutlineIcon />}
        variant="outlined"
      >
        删除
      </Button>

      <Dialog fullWidth maxWidth="xs" onClose={() => setOpen(false)} open={open}>
        <DialogTitle sx={{ fontWeight: 800 }}>删除维修记录</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography>
              确认删除第 {repairNumber} 次维修记录吗？
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              此操作会删除该维修记录、维修项目和图片记录；已上传的维修图片文件也会一并清理。删除后不可恢复。
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)} variant="text">
            取消
          </Button>
          <form action={action}>
            <input name="product_id" type="hidden" value={productId} />
            <input name="repair_id" type="hidden" value={repairId} />
            <DeleteSubmitButton />
          </form>
        </DialogActions>
      </Dialog>
    </>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <LoadingButton
      color="error"
      loading={pending}
      type="submit"
      variant="contained"
    >
      确认删除
    </LoadingButton>
  );
}
