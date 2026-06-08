import InputLabel from "@mui/material/InputLabel";
import * as React from "react";

const Label = React.forwardRef<
  HTMLLabelElement,
  Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "color">
>(({ className, ...props }, ref) => (
  <InputLabel className={className} ref={ref} shrink {...props} />
));
Label.displayName = "Label";

export { Label };
