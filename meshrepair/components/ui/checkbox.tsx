"use client";

import MuiCheckbox from "@mui/material/Checkbox";
import * as React from "react";

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof MuiCheckbox>
>(({ className, ...props }, ref) => (
  <MuiCheckbox className={className} ref={ref} size="small" {...props} />
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
