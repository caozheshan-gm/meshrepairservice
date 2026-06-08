"use client";

import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";
import * as React from "react";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  asChild?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

function mapVariant(variant: ButtonVariant | undefined): Pick<MuiButtonProps, "color" | "variant"> {
  switch (variant) {
    case "outline":
      return { color: "secondary", variant: "outlined" };
    case "secondary":
      return { color: "secondary", variant: "contained" };
    case "ghost":
    case "link":
      return { color: "secondary", variant: "text" };
    case "destructive":
      return { color: "error", variant: "contained" };
    default:
      return { color: "primary", variant: "contained" };
  }
}

function mapSize(size: ButtonSize | undefined): MuiButtonProps["size"] {
  if (size === "sm" || size === "icon") return "small";
  if (size === "lg") return "large";
  return "medium";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, children, className, size, variant, ...props }, ref) => {
    const mappedVariant = mapVariant(variant);
    const muiClassName = [
      "MuiButtonBase-root",
      "MuiButton-root",
      `MuiButton-${mappedVariant.variant}`,
      `MuiButton-${mappedVariant.variant}${mappedVariant.color?.[0]?.toUpperCase()}${mappedVariant.color?.slice(1)}`,
      "inline-flex items-center justify-center",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    if (asChild) {
      if (!React.isValidElement<{ className?: string }>(children)) {
        throw new Error("Button with asChild expects a single React element child.");
      }

      return React.cloneElement(children, {
        className: [muiClassName, children.props.className].filter(Boolean).join(" "),
        ...props,
      });
    }

    return (
      <MuiButton
        className={className}
        ref={ref}
        size={mapSize(size)}
        {...mappedVariant}
        {...props}
      >
        {children}
      </MuiButton>
    );
  },
);
Button.displayName = "Button";

export { Button };
