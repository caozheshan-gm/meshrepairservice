import Chip, { type ChipProps } from "@mui/material/Chip";
import * as React from "react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  variant?: BadgeVariant;
}

function mapBadge(variant: BadgeVariant | undefined): Pick<ChipProps, "color" | "variant"> {
  switch (variant) {
    case "outline":
      return { color: "default", variant: "outlined" };
    case "secondary":
      return { color: "secondary", variant: "outlined" };
    case "destructive":
      return { color: "error", variant: "filled" };
    default:
      return { color: "primary", variant: "filled" };
  }
}

function Badge({ children, className, variant, ...props }: BadgeProps) {
  const mapped = mapBadge(variant);
  return (
    <Chip
      className={className}
      label={children}
      size="small"
      {...mapped}
      {...props}
    />
  );
}

export { Badge };
