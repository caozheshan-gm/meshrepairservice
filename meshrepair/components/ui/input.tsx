import OutlinedInput from "@mui/material/OutlinedInput";
import * as React from "react";

type InputProps = Omit<React.ComponentProps<"input">, "color" | "size">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <OutlinedInput
      className={className}
      inputRef={ref}
      size="small"
      type={type}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
